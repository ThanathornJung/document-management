import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

export async function POST() {
  try {
    const dbContext = await AzureSqlDatabaseContext.getInstance();

    // 1. Create Logs table if it doesn't exist
    const createTableSql = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs')
      BEGIN
          CREATE TABLE Logs (
              id INT IDENTITY(1,1) PRIMARY KEY,
              username NVARCHAR(255) NOT NULL,
              method NVARCHAR(50),
              action NVARCHAR(255) NOT NULL,
              result NVARCHAR(50) NOT NULL,
              details NVARCHAR(MAX),
              ipAddress NVARCHAR(50),
              timestamp DATETIME DEFAULT GETDATE()
          );
      END;
    `;
    await dbContext.executeQuery(createTableSql);

    // 2. Reorder 'id' column if it's not the first column in an existing table
    const reorderIdColumnSql = `
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs')
      BEGIN
          DECLARE @id_ordinal_position INT;
          SELECT @id_ordinal_position = ORDINAL_POSITION
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'id';

          IF @id_ordinal_position IS NOT NULL AND @id_ordinal_position <> 1
          BEGIN
              -- 1. Rename existing table
              EXEC sp_rename 'Logs', 'Logs_old';

              -- 2. Create new Logs table with 'id' as first column
              CREATE TABLE Logs (
                  id INT IDENTITY(1,1) PRIMARY KEY,
                  username NVARCHAR(255) NOT NULL,
                  method NVARCHAR(50),
                  action NVARCHAR(255) NOT NULL,
                  result NVARCHAR(50) NOT NULL,
                  details NVARCHAR(MAX),
                  ipAddress NVARCHAR(50),
                  timestamp DATETIME DEFAULT GETDATE()
              );

              -- 3. Copy data from old table to new table
              SET IDENTITY_INSERT Logs ON;
              INSERT INTO Logs (id, username, method, action, result, details, ipAddress, timestamp)
              SELECT id, username, method, action, result, details, ipAddress, timestamp
              FROM Logs_old;
              SET IDENTITY_INSERT Logs OFF;

              -- 4. Drop old table
              DROP TABLE Logs_old;
          END;
      END;
    `;
    await dbContext.executeQuery(reorderIdColumnSql);

    // 3. If table exists, ensure 'id' column exists. If not, add it.
    const addIdColumnSql = `
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs')
      BEGIN
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'id')
          BEGIN
              ALTER TABLE Logs ADD id INT IDENTITY(1,1);
          END;
      END;
    `;
    await dbContext.executeQuery(addIdColumnSql);

    // 4. Ensure 'id' column is NOT NULL before adding primary key (if not already PK)
    const ensureNotNullSql = `
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs')
      BEGIN
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_TYPE = 'PRIMARY KEY' AND TABLE_NAME = 'Logs')
          BEGIN
              IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Logs' AND COLUMN_NAME = 'id' AND IS_NULLABLE = 'YES')
              BEGIN
                  ALTER TABLE Logs ALTER COLUMN id INT NOT NULL;
              END;
          END;
      END;
    `;
    await dbContext.executeQuery(ensureNotNullSql);

    // 5. Remove duplicate 'id' values, keeping one instance of each (if not already PK)
    const removeDuplicatesSql = `
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs')
      BEGIN
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_TYPE = 'PRIMARY KEY' AND TABLE_NAME = 'Logs')
          BEGIN
              WITH CTE AS (
                  SELECT
                      id,
                      ROW_NUMBER() OVER (PARTITION BY id ORDER BY id) as rn
                  FROM Logs
              )
              DELETE FROM CTE WHERE rn > 1;
          END;
      END;
    `;
    await dbContext.executeQuery(removeDuplicatesSql);

    // 6. Add Primary Key if it doesn't exist
    const addPrimaryKeySql = `
      IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Logs')
      BEGIN
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_TYPE = 'PRIMARY KEY' AND TABLE_NAME = 'Logs')
          BEGIN
              ALTER TABLE Logs
              ADD CONSTRAINT PK_Logs_id PRIMARY KEY (id);
          END;
      END;
    `;
    await dbContext.executeQuery(addPrimaryKeySql);

    return NextResponse.json({ message: 'Logs table schema updated successfully (id field set as PRIMARY KEY).', status: 200 });
  } catch (error: unknown) {
    console.error('Failed to alter Logs table schema:', error);
    return NextResponse.json({ message: 'Failed to alter Logs table schema', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
