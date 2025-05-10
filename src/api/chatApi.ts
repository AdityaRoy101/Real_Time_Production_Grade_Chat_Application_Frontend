// Chat API calls
import api from './axiosConfig';

export const fetchConversations = async (userId: string, token?: string) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add Authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await api.get(`/api/v1/chat/conversations/${userId}`, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error in fetchConversations:', error.response?.data || error.message);
    throw new Error('Error fetching conversations');
  }
};

export const fetchAllUsers = async (userId: string, token?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await api.get(`/api/v1/chat/users/${userId}`, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error in fetchAllUsers:', error.response?.data || error.message);
    throw new Error('Error fetching users');
  }
};

export const fetchMessages = async (conversationId: string, before?: number, token?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const url = before 
      ? `/api/v1/chat/messages/${conversationId}?before=${before}`
      : `/api/v1/chat/messages/${conversationId}`;
    
    const response = await api.get(url, { headers });
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching messages:', error.response?.data || error.message);
    throw new Error('Error fetching messages');
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string, token?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await api.post('/api/v1/chat/read', { 
      conversationId, 
      userId 
    }, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Error marking messages as read:', error.response?.data || error.message);
    throw new Error('Error marking messages as read');
  }
};

export const sendMessageApi = async (conversationId: string, sender: string, recipient: string, content: string, token?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await api.post('/api/v1/chat/message', {
      conversationId,
      sender,
      recipient,
      content
    }, { headers });
    
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw new Error('Error sending message');
  }
};