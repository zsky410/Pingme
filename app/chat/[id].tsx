import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import FileAttachment from "@/components/chat/FileAttachment";
import ImageMessage from "@/components/chat/ImageMessage";
import VideoMessage from "@/components/chat/VideoMessage";
import ImageViewer from "@/components/chat/ImageViewer";
import VideoPlayer from "@/components/chat/VideoPlayer";
import MessageOptionsSheet, {
  MessageOption,
} from "@/components/chat/MessageOptionsSheet";
import EditMessageModal from "@/components/chat/EditMessageModal";
import MessageReactions from "@/components/chat/MessageReactions";
import ReactionDetailsSheet, {
  ReactionUser,
} from "@/components/chat/ReactionDetailsSheet";
import EmojiPickerSheet from "@/components/chat/EmojiPickerSheet";
import MentionSuggestions, {
  MentionUser,
} from "@/components/chat/MentionSuggestions";
import MentionText from "@/components/chat/MentionText";
import AttachmentMenu from "@/components/chat/AttachmentMenu";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import VoiceMessage from "@/components/chat/VoiceMessage";
import PollMessage from "@/components/chat/PollMessage";
import { usePolls, Poll } from "@/contexts/PollContext";

type MessageType = "text" | "file" | "image" | "video" | "voice" | "poll";

interface Reaction {
  emoji: string;
  count: number;
  users: ReactionUser[];
}

interface Message {
  id: string;
  type: MessageType;
  text?: string;
  time: string;
  isMine: boolean;
  status?: "sent" | "delivered" | "read";
  // For file type
  fileName?: string;
  fileSize?: string;
  fileDate?: string;
  // For image/video type
  imageUri?: string;
  videoUri?: string;
  thumbnailUri?: string;
  // For voice type
  voiceUri?: string;
  duration?: number; // Duration in seconds
  // Additional features
  reactions?: Reaction[];
  translatedText?: string;
  isEdited?: boolean;
  // For group chat
  senderName?: string;
  senderAvatar?: string;
  // For poll type
  poll?: Poll;
}

