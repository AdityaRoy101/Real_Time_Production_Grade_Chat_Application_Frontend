import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Flex,
  Avatar,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Spinner,
  Center,
  useColorModeValue
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const UsersList = () => {
  const { allUsers, onlineUsers, startNewConversation, loading, fetchUsers } = useChat();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  
  useEffect(() => {
    if (!loading && allUsers.length === 0) {
      fetchUsers();
    }
  }, [loading, allUsers.length, fetchUsers]);
  
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  
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
        <Text fontSize="lg" fontWeight="bold">All Users</Text>
        
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        
        <Divider />
        
        {filteredUsers.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            No users found
          </Text>
        ) : (
          filteredUsers.map(otherUser => {
            if (otherUser._id === user?._id) return null;
            
            // Checking if user is online
            const isOnline = onlineUsers.includes(otherUser._id);
            
            return (
              <Box
                key={otherUser._id}
                p={3}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: hoverBgColor }}
                onClick={() => startNewConversation(otherUser._id)}
              >
                <Flex align="center">
                  <Box position="relative">
                    <Avatar name={otherUser.name} size="sm" />
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
                    <Text fontWeight="bold">{otherUser.name}</Text>
                    <Text fontSize="xs" color={isOnline ? "green.500" : "gray.500"}>
                      {isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            );
          })
        )}
      </VStack>
    </Box>
  );
};

export default UsersList;