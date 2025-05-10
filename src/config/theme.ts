// Chat App UI theme configuration
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      500: '#3182CE',
      600: '#2B6CB0',
      700: '#2C5282',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  }
});

export default theme;