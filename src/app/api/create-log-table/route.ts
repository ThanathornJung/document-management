import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function POST() {
  try {
    const dbContext = await AzureSqlDatabaseContext.getInstance();
    await dbContext.createLogTable();
    return NextResponse.json({ message: 'Log table created successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error creating log table:', error);
    return NextResponse.json({ message: 'Failed to create log table.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
