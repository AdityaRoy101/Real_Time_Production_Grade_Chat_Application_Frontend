// Chat API calls
import api from './axiosConfig';

export const fetchConversations = async (userId: string) => {
  try {
    const response = await api.get(`/api/v1/chat/conversations/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching conversations');
  }
};

export const fetchAllUsers = async (userId: string) => {
  try {
    const response = await api.get(`/api/v1/chat/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching users');
  }
};

export const fetchMessages = async (conversationId: string, before?: number) => {
  try {
    const url = before 
      ? `/api/v1/chat/messages/${conversationId}?before=${before}`
      : `/api/v1/chat/messages/${conversationId}`;
    
    const response = await api.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Error fetching messages');
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const response = await api.post('/api/v1/chat/read', { 
      conversationId, 
      userId 
    });
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw new Error('Error marking messages as read');
  }
};

export const sendMessageApi = async (conversationId: string, sender: string, recipient: string, content: string) => {
  try {
    const response = await api.post('/api/v1/chat/message', {
      conversationId,
      sender,
      recipient,
      content
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Error sending message');
  }
};