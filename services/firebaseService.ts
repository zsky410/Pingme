import {
  addDoc,
  collection,
  deleteDoc,
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";

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
      console.log(
        "Base64 conversion successful, length:",
        base64.length,
        "characters"
      );

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
    } catch (error: any) {
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
    const allChats = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as any)
    );

    const existingChat = allChats.find(
      (chat: any) =>
        chat.participants &&
        chat.participants.length === sortedParticipants.length &&
        chat.participants.every((id: string) => sortedParticipants.includes(id))
    );

    if (existingChat) {
      console.log("Chat already exists, returning existing chat");
      return { id: existingChat.id };
    }

    const chatData = {
      participants: sortedParticipants,
      chatName: chatName || null, // Don't set default name for 1:1 chats
      createdAt: Timestamp.now(),
      lastMessage: null,
      lastMessageTime: null,
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
    const allChats = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as any)
    );

    // Filter out chats that user has cleared
    // Sort manually by lastMessageTime
    return allChats.sort((a: any, b: any) => {
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

    console.log("Participants for message:", participants);

    const messageData = {
      chatId,
      senderId,
      content,
      type,
      timestamp: Timestamp.now(),
      reactions: {},
      edited: false,
      // Track who can see this message
      visibleTo: participants,
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

  // Send voice message
  async sendVoiceMessage(
    chatId: string,
    senderId: string,
    duration: number,
    audioUri: string
  ) {
    // Get chat participants to set visibleTo
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    const participants = chatData?.participants || [];

    console.log("Sending voice message, participants:", participants);

    const messageData = {
      chatId,
      senderId,
      content: `🎤 Voice message (${duration}s)`, // Fallback text for last message
      type: "voice",
      duration: duration,
      audioUri: audioUri,
      timestamp: Timestamp.now(),
      reactions: {},
      edited: false,
      visibleTo: participants,
    };

    const messageRef = await addDoc(collection(db, "messages"), messageData);

    // Update chat's last message
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: `🎤 Voice message (${duration}s)`,
      lastMessageTime: Timestamp.now(),
      lastMessageSenderId: senderId,
    });

    return messageRef;
  },

  // Send file message
  async sendFileMessage(
    chatId: string,
    senderId: string,
    fileName: string,
    fileSize: string,
    fileUri: string
  ) {
    // Get chat participants to set visibleTo
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    const participants = chatData?.participants || [];

    console.log("Sending file message, participants:", participants);

    const messageData = {
      chatId,
      senderId,
      content: `📎 ${fileName}`, // Fallback text for last message
      type: "file",
      fileName: fileName,
      fileSize: fileSize,
      fileUri: fileUri,
      timestamp: Timestamp.now(),
      reactions: {},
      edited: false,
      visibleTo: participants,
    };

    const messageRef = await addDoc(collection(db, "messages"), messageData);

    // Update chat's last message
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: `📎 ${fileName}`,
      lastMessageTime: Timestamp.now(),
      lastMessageSenderId: senderId,
    });

    return messageRef;
  },

  // Edit message
  async editMessage(messageId: string, userId: string, newContent: string) {
    try {
      // First, get the message to check if user is the sender
      const messageRef = doc(db, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error("Message not found");
      }

      const messageData = messageDoc.data();

      // Only allow editing if user is the sender
      if (messageData.senderId !== userId) {
        throw new Error("You can only edit your own messages");
      }

      // Update the message content and mark as edited
      await updateDoc(messageRef, {
        content: newContent,
        edited: true,
        editedAt: Timestamp.now(),
      });

      console.log("Message edited successfully:", messageId);
      return true;
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  },

  // Delete message
  async deleteMessage(messageId: string, userId: string) {
    try {
      // First, get the message to check if user is the sender
      const messageRef = doc(db, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error("Message not found");
      }

      const messageData = messageDoc.data();

      // Only allow deletion if user is the sender
      if (messageData.senderId !== userId) {
        throw new Error("You can only delete your own messages");
      }

      // Get current deletedBy array
      const deletedBy = messageData.deletedBy || [];

      // Add current user to deletedBy array
      const updatedDeletedBy = [...deletedBy, userId];

      // Check if all participants have deleted this message
      const chatRef = doc(db, "chats", messageData.chatId);
      const chatDoc = await getDoc(chatRef);
      const chatData = chatDoc.data();
      const participants = chatData?.participants || [];

      // If all participants have deleted, remove message completely
      if (updatedDeletedBy.length >= participants.length) {
        await deleteDoc(messageRef);
        console.log("Message completely deleted:", messageId);
      } else {
        // Otherwise, just mark as deleted by this user and remove from visibleTo
        const visibleTo = messageData.visibleTo || [];
        const updatedVisibleTo = visibleTo.filter(
          (uid: string) => uid !== userId
        );

        await updateDoc(messageRef, {
          deletedBy: updatedDeletedBy,
          deletedAt: Timestamp.now(),
          visibleTo: updatedVisibleTo,
        });
        console.log("Message marked as deleted by user:", messageId, userId);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
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
      let messages = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as any)
      );

      // Filter by visibility if userId provided
      if (userId) {
        messages = messages.filter((message) => {
          const visibleTo = message.visibleTo || [];
          const deletedBy = message.deletedBy || [];
          return visibleTo.includes(userId) && !deletedBy.includes(userId);
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
          messages = messages.filter((message: any) => {
            const visibleTo = message.visibleTo || [];
            const deletedBy = message.deletedBy || [];
            return visibleTo.includes(userId) && !deletedBy.includes(userId);
          });
        }

        // Sort manually by timestamp
        return messages.sort((a: any, b: any) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeB.getTime() - timeA.getTime();
        });
      }
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

      const batch: any[] = [];
      querySnapshot.docs.forEach((doc) => {
        const messageData = doc.data();

        // Skip messages that have been deleted by current user
        const deletedBy = messageData.deletedBy || [];
        if (deletedBy.includes(userId)) {
          return;
        }

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
          const allChats = querySnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as any)
          );

          // Filter out chats without messages
          const activeChats = allChats.filter((chat: any) => {
            const hasMessages =
              chat.lastMessage && chat.lastMessage.trim() !== "";
            return hasMessages;
          });

          // Sort manually by lastMessageTime
          const sortedChats = activeChats.sort((a: any, b: any) => {
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
          let messages = querySnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as any)
          );

          // Filter by visibility and exclude messages deleted by current user
          messages = messages.filter((message) => {
            const visibleTo = message.visibleTo || [];
            const deletedBy = message.deletedBy || [];
            return visibleTo.includes(userId) && !deletedBy.includes(userId);
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
    try {
      console.log("Starting file upload:", {
        path,
        fileSize: file.size,
        fileType: file.type,
      });

      const fileRef = ref(storage, path);

      // Try upload without metadata first (simpler approach)
      console.log("Attempting upload without metadata...");
      await uploadBytes(fileRef, file);
      console.log("Upload successful, getting download URL...");

      const downloadURL = await getDownloadURL(fileRef);
      console.log("Download URL obtained:", downloadURL);

      return downloadURL;
    } catch (error: any) {
      console.error("Upload error details:", {
        error: error,
        code: error?.code,
        message: error?.message,
        path,
        fileSize: file.size,
        fileType: file.type,
      });
      throw error;
    }
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
