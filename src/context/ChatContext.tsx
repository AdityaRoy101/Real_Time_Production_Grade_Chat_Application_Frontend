import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ChatContextType, Conversation, Message, TypingUser, User } from '../types/chat';
import { SOCKET_URL } from '../config/constants';
import { fetchConversations, fetchMessages, markMessagesAsRead as markMessagesAsReadApi, sendMessageApi, fetchAllUsers } from '../api/chatApi';

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  socket: null,
  conversations: [],
  currentConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  setCurrentConversation: () => {},
  sendMessage: () => {},
  loadMoreMessages: async () => Promise.resolve(null),
  startTyping: () => {},
  stopTyping: () => {},
  hasMoreMessages: false,
  loading: true,
  loadingMessages: false,
  allUsers: [],
  fetchUsers: async () => Promise.resolve(),
  startNewConversation: async () => Promise.resolve(),
  setMessages: () => {},
  setHasMoreMessages: () => {},
  setNextPageTimestamp: () => {},
  fetchMessages: async () => Promise.resolve({ messages: [], hasMore: false, nextPage: null }),
  markMessagesAsRead: async () => Promise.resolve(),
  nextPageTimestamp: null
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [nextPageTimestamp, setNextPageTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const markMessagesAsRead = useCallback(async () => {
    if (!currentConversation || !user) return;
    
    try {
      const response = await markMessagesAsReadApi(currentConversation._id, user._id);
      
      if (response.updatedCount > 0) {
        setMessages(prev => 
          prev.map(msg => 
            msg.sender !== user._id && !msg.read ? { ...msg, read: true } : msg
          )
        );
        
        if (socket && response.updatedMessageIds?.length > 0) {
          socket.emit('messages_read', {
            conversationId: currentConversation._id,
            messageIds: response.updatedMessageIds
          });
        }
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [currentConversation, user, socket]);

  // Update socket connection to use localStorage token
  useEffect(() => {
    if (!user) return;
    
    // Disconnect any existing socket
    if (socket) {
      socket.disconnect();
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found for socket connection');
      return;
    }
    
    // Validate token is a proper JWT (should be a long string, not a placeholder)
    if (token.startsWith('auth-session-')) {
      console.error('Invalid token format for socket connection');
      return;
    }
    
    console.log('Creating new socket connection with token');
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);
  
  useEffect(() => {
    if (!socket || !user) return;
    
    const getConversations = async () => {
      try {
        console.log("Fetching conversations...");
        console.log(`User ID: ${user?._id}`); // Fixed log to show actual ID
        
        // Add token from localStorage as an alternative to cookies
        const token = localStorage.getItem('authToken') || undefined;
        const conversationsData = await fetchConversations(user?._id, token);
        
        console.log("Conversations fetched successfully:", conversationsData);
        setConversations(conversationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setLoading(false);
      }
    };
    
    getConversations();
    
    socket.on('online_users', (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
    
    socket.on('user_status', (data: { userId: string, status: string }) => {
      if (data.status === 'online') {
        setOnlineUsers(prev => [...prev, data.userId]);
      } else {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }
    });
    
    socket.on('new_message', (data: any) => {
      
      const messageData = {
        ...data,
        sender: data.sender?._id || data.sender,
        senderInfo: data.sender,
        createdAt: data.createdAt || data.timestamp || new Date().toISOString()
      };
      
      if (currentConversation && data.conversationId === currentConversation._id) {
        setMessages(prev => {
          const hasTempMatch = prev.some(msg => {
            const isTempId = msg._id && typeof msg._id.toString === 'function' && 
              msg._id.toString().startsWith('temp-');
            
            return msg.content === data.content && 
              isTempId && 
              (
                msg.sender === data.sender || 
                msg.sender === data.sender?._id
              );
          });
          
          if (hasTempMatch) {
            return prev;
          }
          
          return [...prev, messageData];
        });
      }
      
      setConversations(prev => {
        const existingConv = prev.find(conv => conv._id === data.conversationId);
        
        if (!existingConv) {
          fetchConversations(user._id).then(setConversations);
          return prev;
        }
        
        return prev.map(conv => 
          conv._id === data.conversationId 
            ? {
                ...conv, 
                lastMessage: {
                  content: data.content,
                  sender: data.sender,
                  timestamp: data.timestamp || new Date().toISOString()
                },
                unreadCount: {
                  ...conv.unreadCount,
                  [user?._id || '']: user?._id === data.sender ? 0 : ((conv.unreadCount?.[user?._id || ''] || 0) + 1)
                }
              }
            : conv
        );
      });
    });
    
    socket.on('conversation_updated', (data: any) => {
      setConversations(prev => 
        prev.map(conv => 
          conv._id === data.conversationId 
            ? {
                ...conv, 
                lastMessage: data.lastMessage
              }
            : conv
        )
      );
    });

    socket.on('user_typing', (data: any) => {
      if (data.isTyping) {
        setTypingUsers(prev => [
          ...prev.filter(u => u.userId !== data.userId || u.conversationId !== data.conversationId),
          data
        ]);
      } else {
        setTypingUsers(prev => 
          prev.filter(u => u.userId !== data.userId || u.conversationId !== data.conversationId)
        );
      }
    });

    socket.on('messages_read_update', (data: any) => {
      if (currentConversation && data.conversationId === currentConversation._id) {
        setMessages(prev => 
          prev.map(msg => 
            data.messageIds?.includes(msg._id) ? { ...msg, read: true } : msg
          )
        );
      }
    });
    
    return () => {
      socket.off('online_users');
      socket.off('user_status');
      socket.off('new_message');
      socket.off('conversation_updated');
      socket.off('user_typing');
    };
  }, [socket, user, currentConversation]);
  
  useEffect(() => {
    if (!currentConversation || !user) return;
    
    const getMessages = async () => {
      try {
        setLoadingMessages(true);
        const messagesData = await fetchMessages(currentConversation._id);
        
        setMessages(messagesData.messages);
        setHasMoreMessages(messagesData.hasMore);
        setNextPageTimestamp(messagesData.nextPage);
        
        if (socket) {
          socket.emit('join_conversation', currentConversation._id);
        }
        
        await markMessagesAsRead();
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    getMessages();
    
    return () => {
      if (socket) {
        socket.emit('leave_conversation', currentConversation._id);
      }
    };
  }, [currentConversation, user, markMessagesAsRead]);

  useEffect(() => {
    if (currentConversation && user) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentConversation, messages.length, markMessagesAsRead]);

  // Add a safety timeout to prevent endless spinner
  useEffect(() => {
    if (loading) {
      const safetyTimeout = setTimeout(() => {
        console.log("Forcing loading state to false after timeout");
        setLoading(false);
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [loading]);
  
  const sendMessage = async (content: string, recipientId: string) => {
    if (!socket || !user || !currentConversation) return;
    
    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const currentDate = new Date().toISOString();
      
      const tempMessage = {
        _id: tempId,
        conversationId: currentConversation._id,
        sender: user._id,
        recipient: recipientId,
        content,
        createdAt: currentDate,
        read: false
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      socket.emit('send_message', {
        conversationId: currentConversation._id,
        sender: user._id,
        recipient: recipientId,
        content,
        timestamp: currentDate,
        createdAt: currentDate,
        tempId
      });
      
      const response = await sendMessageApi(
        currentConversation._id,
        user._id,
        recipientId,
        content
      );
      
      if (currentConversation._id.startsWith('temp-') && response._conversationId) {
        const updatedConversation = {
          ...currentConversation,
          _id: response._conversationId
        };
        
        setCurrentConversation(updatedConversation);
        
        setConversations(prev => {
          const conversationExists = prev.some(conv => conv._id === response._conversationId);
          
          if (conversationExists) {
            return prev.map(conv => 
              conv._id === response._conversationId 
                ? {
                    ...conv, 
                    lastMessage: {
                      content,
                      sender: user._id,
                      timestamp: new Date().toISOString()
                    }
                  }
                : conv
            );
          } else {
            return [
              {
                ...updatedConversation,
                lastMessage: {
                  content, 
                  sender: user._id,
                  timestamp: new Date().toISOString()
                }
              },
              ...prev.filter(c => c._id !== currentConversation._id)
            ];
          }
        });
        
        if (socket) {
          socket.emit('join_conversation', response._conversationId);
        }
      }
      
      setMessages(prev => {
        const tempMessageExists = prev.some(msg => msg._id === tempId);
        
        if (tempMessageExists) {
          return prev.map(msg => msg._id === tempId ? { ...response } : msg);
        } else {
          return [...prev, response];
        }
      });
      
      setConversations(prev => 
        prev.map(conv => 
          conv._id === currentConversation._id 
            ? {
                ...conv, 
                lastMessage: {
                  content,
                  sender: user._id,
                  timestamp: new Date().toISOString()
                }
              }
            : conv
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(msg => msg._id && !String(msg._id).startsWith('temp-')));
    }
  };
  
const loadMoreMessages = async () => {
  if (!currentConversation || !nextPageTimestamp || !hasMoreMessages || loadingMessages) return;
  
  try {
    setLoadingMessages(true);
    
    const messagesData = await fetchMessages(currentConversation._id, nextPageTimestamp);
    
    if (messagesData.messages.length > 0) {
      const firstMessageHeight = 100;
      
      setMessages(prev => [...messagesData.messages, ...prev]);
      setHasMoreMessages(messagesData.hasMore);
      setNextPageTimestamp(messagesData.nextPage);
      
      return { 
        addedCount: messagesData.messages.length,
        approximateHeight: firstMessageHeight * messagesData.messages.length
      };
    } else {
      setHasMoreMessages(false);
    }
  } catch (err) {
    console.error('Error loading more messages:', err);
    setHasMoreMessages(false);
  } finally {
    setLoadingMessages(false);
  }
  
  return null;
};
  
  const startTyping = () => {
    if (!socket || !currentConversation || !user) return;
    
    socket.emit('typing', {
      conversationId: currentConversation._id,
      userId: user._id
    });
  };
  
  const stopTyping = () => {
    if (!socket || !currentConversation || !user) return;
    
    socket.emit('stop_typing', {
      conversationId: currentConversation._id,
      userId: user._id
    });
  };

  const fetchUsers = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const usersData = await fetchAllUsers(user._id);
      setAllUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchUsers();
    }
  }, [user?._id, fetchUsers]);

  const startNewConversation = async (recipientId: string) => {
    if (!user) return;
    
    try {
      const existingConv = conversations.find(conv => 
        conv.participants.some(p => {
          if (typeof p === 'object') {
            return p._id === recipientId;
          } else {
            return p === recipientId;
          }
        })
      );
      
      if (existingConv) {
        setCurrentConversation(existingConv);
        return;
      }
      
      const recipient = allUsers.find(u => u._id === recipientId);
      if (!recipient) {
        return;
      }
      
      const tempId = `temp-${Date.now()}`;
      
      const tempConversation: Conversation = {
        _id: tempId,
        participants: [
          { _id: user._id, name: user.name, email: user.email },
          recipient
        ],
        lastMessage: null
      };
      
      setCurrentConversation(tempConversation);
      
      if (socket) {
        socket.emit('create_conversation', {
          participants: [user._id, recipientId]
        });
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    
    socket.on('conversation_created', (newConversation: Conversation) => {
      const conversationExists = conversations.some(
        conv => conv._id === newConversation._id
      );
      
      if (!conversationExists) {
        setConversations(prev => [newConversation, ...prev]);
      }
      
      const currentTempConv = currentConversation;
      
      if (currentTempConv && currentTempConv._id.startsWith('temp-')) {
        const sameParticipants = newConversation.participants.every(newP => 
          currentTempConv.participants.some(currP => 
            (typeof newP === 'object' && typeof currP === 'object') ? 
              newP._id === currP._id : 
              newP === currP
          )
        ) && currentTempConv.participants.every(currP => 
          newConversation.participants.some(newP => 
            (typeof newP === 'object' && typeof currP === 'object') ? 
              newP._id === currP._id : 
              newP === currP
          )
        );
        
        if (sameParticipants) {
          setCurrentConversation(newConversation);
        }
      }
    });
    
    return () => {
      socket.off('conversation_created');
    };
  }, [socket, currentConversation, conversations]);

  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      fetchConversations(user._id)
        .then(latestConversations => {
          setConversations(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(latestConversations)) {
              return latestConversations;
            }
            return prev;
          });
        })
        .catch(err => console.error('Error refreshing conversations:', err));
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  return (
    <ChatContext.Provider
      value={{
        socket,
        conversations,
        currentConversation,
        messages,
        onlineUsers,
        typingUsers,
        setCurrentConversation,
        sendMessage,
        loadMoreMessages,
        startTyping,
        stopTyping,
        hasMoreMessages,
        loading,
        loadingMessages,
        allUsers,
        fetchUsers,
        startNewConversation,
        setMessages,
        setHasMoreMessages,
        setLoadingMessages,
        setNextPageTimestamp,
        fetchMessages,
        markMessagesAsRead,
        nextPageTimestamp
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;