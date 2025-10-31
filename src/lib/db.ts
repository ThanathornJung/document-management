export interface Document {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email?: string;
  tel?: string;
  createdAt?: string;
}