import {
  addDoc,
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAt,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

// User operations
export const userService = {
  // Get user by ID
  async getUserById(uid: string) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  },

  // Update user profile
  async updateUserProfile(uid: string, data: any) {
    await updateDoc(doc(db, "users", uid), data);
  },

  // Search users by email (prefix match, case-sensitive as stored)
  async searchUsersByEmail(emailQuery: string, options?: { limit?: number }) {
    const sanitized = (emailQuery || "").trim();
    if (sanitized.length === 0) return [];

    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      orderBy("email"),
      startAt(sanitized),
      endAt(sanitized + "\uf8ff"),
      ...(options?.limit ? [limit(options.limit)] : [])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // Convert image to base64 and save to Firestore (alternative to Firebase Storage)
  async uploadAvatar(uid: string, file: Blob) {
    try {
      console.log("Converting avatar to base64 for user:", uid);
      console.log("File size:", file.size, "bytes");
      console.log("File type:", file.type);

      // Convert blob to base64 (already optimized by ImagePicker quality setting)
      const base64 = await this.blobToBase64(file);
      console.log("Base64 conversion successful, length:", base64.length);

      // Check if base64 is too long (Firebase Auth limit is ~2048 chars)
      if (base64.length > 1500) {
        console.warn(
          "Base64 string is quite long:",
          base64.length,
          "characters"
        );
      }

      // Save base64 directly to Firestore
      await this.updateUserProfile(uid, {
        avatar: base64,
        avatarType: file.type || "image/jpeg",
        avatarUpdatedAt: new Date().toISOString(),
      });

      console.log("Avatar saved to Firestore successfully");
      return base64; // Return base64 as "URL"
    } catch (error) {
      console.error("Error uploading avatar:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      throw error;
    }
  },

  // Helper function to convert blob to base64
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get pure base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
};

// Chat operations
export const chatService = {
  // Create a new chat or restore existing one
  async createChat(participants: string[], chatName?: string) {
    // Sort participants to ensure consistent chat ID for same users
    const sortedParticipants = [...participants].sort();

    // Check if chat already exists (including cleared ones)
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", participants[0])
    );
    const querySnapshot = await getDocs(q);
    const allChats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const existingChat = allChats.find(
      (chat: any) =>
        chat.participants &&
        chat.participants.length === sortedParticipants.length &&
        chat.participants.every((id: string) => sortedParticipants.includes(id))
    );

    if (existingChat) {
      // Check if any participant has cleared this chat
      const clearedBy = existingChat.clearedBy || {};
      const clearedParticipants = Object.keys(clearedBy);

      if (clearedParticipants.length > 0) {
        console.log(
          "Restoring chat for cleared participants:",
          clearedParticipants
        );

        // Restore chat for cleared participants
        const updatedClearedBy = { ...clearedBy };
        clearedParticipants.forEach((userId) => {
          delete updatedClearedBy[userId];
        });

        // Update clearedBy field
        await updateDoc(doc(db, "chats", existingChat.id), {
          clearedBy: updatedClearedBy,
        });

        // Restore message visibility for cleared participants
        for (const userId of clearedParticipants) {
          await this.updateMessagesVisibility(existingChat.id, userId, true);
        }

        console.log("Chat restored successfully");
      }

      return { id: existingChat.id };
    }

    const chatData = {
      participants: sortedParticipants,
      chatName: chatName || null, // Don't set default name for 1:1 chats
      createdAt: Timestamp.now(),
      lastMessage: null,
      lastMessageTime: null,
      // Track who has cleared this chat
      clearedBy: {},
    };
    return await addDoc(collection(db, "chats"), chatData);
  },

  // Get user's chats
  async getUserChats(uid: string) {
    // Use simple query to avoid index requirement
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid)
    );
    const querySnapshot = await getDocs(q);
    const allChats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter out chats that user has cleared
    const activeChats = allChats.filter((chat) => {
      const clearedBy = chat.clearedBy || {};
      return !clearedBy[uid]; // Only show chats user hasn't cleared
    });

    // Sort manually by lastMessageTime
    return activeChats.sort((a, b) => {
      const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
      const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
      return timeB.getTime() - timeA.getTime();
    });
  },

  // Send message
  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    type: string = "text"
  ) {
    // Get chat participants to set visibleTo
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    const participants = chatData?.participants || [];

    // Only include participants who haven't cleared the chat
    const clearedBy = chatData?.clearedBy || {};
    const activeParticipants = participants.filter(
      (uid: string) => !clearedBy[uid]
    );

    console.log("Active participants for message:", activeParticipants);

    const messageData = {
      chatId,
      senderId,
      content,
      type,
      timestamp: Timestamp.now(),
      reactions: {},
      edited: false,
      // Track who can see this message
      visibleTo: activeParticipants,
    };
    const messageRef = await addDoc(collection(db, "messages"), messageData);

    // Update chat's last message
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: content,
      lastMessageTime: Timestamp.now(),
      lastMessageSenderId: senderId,
    });

    return messageRef;
  },

  // Get messages for a chat
  async getChatMessages(
    chatId: string,
    limitCount: number = 50,
    userId?: string
  ) {
    try {
      // First try with compound query (requires index)
      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      let messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by visibility if userId provided
      if (userId) {
        messages = messages.filter((message) => {
          const visibleTo = message.visibleTo || [];
          return visibleTo.includes(userId);
        });
      }

      return messages;
    } catch (error: any) {
      if (error.code === "failed-precondition") {
        console.log("Messages index not found, falling back to simple query");
        // Fallback to simple query without orderBy
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", chatId),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        let messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter by visibility if userId provided
        if (userId) {
          messages = messages.filter((message) => {
            const visibleTo = message.visibleTo || [];
            return visibleTo.includes(userId);
          });
        }

        // Sort manually by timestamp
        return messages.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeB.getTime() - timeA.getTime();
        });
      }
      throw error;
    }
  },

  // Clear chat for current user (hide from their chat list but keep chat link)
  async clearChatForUser(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const clearedBy = chatData.clearedBy || {};

        // Mark user as having cleared this chat
        clearedBy[userId] = Timestamp.now();

        // Update clearedBy field
        await updateDoc(chatRef, {
          clearedBy: clearedBy,
        });

        // Remove user from visibleTo of all messages in this chat
        await this.updateMessagesVisibility(chatId, userId, false);
      }
    } catch (error) {
      console.log("Clear chat error:", error);
      throw error;
    }
  },

  // Update message visibility for a user
  async updateMessagesVisibility(
    chatId: string,
    userId: string,
    isVisible: boolean
  ) {
    try {
      const messagesQuery = query(
        collection(db, "messages"),
        where("chatId", "==", chatId)
      );
      const querySnapshot = await getDocs(messagesQuery);

      const batch = [];
      querySnapshot.docs.forEach((doc) => {
        const messageData = doc.data();
        const visibleTo = messageData.visibleTo || [];

        let updatedVisibleTo;
        if (isVisible) {
          // Add user to visibleTo if not already present
          if (!visibleTo.includes(userId)) {
            updatedVisibleTo = [...visibleTo, userId];
          }
        } else {
          // Remove user from visibleTo
          updatedVisibleTo = visibleTo.filter((uid: string) => uid !== userId);
        }

        if (updatedVisibleTo) {
          batch.push(updateDoc(doc.ref, { visibleTo: updatedVisibleTo }));
        }
      });

      // Execute all updates
      await Promise.all(batch);
    } catch (error) {
      console.log("Update messages visibility error:", error);
      throw error;
    }
  },

  // Listen to real-time chat updates (for last message)
  listenToChatUpdates(userId: string, callback: (chats: any[]) => void) {
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId)
      );

      return onSnapshot(
        q,
        (querySnapshot) => {
          const allChats = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter out chats that user has cleared
          const activeChats = allChats.filter((chat) => {
            const clearedBy = chat.clearedBy || {};
            return !clearedBy[userId];
          });

          // Sort manually by lastMessageTime
          const sortedChats = activeChats.sort((a, b) => {
            const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
            const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
            return timeB.getTime() - timeA.getTime();
          });

          console.log("Real-time chat updates received:", sortedChats.length);
          callback(sortedChats);
        },
        (error) => {
          console.log("Listen to chat updates error:", error);
        }
      );
    } catch (error) {
      console.log("Listen to chat updates setup error:", error);
      return null;
    }
  },

  // Listen to real-time messages for a chat
  listenToMessages(
    chatId: string,
    userId: string,
    callback: (messages: any[]) => void
  ) {
    try {
      // Use simple query to avoid index requirement
      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        limit(50)
      );

      return onSnapshot(
        q,
        (querySnapshot) => {
          let messages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter by visibility
          messages = messages.filter((message) => {
            const visibleTo = message.visibleTo || [];
            return visibleTo.includes(userId);
          });

          // Sort by timestamp (oldest first)
          messages.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(0);
            const timeB = b.timestamp?.toDate?.() || new Date(0);
            return timeA.getTime() - timeB.getTime();
          });

          console.log("Real-time messages updated:", messages.length);
          callback(messages);
        },
        (error) => {
          console.log("Listen to messages error:", error);
        }
      );
    } catch (error) {
      console.log("Listen to messages setup error:", error);
      return null;
    }
  },
};

