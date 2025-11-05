import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { LogRepository } from '@/lib/repositories/LogRepository';
import { UserRepository } from '@/lib/repositories/UserRepository';

const JWT_SECRET: string = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

export async function POST(request: Request) {
  let requestBody;
  let dbContext;
  try {
    dbContext = await AzureSqlDatabaseContext.getInstance();
    const logRepository = new LogRepository(dbContext);
    const userRepository = new UserRepository(dbContext);
    requestBody = await request.json();
    const { username, password, rememberMe } = requestBody;

    if (!username || !password) {
      await logRepository.addLogEntry({
        username: username,
        action: 'LOGIN',
        details: 'Attempted login with missing fields',
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Find user by username
    const user = await userRepository.getUserByUsername(username);

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const tokenPayload = { id: user.id, username: user.username, role: user.role };
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
        { message: 'Login successful', user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, birthDate: user.birthDate, email: user.email, tel: user.tel, role: user.role } },
        { status: 200 }
      );

      response.headers.set('Set-Cookie', serializedCookie);
      await logRepository.addLogEntry({
        username: user.username,
        action: 'LOGIN',
        details: 'User logged in successfully',
        result: 'SUCCESS',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });

      return response;

    } else {
      await logRepository.addLogEntry({
        username: username,
        action: 'LOGIN',
        details: 'Failed login attempt',
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API: Error during login:', error);
    if (dbContext) {
        try {
          const logRepository = new LogRepository(dbContext);
          await logRepository.addLogEntry({
            username: requestBody?.username || 'N/A',
            action: 'LOGIN',
            details: 'Error during login',
            result: 'FAILURE',
            method: 'POST',
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
          });
        } catch (logError) {
          console.error('Login API: Error logging failed login attempt:', logError);
        }
    }
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}