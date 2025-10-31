import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { User } from '../../../lib/db'; // Keep User interface for type consistency
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable in production
const dbContext = new AzureSqlDatabaseContext();

export async function POST(request: Request) {
  try {
    const { username, password, rememberMe } = await request.json();

    // Find user by username
    const user = await dbContext.getUserByUsername(username);

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const tokenPayload = { id: user.id, username: user.username };
      const expiresIn = rememberMe ? '7d' : '1h'; // 7 days if rememberMe, 1 hour otherwise
      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60; // 7 days in seconds if rememberMe, 1 hour otherwise

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });

      const serializedCookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: maxAge,
        path: '/',
      });

      const response = NextResponse.json(
        { message: 'Login successful', user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, birthDate: user.birthDate, email: user.email, tel: user.tel } },
        { status: 200 }
      );

      response.headers.set('Set-Cookie', serializedCookie);
      return response;

    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}