import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function POST() {
  try {
    const dbContext = await AzureSqlDatabaseContext.getInstance();
    const request = await dbContext.createRequest();

    const alterTableSql = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Documents' AND COLUMN_NAME = 'userId')
      BEGIN
        ALTER TABLE Documents ADD userId INT;
        ALTER TABLE Documents ADD CONSTRAINT FK_Documents_Users FOREIGN KEY (userId) REFERENCES Users(id);
      END
    `;

    await request.query(alterTableSql);
    return NextResponse.json({ message: 'Documents table altered successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error altering Documents table:', error);
    return NextResponse.json({ message: 'Failed to alter Documents table.', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}