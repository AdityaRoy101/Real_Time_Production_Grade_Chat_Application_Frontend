// Authentication related types
export interface User {
  _id: string;
  name: string;
  email: string;
  online?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>; // Changed from void to boolean
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}