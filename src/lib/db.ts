import { promises as fs } from 'fs';
import path from 'path';

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

export interface Db {
  users: User[];
  documents: Document[];
}

const dbPath = path.join(process.cwd(), 'db.json');

export async function readDb(): Promise<Db> {
  try {
    const fileContents = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error: unknown) {
    if (error instanceof Error && error.code === 'ENOENT') {
      console.warn('db.json not found, creating with default structure.');
      const defaultDb: Db = { users: [], documents: [] };
      await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
    console.error('Error reading or parsing db.json:', error);
    throw new Error('Failed to read database.');
  }
}

export async function writeDb(db: Db) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing to db.json:', error);
    throw new Error('Failed to write to database.');
  }
}
