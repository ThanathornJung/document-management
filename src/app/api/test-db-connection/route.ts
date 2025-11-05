import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function GET() {
  try {
    const dbContext = await AzureSqlDatabaseContext.getInstance();
    const isConnected = await dbContext.testConnection();
    if (isConnected) {
      return NextResponse.json({ message: 'Azure SQL Database connection successful!' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Azure SQL Database connection failed.' }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Error testing Azure SQL Database connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error testing Azure SQL Database connection', error: errorMessage }, { status: 500 });
  }
}