import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { UserRepository } from '@/lib/repositories/UserRepository';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET: string = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}



async function getUserRoleFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    try {
      const decodedToken: unknown = jwt.verify(token, JWT_SECRET);
      if (typeof decodedToken === 'object' && decodedToken !== null && 'role' in decodedToken && typeof (decodedToken as { role: unknown }).role === 'string') {
        return (decodedToken as { role: string }).role || 'user';
      }
      return null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }
  return null;
}

export async function PUT(request: Request) {
  let dbContext;
  try {
    const userRole = await getUserRoleFromToken();
    if (userRole !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    dbContext = await AzureSqlDatabaseContext.getInstance();
    const userRepository = new UserRepository(dbContext);

    const { pathname } = new URL(request.url);
    const id = pathname.split('/')[3];
    const userId = parseInt(id, 10);

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ message: 'Role is required.' }, { status: 400 });
    }

    const updatedUser = await userRepository.updateUser(userId, { role });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User role updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