// File operations
export const fileService = {
  // Upload file
  async uploadFile(file: Blob, path: string) {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  },

  // Delete file
  async deleteFile(path: string) {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  },
};

// Poll operations
export const pollService = {
  // Create poll
  async createPoll(
    chatId: string,
    creatorId: string,
    question: string,
    options: string[]
  ) {
    const pollData = {
      chatId,
      creatorId,
      question,
      options: options.map((option) => ({
        text: option,
        votes: 0,
        voters: [],
      })),
      createdAt: Timestamp.now(),
      expiresAt: null,
      isActive: true,
    };
    return await addDoc(collection(db, "polls"), pollData);
  },

  // Vote on poll
  async votePoll(pollId: string, optionIndex: number, voterId: string) {
    const pollRef = doc(db, "polls", pollId);
    const pollDoc = await getDoc(pollRef);

    if (pollDoc.exists()) {
      const pollData = pollDoc.data();
      const options = [...pollData.options];

      // Remove previous vote if exists
      options.forEach((option) => {
        const voterIndex = option.voters.indexOf(voterId);
        if (voterIndex > -1) {
          option.voters.splice(voterIndex, 1);
          option.votes--;
        }
      });

      // Add new vote
      options[optionIndex].voters.push(voterId);
      options[optionIndex].votes++;

      await updateDoc(pollRef, { options });
    }
  },

  // Get polls for chat
  async getChatPolls(chatId: string) {
    const q = query(
      collection(db, "polls"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
