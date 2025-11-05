import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function POST() {
  try {
    const dbContext = await AzureSqlDatabaseContext.getInstance();
    const request = await dbContext.createRequest();

    const alterTableSql = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'role')
      BEGIN
        ALTER TABLE Users ADD role NVARCHAR(50) DEFAULT 'user';
      END
    `;

    await request.query(alterTableSql);
    return NextResponse.json({ message: 'Users table altered successfully to add role column.' }, { status: 200 });
  } catch (error) {
    console.error('Error altering Users table:', error);
    return NextResponse.json({ message: 'Failed to alter Users table.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
