import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function GET() {
  const db = await AzureSqlDatabaseContext.getInstance();
  try {
    console.log("Attempting to alter 'Logs' table...");

    const alterTableQuery = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'username')
      BEGIN
          ALTER TABLE Logs ADD username NVARCHAR(255);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'method')
      BEGIN
          ALTER TABLE Logs ADD method NVARCHAR(10);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'action')
      BEGIN
          ALTER TABLE Logs ADD action NVARCHAR(255) NOT NULL DEFAULT '';
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'result')
      BEGIN
          ALTER TABLE Logs ADD result NVARCHAR(50) NOT NULL DEFAULT '';
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'details')
      BEGIN
          ALTER TABLE Logs ADD details NVARCHAR(MAX);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'ipAddress')
      BEGIN
          ALTER TABLE Logs ADD ipAddress NVARCHAR(45);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'timestamp')
      BEGIN
          ALTER TABLE Logs ADD timestamp DATETIME DEFAULT GETUTCDATE();
      END;
    `;

    await db.executeQuery(alterTableQuery);

    console.log("'Logs' table altered successfully or already up-to-date.");
    return NextResponse.json({ message: "'Logs' table altered successfully or already up-to-date." }, { status: 200 });

  } catch (error) {
    console.error("Error altering 'Logs' table:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: "Error altering 'Logs' table", error: errorMessage }, { status: 500 });
  }
}
