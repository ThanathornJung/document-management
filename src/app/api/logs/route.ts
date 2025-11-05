import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { LogRepository } from '@/lib/repositories/LogRepository';
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

export async function GET(request: Request) {
  let dbContext;
  try {
    const userRole = await getUserRoleFromToken();
    if (userRole !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    dbContext = await AzureSqlDatabaseContext.getInstance();
    const logRepository = new LogRepository(dbContext);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC';
    const filterUsername = searchParams.get('username') || undefined;
    const filterAction = searchParams.get('action') || undefined;
    const filterResult = searchParams.get('result') || undefined;

    const logs = await logRepository.getLogs(page, pageSize, sortBy, sortOrder, filterUsername, filterAction, filterResult);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
