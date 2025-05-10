import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import Header from '../components/Header';
import UsersList from '../components/UsersList';
import { useChat } from '../context/ChatContext';

const Chat = () => {
  const { currentConversation } = useChat();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box height="100vh" bg={bgColor}>
      <Grid
        templateColumns={{ base: '1fr', md: '300px 1fr' }}
        templateRows="60px 1fr"
        height="100%"
      >
        {/* Header */}
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Header />
        </GridItem>
        
        {/* Sidebar */}
        <GridItem 
          display={{ base: currentConversation ? 'none' : 'block', md: 'block' }} 
          bg={useColorModeValue('white', 'gray.800')}
          borderRight="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          overflow="hidden"
        >
          <Tabs height="100%" display="flex" flexDirection="column">
            <TabList>
              <Tab>Conversations</Tab>
              <Tab>Users</Tab>
            </TabList>
            
            <TabPanels flex="1" overflow="hidden">
              <TabPanel height="100%" p={0}>
                <Sidebar />
              </TabPanel>
              <TabPanel height="100%" p={0}>
                <UsersList />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
        
        {/* Chat area */}
        <GridItem 
          display={{ base: currentConversation ? 'block' : 'none', md: 'block' }}
          bg={useColorModeValue('white', 'gray.800')}
        >
          <ChatArea />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Chat;