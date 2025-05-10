import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  Input,
  Button,
  VStack,
  HStack,
  Spinner,
  Center,
  IconButton,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { ArrowBackIcon, AttachmentIcon } from '@chakra-ui/icons';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import { format } from 'date-fns';
import { debounce } from 'lodash';

const LOCAL_STORAGE_KEY_PREFIX = 'chat-messages-';

const ChatArea = () => {
  const { 
    currentConversation, 
    messages, 
    sendMessage, 
    loadMoreMessages: originalLoadMoreMessages, 
    hasMoreMessages, 
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
    setCurrentConversation,
    loadingMessages,
    setMessages,
    setHasMoreMessages,
    setNextPageTimestamp,
    socket,
    fetchMessages,
    markMessagesAsRead,
    nextPageTimestamp
  } = useChat();
  
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [localLoadingMessages, setLocalLoadingMessages] = useState<boolean>(loadingMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  
  const headerBgColor = useColorModeValue('teal.500', 'teal.600');
  const headerTextColor = useColorModeValue('white', 'white');
  const dateBgColor = useColorModeValue('white', 'gray.700');
  const typingIndicatorBg = useColorModeValue('gray.100', 'gray.700');
  const messageInputBg = useColorModeValue('white', 'gray.700');
  const footerBgColor = useColorModeValue('white', 'gray.800');
  
  const recipient = currentConversation?.participants.find(
    p => p._id !== user?._id
  );
  
  const isRecipientOnline = recipient && onlineUsers.includes(recipient._id);
  
  const isRecipientTyping = typingUsers.some(
    t => t.userId === recipient?._id && t.conversationId === currentConversation?._id
  );
  
  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);
  
  const calculateMessageHeight = (messageCount: number) => {
    const avgMessageHeight = 80;
    const dateSeparatorHeight = 50;
    const estimatedDateSeparators = Math.ceil(messageCount / 10);
    return (avgMessageHeight * messageCount) + (dateSeparatorHeight * estimatedDateSeparators);
  };

  const loadMoreMessages = async () => {
    if (!currentConversation || !nextPageTimestamp || !hasMoreMessages || localLoadingMessages) return;
    
    try {
      setLocalLoadingMessages(true);
      const messagesData = await fetchMessages(currentConversation._id, nextPageTimestamp);
      
      if (messagesData.messages.length > 0) {
        const updatedMessages = [...messagesData.messages, ...messages];
        setMessages(updatedMessages);
        
        localStorage.setItem(
          `${LOCAL_STORAGE_KEY_PREFIX}${currentConversation._id}`,
          JSON.stringify(updatedMessages)
        );
        
        setHasMoreMessages(messagesData.hasMore);
        setNextPageTimestamp(messagesData.nextPage);
        
        return {
          addedCount: messagesData.messages.length,
          approximateHeight: calculateMessageHeight(messagesData.messages.length)
        };
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      setHasMoreMessages(false);
    } finally {
      setLocalLoadingMessages(false);
    }
    
    return null;
  };

  const handleScroll = async () => {
    if (messagesContainerRef.current && !localLoadingMessages && currentConversation) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      
      if (scrollTop < 100 && hasMoreMessages) {
        
        const previousScrollHeight = scrollHeight;
        previousScrollHeightRef.current = previousScrollHeight;
        
        const result = await loadMoreMessages();
        
        if (result) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              const heightDifference = newScrollHeight - previousScrollHeight;
              
              messagesContainerRef.current.scrollTop = heightDifference;
            }
          }, 50);
        }
      }
      
      const atBottom = scrollHeight - scrollTop - clientHeight < 20;
      if (atBottom) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
      }
    }
  };

  const debouncedHandleScroll = useCallback(
    debounce(() => {
      handleScroll();
    }, 200),
    [handleScroll]
  );
  
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      startTyping();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 1000);
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, startTyping, stopTyping]);
  
  const handleSend = () => {
    if (!message.trim() || !recipient || !user) return;
    
    sendMessage(message, recipient._id);
    setMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const groupedMessages: { [date: string]: any[] } = {};
  messages.forEach(msg => {
    try {
      if (!msg.createdAt) {
        console.warn('Message missing createdAt:', msg);
        return;
      }
      
      let messageDate;
      try {
        messageDate = new Date(msg.createdAt);
        if (isNaN(messageDate.getTime())) {
          console.warn('Invalid date in message:', msg.createdAt);
          messageDate = new Date();
        }
      } catch (err) {
        console.warn('Error parsing date:', msg.createdAt);
        messageDate = new Date();
      }
      
      const date = format(messageDate, 'yyyy-MM-dd');
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(msg);
    } catch (err) {
      console.error('Error processing message:', err, msg);
    }
  });
  
  useEffect(() => {
    const getMessages = async () => {
      if (!currentConversation) return;
      
      try {
        setLocalLoadingMessages(true);
        
        const cachedMessages = localStorage.getItem(
          `${LOCAL_STORAGE_KEY_PREFIX}${currentConversation._id}`
        );
        
        if (cachedMessages) {
          const parsedMessages = JSON.parse(cachedMessages);
          setMessages(parsedMessages);
          
          const messagesData = await fetchMessages(currentConversation._id);
          
          const existingIds = new Set(parsedMessages.map((m: any) => m._id));
          const uniqueNewMessages = messagesData.messages.filter(
            (m: any) => !existingIds.has(m._id)
          );
          
          if (uniqueNewMessages.length > 0) {
            setMessages([...parsedMessages, ...uniqueNewMessages]);
            
            localStorage.setItem(
              `${LOCAL_STORAGE_KEY_PREFIX}${currentConversation._id}`,
              JSON.stringify([...parsedMessages, ...uniqueNewMessages])
            );
          }
          
          setHasMoreMessages(messagesData.hasMore);
          setNextPageTimestamp(messagesData.nextPage);
        } else {
          const messagesData = await fetchMessages(currentConversation._id);
          setMessages(messagesData.messages);
          setHasMoreMessages(messagesData.hasMore);
          setNextPageTimestamp(messagesData.nextPage);
          
          localStorage.setItem(
            `${LOCAL_STORAGE_KEY_PREFIX}${currentConversation._id}`,
            JSON.stringify(messagesData.messages)
          );
        }
        
        if (socket && currentConversation) {
          socket.emit('join_conversation', currentConversation._id);
        }
        
        await markMessagesAsRead();
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLocalLoadingMessages(false);
      }
    };

    if (currentConversation) {
      getMessages();
    }
  }, [currentConversation, fetchMessages, markMessagesAsRead, setHasMoreMessages, setMessages, setNextPageTimestamp, socket]);
  
  if (!currentConversation) {
    return (
      <Center height="100%" flexDirection="column" gap={4} position="relative">
        <Box 
          position="absolute"
          top={0} 
          left={0} 
          right={0} 
          bottom={0}
          opacity={0.05}
          bgImage="url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be8374b5f565fa3f473e05dbbe8c3a.png')"
          bgRepeat="repeat"
          zIndex={-1}
        />
        <Image 
          src="https://web.whatsapp.com/img/intro-connection-light_c98cc75f2aa905314d74375a975d2cf2.jpg" 
          boxSize="240px"
          borderRadius="full"
          opacity={0.8}
        />
        <Text color="gray.500" fontSize="2xl" fontWeight="medium">Chat App</Text>
        <Text color="gray.400" fontSize="md" maxW="500px" textAlign="center">
          Select a conversation to start chatting or find new users in the Users tab
        </Text>
      </Center>
    );
  }
  
  return (
    <Flex direction="column" height="100%" position="relative">
      <Box 
        position="absolute"
        top={0} 
        left={0} 
        right={0} 
        bottom={0}
        opacity={0.05}
        bgImage="url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be8374b5f565fa3f473e05dbbe8c3a.png')"
        bgRepeat="repeat"
        zIndex={-1}
      />
      
      <Flex
        p={4}
        bg={headerBgColor}
        color={headerTextColor}
        align="center"
        boxShadow="sm"
      >
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Back"
          display={{ base: 'flex', md: 'none' }}
          mr={2}
          onClick={() => setCurrentConversation(null)}
          variant="ghost"
          color="white"
          _hover={{ bg: 'teal.600' }}
        />
        
        <Avatar name={recipient?.name} size="sm" />
        
        <Box ml={3} flex="1">
          <Text fontWeight="bold">{recipient?.name}</Text>
          <Text fontSize="xs">
            {isRecipientTyping ? 'typing...' : isRecipientOnline ? 'online' : 'offline'}
          </Text>
        </Box>
      </Flex>
      
      <Box
        flex="1"
        p={4}
        overflowY="auto"
        ref={messagesContainerRef}
        onScroll={debouncedHandleScroll}
        bgImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')"
        bgRepeat="repeat"
        bgSize="contain"
      >
        {localLoadingMessages && (
          <Center py={4}>
            <Spinner size="sm" color="teal.500" />
          </Center>
        )}
        
        <VStack spacing={4} align="stretch">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <Box key={date}>
              <Flex align="center" my={4} justify="center">
                <Box 
                  mx={2} 
                  fontSize="xs" 
                  color="gray.500" 
                  bg={dateBgColor}
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  boxShadow="sm"
                  textAlign="center"
                >
                  {format(new Date(date), 'MMMM d, yyyy')}
                </Box>
              </Flex>
              
              {msgs.map((msg) => {
                const msgSenderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                const isOwnMessage = msgSenderId === user?._id;
                
                let senderName;
                if (isOwnMessage) {
                  senderName = 'You';
                } else {
                  if (msg.senderInfo && msg.senderInfo.name) {
                    senderName = msg.senderInfo.name;
                  } else if (recipient && msgSenderId === recipient._id) {
                    senderName = recipient.name;
                  } else {
                    senderName = 'User';
                  }
                }
                
                
                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwnMessage={isOwnMessage}
                    senderName={senderName}
                  />
                );
              })}
            </Box>
          ))}
          
          {isRecipientTyping && (
            <Flex 
              align="center" 
              mt={2} 
              bg={typingIndicatorBg}
              p={2}
              borderRadius="lg"
              alignSelf="flex-start"
              maxWidth="600px"
              boxShadow="sm"
              ml={1}
            >
              <Box position="relative" display="flex" alignItems="center" gap={2}>
                
                <Avatar 
                  name={recipient?.name} 
                  size="xs" 
                  mr={2} 
                  bg="teal.500" 
                  color="white"
                />
                <Text fontSize="xs" color="gray.500">
                  {recipient?.name} is typing...
                </Text>

                <div>
                  <Box 
                  width="8px" 
                  height="8px" 
                  borderRadius="full" 
                  bg="gray.500" 
                  animation="typing 1s infinite"
                  display="inline-block"
                  mr={1}
                  sx={{
                    "@keyframes typing": {
                      "0%": { opacity: 0.4 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.4 }
                    }
                  }}
                />
                <Box 
                  width="8px" 
                  height="8px" 
                  borderRadius="full" 
                  bg="gray.500" 
                  animation="typing 1s infinite 0.2s"
                  display="inline-block"
                  mx={1}
                  sx={{
                    "@keyframes typing": {
                      "0%": { opacity: 0.4 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.4 }
                    }
                  }}
                />
                <Box 
                  width="8px" 
                  height="8px" 
                  borderRadius="full" 
                  bg="gray.500" 
                  animation="typing 1s infinite 0.4s"
                  display="inline-block"
                  ml={1}
                  sx={{
                    "@keyframes typing": {
                      "0%": { opacity: 0.4 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.4 }
                    }
                  }}
                />
                </div>
              </Box>
            </Flex>
          )}
          
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      
      <Box p={3} bg={footerBgColor} boxShadow="sm">
        <HStack>
          {/* Future Use */}
          {/* <IconButton
            aria-label="Attach"
            icon={<AttachmentIcon />}
            variant="ghost"
            borderRadius="full"
          /> */}
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            bg={messageInputBg}
            borderRadius="full"
            size="md"
            boxShadow="sm"
          />
          <Button 
            colorScheme="teal" 
            onClick={handleSend} 
            isDisabled={!message.trim()}
            borderRadius="full"
          >
            Send
          </Button>
        </HStack>
      </Box>
    </Flex>
  );
};

export default ChatArea;