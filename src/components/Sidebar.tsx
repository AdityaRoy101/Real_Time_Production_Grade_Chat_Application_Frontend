import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Text,
  Flex,
  Avatar,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import UsersList from './UsersList';

const Sidebar = () => {
  const { conversations, setCurrentConversation, onlineUsers, loading } = useChat();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  const filteredConversations = conversations.filter(conv => {
    // Finding the other participant (not the current user)
    const otherParticipant = conv.participants.find(p => p._id !== user?._id);
    
    return otherParticipant?.name.toLowerCase().includes(search.toLowerCase());
  });
  
  if (loading) {
    return (
      <Center h="100%">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return (
    <Box height="100%" overflowY="auto" p={4}>
      <VStack spacing={4} align="stretch">
        <Heading size="md" mb={2}>Conversations</Heading>
        
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search conversations or users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        
        <Divider />
        
        {filteredConversations.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            No conversations found
          </Text>
        ) : (
          filteredConversations.map(conversation => {
            const otherParticipant = conversation.participants.find(
              p => p._id !== user?._id
            );
            
            // Checking if user is online
            const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id);
            
            const unreadCount = user?._id && conversation.unreadCount ? 
              conversation.unreadCount[user._id] : 0;
            
            return (
              <Box
                key={conversation._id}
                p={3}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => setCurrentConversation(conversation)}
              >
                <Flex align="center">
                  <Box position="relative">
                    <Avatar name={otherParticipant?.name} size="sm" />
                    {isOnline && (
                      <Box
                        position="absolute"
                        bottom="0"
                        right="0"
                        bg="green.500"
                        borderRadius="full"
                        w="10px"
                        h="10px"
                        border="1.5px solid white"
                      />
                    )}
                  </Box>
                  
                  <Box ml={3} flex="1">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" isTruncated maxWidth="120px">
                        {otherParticipant?.name}
                      </Text>
                      
                      {conversation.lastMessage && (
                        <Text fontSize="xs" color="gray.500">
                          {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                            addSuffix: true,
                          })}
                        </Text>
                      )}
                    </Flex>
                    
                    <Flex align="center">
                      <Text fontSize="sm" color="gray.600" isTruncated maxWidth="160px">
                        {conversation.lastMessage
                          ? conversation.lastMessage.content
                          : 'Start a conversation'}
                      </Text>
                      
                      {unreadCount > 0 && (
                        <Badge
                          ml={2}
                          colorScheme="blue"
                          borderRadius="full"
                          px={2}
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            );
          })
        )}
        
        {/* <UsersList /> */}
      </VStack>
    </Box>
  );
};

export default Sidebar;