import { AzureSqlDatabaseContext } from '../azure-sql/database';
import sql from 'mssql';

export interface LogEntry {
  username: string;
  method: string;
  action: string;
  result: string;
  details: string;
  ipAddress?: string;
  timestamp?: Date;
}

export class LogRepository {
  private dbContext: AzureSqlDatabaseContext;

  constructor(dbContext: AzureSqlDatabaseContext) {
    this.dbContext = dbContext;
  }

  async addLogEntry(logEntry: LogEntry): Promise<void> {
    try {
      const request = await this.dbContext.createRequest(); // Assuming dbContext has a method to create a request
      request.input('username', sql.NVarChar, logEntry.username);
      request.input('method', sql.NVarChar, logEntry.method || null);
      request.input('action', sql.NVarChar, logEntry.action);
      request.input('result', sql.NVarChar, logEntry.result);
      request.input('details', sql.NVarChar, logEntry.details);
      request.input('ipAddress', sql.NVarChar, logEntry.ipAddress || null);
      request.input('timestamp', sql.DateTime, logEntry.timestamp || new Date());

      const insertLogSql = `
        INSERT INTO Logs (username, method, action, result, details, ipAddress, timestamp)
        VALUES (@username, @method, @action, @result, @details, @ipAddress, @timestamp);
      `;
      await request.query(insertLogSql);
      console.log('Log entry added successfully.');
    } catch (err) {
      console.error('Failed to add log entry:', err);
      // Depending on requirements, you might want to re-throw or handle this more gracefully
    }
  }
}
