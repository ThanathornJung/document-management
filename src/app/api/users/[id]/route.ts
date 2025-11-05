import { NextRequest, NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { LogRepository } from '@/lib/repositories/LogRepository';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable in production

interface JwtPayload {
  id: number;
  username: string;
}

async function getUsernameFromToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decodedToken.username || 'system';
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
  }
  return 'system';
}

export async function GET(request: NextRequest) {
  let dbContext;
  try {
    dbContext = await AzureSqlDatabaseContext.getInstance();
    const userRepository = new UserRepository(dbContext);
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/')[3];
    const userId = parseInt(id, 10);
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Exclude sensitive information like password before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    // No need to format dates here, return raw Date objects
    const responseUser = {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt ? new Date(userWithoutPassword.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: userWithoutPassword.updatedAt ? new Date(userWithoutPassword.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    };

    return NextResponse.json(responseUser, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  tel?: string;
  birthDate?: string; // Assuming it comes as a string from JSON
  password?: string; // Add password as optional
  id?: number; // Add id as optional
}

export async function PUT(request: NextRequest) {
  let dbContext;
  let updatedData: UserUpdateData = {}; // Declare updatedData outside try block
  try {
    dbContext = await AzureSqlDatabaseContext.getInstance();
    const userRepository = new UserRepository(dbContext);
    const logRepository = new LogRepository(dbContext);
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/')[3];
    const userId = parseInt(id, 10);
    updatedData = await request.json();

    // Prevent changing sensitive fields like password or id through this route
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, id: _id, birthDate: rawBirthDate, ...updatableData } = updatedData;

    let birthDate: Date | undefined;
    if (rawBirthDate) {
      birthDate = new Date(rawBirthDate);
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json({ message: 'Invalid birthDate format' }, { status: 400 });
      }
    }

    const updatedUser = await userRepository.updateUser(userId, { ...updatableData, birthDate });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Format dates for the response
    const responseUser = {
      ...updatedUser,
      createdAt: updatedUser.createdAt ? new Date(updatedUser.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: updatedUser.updatedAt ? new Date(updatedUser.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    };

    await logRepository.addLogEntry({
      username: await getUsernameFromToken(),
      method: 'PUT',
      action: 'Update User Info',
      result: 'Success',
      details: `User ID: ${userId}, Updated Data: ${JSON.stringify(updatedData)}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });
    return NextResponse.json({ message: 'User updated successfully', user: responseUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    if (dbContext) {
      const logRepository = new LogRepository(dbContext);
      const pathname = request.nextUrl.pathname;
      const id = pathname.split('/')[3];
      const userId = parseInt(id, 10);
      await logRepository.addLogEntry({
        username: await getUsernameFromToken(),
        method: 'PUT',
        action: 'Update User Info',
        result: 'Failure',
        details: `Error updating user ID: ${userId}. Updated Data: ${JSON.stringify(updatedData)}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });
    }
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
