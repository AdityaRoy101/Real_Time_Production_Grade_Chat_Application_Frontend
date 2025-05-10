import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Link,
  VStack,
  Alert,
  AlertIcon,
  FormErrorMessage,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { login, error } = useAuth();
  
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    
    setEmailError('');
    return true;
  };
  
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      setIsPending(true);
      try {
        await login(email, password);
      } finally {
        setIsPending(false);
      }
    }
  };
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="md" py={12}>
      <Box bg={bgColor} p={8} rounded="lg" shadow="lg">
        <VStack spacing={6} align="stretch">
          <Heading textAlign="center">Login</Heading>
          
          {error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!emailError}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateEmail(email)}
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!passwordError}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validatePassword(password)}
                />
                <FormErrorMessage>{passwordError}</FormErrorMessage>
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="blue" 
                size="lg"
                isLoading={isPending}
                loadingText="Logging in..."
              >
                Login
              </Button>
              
              <Text textAlign="center">
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color="blue.500">
                  Register
                </Link>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login;