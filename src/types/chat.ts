export interface User {
  _id: string;
  name: string;
  email: string;
  online?: boolean;
  lastActive?: string;
}

export interface Message {
  _id: string;
  sender: string;
  content: string;
  conversationId: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: {
    content: string;
    sender: string;
    timestamp: string;
  } | null;
  unreadCount?: {
    [userId: string]: number;
  };
}

export interface TypingUser {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface ChatContextType {
  socket: any | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string, recipient: string) => void;
  loadMoreMessages: () => Promise<any | null>;
  startTyping: () => void;
  stopTyping: () => void;
  hasMoreMessages: boolean;
  loading: boolean;
  loadingMessages: boolean;
  allUsers: User[];
  fetchUsers: () => Promise<void>;
  startNewConversation: (recipientId: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingMessages?: React.Dispatch<React.SetStateAction<boolean>>;
  setNextPageTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
  fetchMessages: (conversationId: string, before?: number) => Promise<any>;
  markMessagesAsRead: () => Promise<void>;
  nextPageTimestamp: number | null;
}