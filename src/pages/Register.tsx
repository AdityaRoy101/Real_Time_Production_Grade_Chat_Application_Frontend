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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register, error } = useAuth();
  
  const validateName = (name: string) => {
    if (!name) {
      setNameError('Name is required');
      return false;
    }
    
    if (name.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    
    setNameError('');
    return true;
  };
  
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
    
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isNameValid && isEmailValid && isPasswordValid) {
      await register(name, email, password);
    }
  };
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="md" py={12}>
      <Box bg={bgColor} p={8} rounded="lg" shadow="lg">
        <VStack spacing={6} align="stretch">
          <Heading textAlign="center">Register</Heading>
          
          {error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!nameError}>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => validateName(name)}
                />
                <FormErrorMessage>{nameError}</FormErrorMessage>
              </FormControl>
              
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
              
              <Button type="submit" colorScheme="blue" size="lg">
                Register
              </Button>
              
              <Text textAlign="center">
                Already have an account?{' '}
                <Link as={RouterLink} to="/login" color="blue.500">
                  Login
                </Link>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default Register;