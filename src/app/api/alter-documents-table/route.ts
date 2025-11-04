import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function GET() {
  const db = AzureSqlDatabaseContext.getInstance();
  try {
    console.log("Attempting to alter 'Documents' table...");

    const alterTableQuery = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Documents' AND COLUMN_NAME = 'category')
      BEGIN
          ALTER TABLE Documents ADD category NVARCHAR(255);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Documents' AND COLUMN_NAME = 'description')
      BEGIN
          ALTER TABLE Documents ADD description NVARCHAR(MAX);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Documents' AND COLUMN_NAME = 'filePath')
      BEGIN
          ALTER TABLE Documents ADD filePath NVARCHAR(1024);
      END;
    `;

    await db.executeQuery(alterTableQuery);

    console.log("'Documents' table altered successfully or already up-to-date.");
    return NextResponse.json({ message: "'Documents' table altered successfully or already up-to-date." }, { status: 200 });

  } catch (error) {
    console.error("Error altering 'Documents' table:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: "Error altering 'Documents' table", error: errorMessage }, { status: 500 });
  }
}
