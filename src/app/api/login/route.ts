import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable in production
const dbContext = AzureSqlDatabaseContext.getInstance();

export async function POST(request: Request) {
  try {
    console.log('Login API: Request received');
    const { username, password, rememberMe } = await request.json();
    console.log('Login API: Parsed request body');

    // Find user by username
    const user = await dbContext.getUserByUsername(username);
    console.log('Login API: User fetched:', user ? user.username : 'not found');

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      console.log('Login API: Password matched');
      const tokenPayload = { id: user.id, username: user.username };
      const expiresIn = rememberMe ? '7d' : '1h'; // 7 days if rememberMe, 1 hour otherwise
      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60; // 7 days in seconds if rememberMe, 1 hour otherwise

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });
      console.log('Login API: JWT signed');

      const serializedCookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: maxAge,
        path: '/',
      });
      console.log('Login API: Cookie serialized');

      const response = NextResponse.json(
        { message: 'Login successful', user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, birthDate: user.birthDate, email: user.email, tel: user.tel } },
        { status: 200 }
      );

      response.headers.set('Set-Cookie', serializedCookie);
      console.log('Login API: Login successful response sent');
      return response;

    } else {
      console.log('Login API: Invalid username or password');
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API: Error during login:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}