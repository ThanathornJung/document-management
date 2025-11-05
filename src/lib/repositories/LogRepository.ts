import { AzureSqlDatabaseContext } from '../azure-sql/database';
import sql from 'mssql';

export interface LogEntry {
  id?: number;
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
    } catch (err) {
      console.error('Failed to add log entry:', err);
      // Depending on requirements, you might want to re-throw or handle this more gracefully
    }
  }

  async getLogs(
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'timestamp',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    filterUsername?: string,
    filterAction?: string,
    filterResult?: string
  ): Promise<LogEntry[]> {
    const request = await this.dbContext.createRequest();
    const offset = (page - 1) * pageSize;

    // Validate sortBy to prevent SQL injection
    const validSortBy = ['id', 'timestamp', 'username', 'action', 'details', 'result', 'method', 'ipAddress'];
    if (!validSortBy.includes(sortBy)) {
      sortBy = 'timestamp'; // Default to timestamp if invalid
    }

    let whereClause = '';

    if (filterUsername) {
      whereClause += ' AND username LIKE @filterUsername';
      request.input('filterUsername', sql.NVarChar, `%${filterUsername}%`);
    }
    if (filterAction) {
      whereClause += ' AND action LIKE @filterAction';
      request.input('filterAction', sql.NVarChar, `%${filterAction}%`);
    }
    if (filterResult) {
      whereClause += ' AND result LIKE @filterResult';
      request.input('filterResult', sql.NVarChar, `%${filterResult}%`);
    }

    // Remove the leading ' AND ' if it exists
    if (whereClause.startsWith(' AND ')) {
      whereClause = ' WHERE ' + whereClause.substring(5);
    }


    const query = `
      SELECT id, timestamp, username, action, details, result, method, ipAddress
      FROM Logs
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY;
    `;

    const result = await request
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
      .query(query);
    return result.recordset as LogEntry[];
  }
}
