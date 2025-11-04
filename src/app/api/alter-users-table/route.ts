
import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function GET() {
  const db = AzureSqlDatabaseContext.getInstance();
  try {
    console.log("Attempting to alter 'Users' table...");

    const alterTableQuery = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'username')
      BEGIN
          ALTER TABLE Users ADD username NVARCHAR(255) NOT NULL UNIQUE;
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'password')
      BEGIN
          ALTER TABLE Users ADD password NVARCHAR(255) NOT NULL;
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'firstName')
      BEGIN
          ALTER TABLE Users ADD firstName NVARCHAR(255);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'lastName')
      BEGIN
          ALTER TABLE Users ADD lastName NVARCHAR(255);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'birthDate')
      BEGIN
          ALTER TABLE Users ADD birthDate DATE;
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'email')
      BEGIN
          ALTER TABLE Users ADD email NVARCHAR(255) UNIQUE;
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'tel')
      BEGIN
          ALTER TABLE Users ADD tel NVARCHAR(50);
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'createdAt')
      BEGIN
          ALTER TABLE Users ADD createdAt DATETIME2(0) DEFAULT GETDATE();
      END;

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'updatedAt')
      BEGIN
          ALTER TABLE Users ADD updatedAt DATETIME2(0) DEFAULT GETDATE();
      END;
    `;

    await db.executeQuery(alterTableQuery);

    console.log("'Users' table altered successfully or already up-to-date.");
    return NextResponse.json({ message: "'Users' table altered successfully or already up-to-date." }, { status: 200 });

  } catch (error) {
    console.error("Error altering 'Users' table:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: "Error altering 'Users' table", error: errorMessage }, { status: 500 });
  }
}
