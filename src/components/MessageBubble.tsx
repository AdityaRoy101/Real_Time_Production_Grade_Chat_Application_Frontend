import React from 'react';
import {
  Box,
  Text,
  Flex,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    content: string;
    createdAt: string;
    sender: string | { _id: string; name: string };
    senderInfo?: { _id: string; name: string };
    read?: boolean;
    _id?: string;
  };
  isOwnMessage: boolean;
  senderName: string;
}

const MessageBubble = ({ message, isOwnMessage, senderName }: MessageBubbleProps) => {
  const ownMessageBg = useColorModeValue('#dcf8c6', '#056162');
  const otherMessageBg = useColorModeValue('#ffffff', '#262d31');
  
  const textColor = useColorModeValue('black', 'white');
  const timeColor = useColorModeValue('gray.600', 'gray.400');
  
  const bgColor = isOwnMessage ? ownMessageBg : otherMessageBg;
  
  // Safely formatting the date
  const formatMessageDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Checking if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      return format(date, 'h:mm a');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown time';
    }
  };
  
  // Safely format the tooltip date
  const formatTooltipDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Checking if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown date/time';
      }
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (err) {
      console.error('Error formatting tooltip date:', err);
      return 'Unknown date/time';
    }
  };
  
  return (
    <Flex
      direction="column"
      alignSelf={isOwnMessage ? 'flex-end' : 'flex-start'}
      maxWidth={{ base: "85%", md: "70%" }}
      mb={3}
      position="relative"
    >
      <Box
        bg={bgColor}
        color={textColor}
        px={3}
        py={2}
        borderRadius="md"
        position="relative"
        boxShadow="0 1px 1px rgba(0,0,0,0.1)"
        // Triangle for WhatsApp bubble effect
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          [isOwnMessage ? 'right' : 'left']: -6,
          borderStyle: 'solid',
          borderWidth: '6px',
          borderColor: `transparent transparent transparent ${isOwnMessage ? ownMessageBg : otherMessageBg}`,
          transform: isOwnMessage ? 'rotate(90deg)' : 'rotate(180deg)',
          display: 'block',
          width: 0,
          height: 0,
        }}
      >
        {!isOwnMessage && (
          <Text fontSize="xs" fontWeight="bold" mb={1} color="teal.500">
            {senderName}
          </Text>
        )}
        
        {/* Message content */}
        <Text mb={1} whiteSpace="pre-wrap" wordBreak="break-word">{message.content}</Text>
        
        <Flex justify="flex-end" alignItems="center" mt={1}>
          <Tooltip label={formatTooltipDate(message.createdAt)}>
            <Text fontSize="xs" color={timeColor} mr={1}>
              {formatMessageDate(message.createdAt)}
            </Text>
          </Tooltip>
          
          {isOwnMessage && (
            <Flex alignItems="center">
              {message.read ? (
                <Flex>
                  {/* Double blue check marks */}
                  <CheckIcon color="blue.500" boxSize={3} />
                  <CheckIcon color="blue.500" boxSize={3} ml="-1.5px" />
                </Flex>
              ) : (
                <Flex>
                  {/* Single gray check mark */}
                  <CheckIcon color="gray.500" boxSize={3} />
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default MessageBubble;