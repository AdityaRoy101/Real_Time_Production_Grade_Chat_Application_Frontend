import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px={4}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      h="60px"
    >
      <Heading size="md">Chat App</Heading>
      
      <Flex align="center">
        <Box mr={4} fontSize="sm">
          {user?.name}
        </Box>
        <Button size="sm" onClick={logout}>
          Logout
        </Button>
      </Flex>
    </Flex>
  );
};

export default Header;