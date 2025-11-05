import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { LogRepository } from '@/lib/repositories/LogRepository';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  console.log('Logout API endpoint hit');
  let requestBody;
  let dbContext;
  try {
    dbContext = await AzureSqlDatabaseContext.getInstance();
    const logRepository = new LogRepository(dbContext);
    requestBody = await request.json();
    const { username } = requestBody;

    await logRepository.addLogEntry({
      username: username || 'N/A',
      action: 'LOGOUT',
      details: 'User logged out successfully',
      result: 'SUCCESS',
      method: 'POST',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
    });

    const serializedCookie = serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expire the cookie
      path: '/',
    });

    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    response.headers.set('Set-Cookie', serializedCookie);
    return response;

  } catch (error) {
    console.error('Error during logout logging:', error);
    if (dbContext) {
      const logRepository = new LogRepository(dbContext);
      await logRepository.addLogEntry({
        username: requestBody?.username || 'N/A',
        action: 'LOGOUT',
        details: 'Error during logout',
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
    }
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}