const SAMPLE_GROUP_MESSAGES: Message[] = [
  {
    id: "g1",
    type: "text",
    text: "Hey everyone! Welcome to the group! 🎉",
    time: "9:15 am",
    isMine: false,
    senderName: "Sarah Wilson",
    senderAvatar: "https://i.pravatar.cc/150?img=10",
  },
  {
    id: "g2",
    type: "text",
    text: "Thanks @sarah! Happy to be here",
    time: "9:16 am",
    isMine: false,
    senderName: "Mike Chen",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "g3",
    type: "text",
    text: "Great to join this group! Looking forward to collaborating 😊",
    time: "9:17 am",
    isMine: true,
    status: "read",
  },
  {
    id: "g4",
    type: "text",
    text: "Should we schedule our first meeting?",
    time: "9:20 am",
    isMine: false,
    senderName: "Emily Davis",
    senderAvatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "g5",
    type: "text",
    text: "That's a good idea! What time works for everyone?",
    time: "9:21 am",
    isMine: false,
    senderName: "John Smith",
    senderAvatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: "g6",
    type: "text",
    text: "How about tomorrow at 2 PM?",
    time: "9:22 am",
    isMine: true,
    status: "read",
  },
  {
    id: "g7",
    type: "text",
    text: "Works for me! 👍",
    time: "9:23 am",
    isMine: false,
    senderName: "Mike Chen",
    senderAvatar: "https://i.pravatar.cc/150?img=12",
    reactions: [
      {
        emoji: "👍",
        count: 3,
        users: [
          {
            id: "1",
            name: "Mike Chen",
            avatar: "https://i.pravatar.cc/150?img=12",
          },
          {
            id: "2",
            name: "Emily Davis",
            avatar: "https://i.pravatar.cc/150?img=5",
          },
          {
            id: "3",
            name: "John Smith",
            avatar: "https://i.pravatar.cc/150?img=8",
          },
        ],
      },
    ],
  },
  {
    id: "g8",
    type: "text",
    text: "Perfect! I'll send out a calendar invite",
    time: "9:24 am",
    isMine: false,
    senderName: "Sarah Wilson",
    senderAvatar: "https://i.pravatar.cc/150?img=10",
  },
  {
    id: "g9",
    type: "image",
    imageUri: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
    time: "9:30 am",
    isMine: false,
    senderName: "Emily Davis",
    senderAvatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "g10",
    type: "text",
    text: "Great! See you all tomorrow 🚀",
    time: "9:32 am",
    isMine: true,
    status: "read",
    reactions: [
      {
        emoji: "🚀",
        count: 4,
        users: [
          {
            id: "1",
            name: "Sarah Wilson",
            avatar: "https://i.pravatar.cc/150?img=10",
          },
          {
            id: "2",
            name: "Mike Chen",
            avatar: "https://i.pravatar.cc/150?img=12",
          },
          {
            id: "3",
            name: "Emily Davis",
            avatar: "https://i.pravatar.cc/150?img=5",
          },
          {
            id: "4",
            name: "John Smith",
            avatar: "https://i.pravatar.cc/150?img=8",
          },
        ],
      },
    ],
  },
  {
    id: "g11",
    type: "voice",
    duration: 12,
    voiceUri: "mock-voice-uri",
    time: "9:35 am",
    isMine: false,
    senderName: "Emily Davis",
    senderAvatar: "https://i.pravatar.cc/150?img=5",
  },
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    type: "text",
    text: "Sure! Sending them over now.",
    time: "4:56 pm",
    isMine: false,
  },
  {
    id: "1a",
    type: "text",
    text: "Hey @john @alex, can you check this out?",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "2",
    type: "text",
    text: "Awesome! Can I see a couple of pictures?",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "3",
    type: "text",
    text: "Thanks! Looks good.",
    time: "4:56 pm",
    isMine: true,
    status: "read",
    isEdited: true,
  },
  {
    id: "4",
    type: "text",
    text: "I'll take it. Can you ship it?",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "5",
    type: "text",
    text: "Absolutely. Just send your address, and I'll ship it out.",
    time: "4:56 pm",
    isMine: false,
  },
  {
    id: "6",
    type: "text",
    text: "Great, I'll send it now. Thanks!",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "7",
    type: "text",
    text: "Thank you!",
    time: "4:56 pm",
    isMine: false,
  },
  {
    id: "8",
    type: "file",
    fileName: "File.pdf",
    fileSize: "200 KB",
    fileDate: "15 Oct, 2024",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "9",
    type: "file",
    fileName: "File.pdf",
    fileSize: "200 KB",
    fileDate: "15 Oct, 2024",
    time: "4:56 pm",
    isMine: false,
  },
  {
    id: "10",
    type: "image",
    imageUri:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "11",
    type: "image",
    imageUri:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    time: "4:56 pm",
    isMine: false,
  },
  {
    id: "12",
    type: "video",
    videoUri: "https://sample-video.com/video.mp4",
    thumbnailUri:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "13",
    type: "video",
    videoUri: "https://sample-video.com/video.mp4",
    thumbnailUri:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
    time: "4:56 pm",
    isMine: false,
  },
  {
    id: "14",
    type: "voice",
    duration: 15,
    voiceUri: "mock-voice-uri",
    time: "4:56 pm",
    isMine: true,
    status: "read",
  },
  {
    id: "15",
    type: "voice",
    duration: 8,
    voiceUri: "mock-voice-uri",
    time: "4:56 pm",
    isMine: false,
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getPendingPoll, clearPendingPoll } = usePolls();

  // Determine if this is a group chat (id starts with "group-" or is "2" for Uber Cars group)
  const isGroupChat =
    typeof id === "string" && (id.startsWith("group-") || id === "2");

  const [messages, setMessages] = useState<Message[]>(
    isGroupChat ? SAMPLE_GROUP_MESSAGES : SAMPLE_MESSAGES
  );

  // Check for pending poll when screen becomes focused
  useFocusEffect(
    useCallback(() => {
      if (id && typeof id === "string") {
        const pendingPoll = getPendingPoll(id);
        if (pendingPoll) {
          const pollMessage: Message = {
            id: pendingPoll.id,
            type: "poll",
            text: pendingPoll.question,
            time: new Date()
              .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .toLowerCase(),
            isMine: true,
            status: "sent",
            poll: pendingPoll,
          };
          setMessages((prev) => {
            // Check if poll already exists to prevent duplicates
            const exists = prev.some((msg) => msg.id === pendingPoll.id);
            if (exists) return prev;
            return [...prev, pollMessage];
          });
          clearPendingPoll(id);
        }
      }
    }, [id, getPendingPoll, clearPendingPoll])
  );
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string;
    thumbnail: string;
  } | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    "😍",
    "👍",
    "🔥",
    "😊",
    "❤️",
    "😂",
  ]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  // Ref for scrolling to bottom
  const flatListRef = useRef<FlatList>(null);

  // Mock group members for mentions
  const GROUP_MEMBERS: MentionUser[] = [
    {
      id: "1",
      name: "Alex Mason",
      username: "alex",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Andrew Joseph",
      username: "andrew",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      name: "Avery Quinn",
      username: "avery",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: "4",
      name: "Brian Michael",
      username: "brian",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: "5",
      name: "Cameron Lee",
      username: "cameron",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: "6",
      name: "Charles Dean",
      username: "charles",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    {
      id: "7",
      name: "John Doe",
      username: "john",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
  ];

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "text",
        text: inputText,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        isMine: true,
        status: "sent",
      };
      setMessages([...messages, newMessage]);
      setInputText("");
    }
  };

  const handleLongPress = (message: Message) => {
    setSelectedMessage(message);
    setShowOptionsSheet(true);
  };

  const handleCopy = async () => {
    if (selectedMessage?.text) {
      await Clipboard.setStringAsync(selectedMessage.text);
      Alert.alert("Copied", "Message copied to clipboard");
    }
  };

  const handleTranslate = () => {
    if (selectedMessage) {
      // Mock translation - in real app, call translation API
      const mockTranslation =
        "बहुत बढ़िया! क्या मैं कुछ तस्वीरें देख सकता हूं?";
      setMessages(
        messages.map((msg) =>
          msg.id === selectedMessage.id
            ? { ...msg, translatedText: mockTranslation }
            : msg
        )
      );
    }
  };

  const handleEdit = () => {
    if (selectedMessage?.isMine) {
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = (newText: string) => {
    if (selectedMessage) {
      setMessages(
        messages.map((msg) =>
          msg.id === selectedMessage.id
            ? { ...msg, text: newText, isEdited: true }
            : msg
        )
      );
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      Alert.alert(
        "Delete Message",
        "Are you sure you want to delete this message?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setMessages(
                messages.filter((msg) => msg.id !== selectedMessage.id)
              );
            },
          },
        ]
      );
    }
  };

  const handleReaction = (emoji: string) => {
    if (selectedMessage) {
      // Add to recent emojis
      setRecentEmojis((prev) => {
        const filtered = prev.filter((e) => e !== emoji);
        return [emoji, ...filtered].slice(0, 32);
      });

      setMessages(
        messages.map((msg) => {
          if (msg.id === selectedMessage.id) {
            const existingReactions = msg.reactions || [];
            const existingReaction = existingReactions.find(
              (r) => r.emoji === emoji
            );

            let newReactions;
            if (existingReaction) {
              // Check if user already reacted with this emoji
              const alreadyReacted = existingReaction.users.some(
                (u) => u.id === "me"
              );

              if (alreadyReacted) {
                // TOGGLE: Remove user's reaction
                const newUsers = existingReaction.users.filter(
                  (u) => u.id !== "me"
                );
                const newCount = existingReaction.count - 1;

                if (newCount === 0) {
                  // Remove entire reaction if no users left
                  newReactions = existingReactions.filter(
                    (r) => r.emoji !== emoji
                  );
                } else {
                  // Update reaction with removed user
                  newReactions = existingReactions.map((r) =>
                    r.emoji === emoji
                      ? { ...r, count: newCount, users: newUsers }
                      : r
                  );
                }
              } else {
                // Remove all other reactions from "me" first (only 1 reaction allowed)
                const cleanedReactions = existingReactions
                  .map((r) => ({
                    ...r,
                    users: r.users.filter((u) => u.id !== "me"),
                    count: r.users.filter((u) => u.id !== "me").length,
                  }))
                  .filter((r) => r.count > 0);

                // Add current user to this emoji reaction
                const cleanedExisting = cleanedReactions.find(
                  (r) => r.emoji === emoji
                );

                if (cleanedExisting) {
                  newReactions = cleanedReactions.map((r) =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          count: r.count + 1,
                          users: [
                            ...r.users,
                            {
                              id: "me",
                              name: "You",
                              avatar: "https://i.pravatar.cc/150?img=10",
                            },
                          ],
                        }
                      : r
                  );
                } else {
                  newReactions = [
                    ...cleanedReactions,
                    {
                      emoji,
                      count: 1,
                      users: [
                        {
                          id: "me",
                          name: "You",
                          avatar: "https://i.pravatar.cc/150?img=10",
                        },
                      ],
                    },
                  ];
                }
              }
            } else {
              // Remove all other reactions from "me" first (only 1 reaction allowed)
              const cleanedReactions = existingReactions
                .map((r) => ({
                  ...r,
                  users: r.users.filter((u) => u.id !== "me"),
                  count: r.users.filter((u) => u.id !== "me").length,
                }))
                .filter((r) => r.count > 0);

              // Create new reaction with this emoji
              newReactions = [
                ...cleanedReactions,
                {
                  emoji,
                  count: 1,
                  users: [
                    {
                      id: "me",
                      name: "You",
                      avatar: "https://i.pravatar.cc/150?img=10",
                    },
                  ],
                },
              ];
            }

            return { ...msg, reactions: newReactions };
          }
          return msg;
        })
      );
    }
  };

  const handleQuickReaction = (messageId: string, emoji: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const existingReaction = existingReactions.find(
            (r) => r.emoji === emoji
          );

          // Check if user already reacted with this emoji
          const alreadyReacted = existingReaction?.users.some(
            (u) => u.id === "me"
          );

          let newReactions;
          if (alreadyReacted) {
            // Remove user's reaction (toggle off)
            const newUsers = existingReaction!.users.filter(
              (u) => u.id !== "me"
            );
            const newCount = existingReaction!.count - 1;

            if (newCount === 0) {
              newReactions = existingReactions.filter((r) => r.emoji !== emoji);
            } else {
              newReactions = existingReactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: newCount, users: newUsers }
                  : r
              );
            }
          } else {
            // Remove all other reactions from "me" first (only 1 reaction allowed)
            const cleanedReactions = existingReactions
              .map((r) => ({
                ...r,
                users: r.users.filter((u) => u.id !== "me"),
                count: r.users.filter((u) => u.id !== "me").length,
              }))
              .filter((r) => r.count > 0);

            // Add new reaction with this emoji
            const cleanedExisting = cleanedReactions.find(
              (r) => r.emoji === emoji
            );

            if (cleanedExisting) {
              newReactions = cleanedReactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      users: [
                        ...r.users,
                        {
                          id: "me",
                          name: "You",
                          avatar: "https://i.pravatar.cc/150?img=10",
                        },
                      ],
                    }
                  : r
              );
            } else {
              newReactions = [
                ...cleanedReactions,
                {
                  emoji,
                  count: 1,
                  users: [
                    {
                      id: "me",
                      name: "You",
                      avatar: "https://i.pravatar.cc/150?img=10",
                    },
                  ],
                },
              ];
            }
          }

          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  const handleEmojiFromPicker = (emoji: string) => {
    // Add emoji to message being typed
    setInputText((prev) => prev + emoji);
  };

  const handleEmojiFromReactionPicker = (emoji: string) => {
    // Add reaction from emoji picker
    handleReaction(emoji);
  };

  const handleOpenReactionPicker = () => {
    setShowReactionPicker(true);
  };

  const handleReactionDetailsOpen = (message: Message) => {
    setSelectedMessage(message);
    setShowReactionDetails(true);
  };

  const handleReplyInThread = () => {
    Alert.alert("Reply in Thread", "Thread feature coming soon!");
  };

  // Attachment menu handlers
  const handleSelectGallery = () => {
    Alert.alert("Gallery", "Open gallery to select photos/videos");
  };

  const handleSelectCamera = () => {
    Alert.alert("Camera", "Open camera to take photo/video");
  };

  const handleSelectDocument = () => {
    Alert.alert("Document", "Select document to share");
  };

  const handleSelectLocation = () => {
    Alert.alert("Location", "Share your location");
  };

  const handleSelectContact = () => {
    Alert.alert("Contact", "Share a contact");
  };

  const handleSelectPoll = () => {
    router.push(`/poll/create?chatId=${id}`);
  };

  const handleSelectVoice = () => {
    setShowVoiceRecorder(true);
  };

  const handleSendVoice = (duration: number) => {
    // Create voice message
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "voice",
      duration: duration,
      voiceUri: "mock-voice-uri", // In real app, this would be the actual audio file URI
      time: new Date()
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase(),
      isMine: true,
      status: "sent",
    };

    setMessages([...messages, newMessage]);
  };

  const handlePollVote = (pollId: string, optionIndex: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === pollId && msg.poll) {
          const updatedPoll = { ...msg.poll };
          const currentVotes = updatedPoll.votes[optionIndex] || [];

          if (updatedPoll.allowMultiple) {
            // Multiple choice: toggle vote
            if (currentVotes.includes("me")) {
              updatedPoll.votes[optionIndex] = currentVotes.filter(
                (v) => v !== "me"
              );
            } else {
              updatedPoll.votes[optionIndex] = [...currentVotes, "me"];
            }
          } else {
            // Single choice: remove all other votes and toggle this one
            const alreadyVoted = currentVotes.includes("me");

            // Remove "me" from all options
            Object.keys(updatedPoll.votes).forEach((key) => {
              updatedPoll.votes[parseInt(key)] = updatedPoll.votes[
                parseInt(key)
              ].filter((v) => v !== "me");
            });

            // If not already voted for this option, add vote
            if (!alreadyVoted) {
              updatedPoll.votes[optionIndex] = [...currentVotes, "me"];
            }
          }

          return { ...msg, poll: updatedPoll };
        }
        return msg;
      })
    );
  };

  // Mention handling
  const handleInputTextChange = (text: string) => {
    setInputText(text);

    // Detect @ mention
    const cursorPos = text.length; // For now, assume cursor is at end
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Check if @ is at start or after a space
      const charBeforeAt =
        lastAtIndex === 0 ? " " : textBeforeCursor[lastAtIndex - 1];
      if (charBeforeAt === " " || lastAtIndex === 0) {
        const query = textBeforeCursor.substring(lastAtIndex + 1);
        // Check if query doesn't contain space (still typing username)
        if (!query.includes(" ")) {
          setMentionQuery(query);
          setShowMentionSuggestions(true);
          return;
        }
      }
    }

    // Hide suggestions if @ not found or invalid
    setShowMentionSuggestions(false);
    setMentionQuery("");
  };

  const handleSelectMention = (user: MentionUser) => {
    // Find the last @ position
    const lastAtIndex = inputText.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      // Replace from @ to current position with @username
      const textBeforeAt = inputText.substring(0, lastAtIndex);
      const textAfter = inputText.substring(inputText.length);
      const newText = `${textBeforeAt}@${user.username} ${textAfter}`;
      setInputText(newText);
    }

    setShowMentionSuggestions(false);
    setMentionQuery("");
  };

  const getMessageOptions = (): MessageOption[] => {
    const baseOptions: MessageOption[] = [
      {
        id: "info",
        label: "Info",
        icon: "information-outline",
        action: () => Alert.alert("Info", "Message info coming soon!"),
      },
      {
        id: "copy",
        label: "Copy",
        icon: "content-copy",
        action: handleCopy,
      },
    ];

    if (selectedMessage?.isMine && selectedMessage.type === "text") {
      baseOptions.push({
        id: "edit",
        label: "Edit",
        icon: "pencil-outline",
        action: handleEdit,
      });
    }

    baseOptions.push(
      {
        id: "reply",
        label: "Reply in Thread",
        icon: "reply",
        action: handleReplyInThread,
      },
      {
        id: "translate",
        label: "Translate",
        icon: "translate",
        action: handleTranslate,
      },
      {
        id: "delete",
        label: "Delete",
        icon: "delete-outline",
        color: "#FF5252",
        action: handleDelete,
      }
    );

    return baseOptions;
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      activeOpacity={item.type === "poll" ? 1 : 0.9}
      onLongPress={
        item.type === "poll" ? undefined : () => handleLongPress(item)
      }
      disabled={item.type === "poll"}
      style={[
        styles.messageContainer,
        item.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {/* Group Chat Sender Info */}
      {isGroupChat && !item.isMine && item.senderName && (
        <View style={styles.senderInfoContainer}>
          <Image
            source={{ uri: item.senderAvatar }}
            style={styles.senderAvatar}
          />
          <Text style={styles.senderName}>{item.senderName}</Text>
        </View>
      )}

      {item.type === "text" && (
        <View>
          <View
            style={[
              styles.messageBubble,
              item.isMine ? styles.myBubble : styles.theirBubble,
              isGroupChat && !item.isMine && styles.groupMessageBubble,
            ]}
          >
            <MentionText
              text={item.text || ""}
              style={[
                styles.messageText,
                item.isMine ? styles.myMessageText : styles.theirMessageText,
              ]}
            />
            {item.translatedText && (
              <View style={styles.translatedContainer}>
                <Text
                  style={[
                    styles.translatedLabel,
                    item.isMine && styles.translatedLabelMine,
                  ]}
                >
                  Text Translated
                </Text>
                <Text
                  style={[
                    styles.translatedText,
                    item.isMine && styles.translatedTextMine,
                  ]}
                >
                  {item.translatedText}
                </Text>
              </View>
            )}
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  item.isMine ? styles.myMessageTime : styles.theirMessageTime,
                ]}
              >
                {item.time}
              </Text>
              {item.isEdited && (
                <Text
                  style={[
                    styles.editedLabel,
                    item.isMine && styles.editedLabelMine,
                  ]}
                >
                  Edited
                </Text>
              )}
              {item.isMine && item.status && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color={item.status === "read" ? "#FFFFFF" : "#E0D7FF"}
                />
              )}
            </View>
          </View>
          {item.reactions && item.reactions.length > 0 && (
            <MessageReactions
              reactions={item.reactions}
              isMine={item.isMine}
              onPress={() => handleReactionDetailsOpen(item)}
              onEmojiPress={(emoji) => handleQuickReaction(item.id, emoji)}
            />
          )}
        </View>
      )}

      {item.type === "file" && (
        <View>
          <FileAttachment
            fileName={item.fileName!}
            fileSize={item.fileSize!}
            fileDate={item.fileDate!}
            isMine={item.isMine}
          />
          <View
            style={[
              styles.mediaTimeContainer,
              item.isMine && styles.mediaTimeContainerMine,
            ]}
          >
            <Text
              style={[styles.mediaTime, item.isMine && styles.mediaTimeMine]}
            >
              {item.time}
            </Text>
            {item.isMine && item.status && (
              <Ionicons name="checkmark-done" size={14} color="#6D5FFD" />
            )}
          </View>
        </View>
      )}

      {item.type === "image" && (
        <View>
          <ImageMessage
            uri={item.imageUri!}
            isMine={item.isMine}
            onPress={() => setSelectedImage(item.imageUri!)}
          />
          <View
            style={[
              styles.mediaTimeContainer,
              item.isMine && styles.mediaTimeContainerMine,
            ]}
          >
            <Text
              style={[styles.mediaTime, item.isMine && styles.mediaTimeMine]}
            >
              {item.time}
            </Text>
            {item.isMine && item.status && (
              <Ionicons name="checkmark-done" size={14} color="#6D5FFD" />
            )}
          </View>
        </View>
      )}

      {item.type === "video" && (
        <View>
          <VideoMessage
            thumbnailUri={item.thumbnailUri!}
            isMine={item.isMine}
            onPress={() =>
              setSelectedVideo({
                uri: item.videoUri!,
                thumbnail: item.thumbnailUri!,
              })
            }
          />
          <View
            style={[
              styles.mediaTimeContainer,
              item.isMine && styles.mediaTimeContainerMine,
            ]}
          >
            <Text
              style={[styles.mediaTime, item.isMine && styles.mediaTimeMine]}
            >
              {item.time}
            </Text>
            {item.isMine && item.status && (
              <Ionicons name="checkmark-done" size={14} color="#6D5FFD" />
            )}
          </View>
        </View>
      )}

      {item.type === "voice" && (
        <View>
          <VoiceMessage
            duration={item.duration || 0}
            isMine={item.isMine}
            voiceUri={item.voiceUri}
          />
          <View
            style={[
              styles.mediaTimeContainer,
              item.isMine && styles.mediaTimeContainerMine,
            ]}
          >
            <Text
              style={[styles.mediaTime, item.isMine && styles.mediaTimeMine]}
            >
              {item.time}
            </Text>
            {item.isMine && item.status && (
              <Ionicons name="checkmark-done" size={14} color="#6D5FFD" />
            )}
          </View>
        </View>
      )}

      {item.type === "poll" && item.poll && (
        <View>
          <PollMessage
            poll={item.poll}
            isMine={item.isMine}
            onVote={(optionIndex) => handlePollVote(item.id, optionIndex)}
          />
          <View
            style={[
              styles.mediaTimeContainer,
              item.isMine && styles.mediaTimeContainerMine,
            ]}
          >
            <Text
              style={[styles.mediaTime, item.isMine && styles.mediaTimeMine]}
            >
              {item.time}
            </Text>
            {item.isMine && item.status && (
              <Ionicons name="checkmark-done" size={14} color="#6D5FFD" />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDateSeparator = () => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>Today</Text>
      </View>
      <View style={styles.dateLine} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=1" }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>George Alan</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons
              name="video-outline"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={renderDateSeparator}
        showsVerticalScrollIndicator={false}
        style={styles.messagesListContainer}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          {/* Text Input Row */}
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor="#9E9E9E"
                value={inputText}
                onChangeText={handleInputTextChange}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? "#BDBDBD" : "#F0F0F0" },
              ]}
              disabled={!inputText.trim()}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={inputText.trim() ? "#FFFFFF" : "#9E9E9E"}
              />
            </TouchableOpacity>
          </View>

          {/* Icons Row */}
          <View style={styles.iconsRow}>
            {isGroupChat && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push(`/poll/create?chatId=${id}`)}
              >
                <MaterialCommunityIcons name="poll" size={24} color="#757575" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSelectVoice}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={24}
                color="#757575"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowEmojiPicker(true)}
            >
              <MaterialCommunityIcons
                name="emoticon-happy-outline"
                size={24}
                color="#757575"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons
                name="image-outline"
                size={24}
                color="#757575"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons
                name="star-four-points-outline"
                size={24}
                color="#757575"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={selectedImage !== null}
        imageUri={selectedImage || ""}
        onClose={() => setSelectedImage(null)}
      />

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          visible={selectedVideo !== null}
          videoUri={selectedVideo.uri}
          thumbnailUri={selectedVideo.thumbnail}
          userName="George Alan"
          timestamp="Today at 12:24 PM"
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Message Options Sheet */}
      <MessageOptionsSheet
        visible={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
        options={getMessageOptions()}
        onReaction={handleReaction}
        onOpenEmojiPicker={handleOpenReactionPicker}
        isMine={selectedMessage?.isMine || false}
      />

      {/* Edit Message Modal */}
      <EditMessageModal
        visible={showEditModal}
        message={selectedMessage?.text || ""}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />

      {/* Emoji Picker for Input */}
      <EmojiPickerSheet
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={handleEmojiFromPicker}
        recentEmojis={recentEmojis}
      />

      {/* Emoji Picker for Reactions */}
      <EmojiPickerSheet
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelectEmoji={handleEmojiFromReactionPicker}
        recentEmojis={recentEmojis}
      />

      {/* Reaction Details Sheet */}
      <ReactionDetailsSheet
        visible={showReactionDetails}
        onClose={() => setShowReactionDetails(false)}
        reactions={selectedMessage?.reactions?.flatMap((r) => r.users) || []}
      />

      {/* Mention Suggestions */}
      <MentionSuggestions
        visible={showMentionSuggestions}
        onClose={() => setShowMentionSuggestions(false)}
        users={GROUP_MEMBERS}
        onSelectUser={handleSelectMention}
        searchQuery={mentionQuery}
      />

      {/* Attachment Menu */}
      <AttachmentMenu
        visible={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSelectGallery={handleSelectGallery}
        onSelectCamera={handleSelectCamera}
        onSelectDocument={handleSelectDocument}
        onSelectLocation={handleSelectLocation}
        onSelectContact={handleSelectContact}
        onSelectPoll={handleSelectPoll}
        onSelectVoice={handleSelectVoice}
      />

      {/* Voice Recorder */}
      <VoiceRecorder
        visible={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSendVoice={handleSendVoice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  headerStatus: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  messagesListContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateContainer: {
    backgroundColor: "#6D5FFD",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  theirMessage: {
    alignItems: "flex-start",
  },
  senderInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: 4,
    gap: 8,
  },
  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6D5FFD",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: "#6D5FFD",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
  },
  groupMessageBubble: {
    marginLeft: 36,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  theirMessageText: {
    color: "#000000",
  },
  translatedContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  translatedLabel: {
    fontSize: 11,
    color: "#757575",
    marginBottom: 4,
    fontStyle: "italic",
  },
  translatedLabelMine: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  translatedText: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 18,
  },
  translatedTextMine: {
    color: "#FFFFFF",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: "#E0D7FF",
  },
  theirMessageTime: {
    color: "#9E9E9E",
  },
  editedLabel: {
    fontSize: 11,
    color: "#757575",
    fontStyle: "italic",
  },
  editedLabelMine: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  mediaTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  mediaTimeContainerMine: {
    justifyContent: "flex-end",
  },
  mediaTime: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  mediaTimeMine: {
    color: "#6D5FFD",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: "#000000",
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
});
