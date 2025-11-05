export interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  description: string;
  filePath: string;
  username?: string; // Added username property
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  email?: string;
  tel?: string;
  role?: string; // Added role property
  createdAt?: Date;
  updatedAt?: Date; // Added
}