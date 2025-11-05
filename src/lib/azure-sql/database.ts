// This file will contain the database context for Azure SQL Database.
// It will handle the connection and provide methods for database operations.

import { sqlConfig } from "./connection";
import sql from 'mssql';
// import { User, Document } from '../../lib/db'; // Import existing interfaces

export class AzureSqlDatabaseContext { // Added comment to force reload
  private static instance: AzureSqlDatabaseContext;
  private pool: sql.ConnectionPool | undefined;

  private constructor() { // Make constructor private
  }

  public static async getInstance(): Promise<AzureSqlDatabaseContext> {
    if (!AzureSqlDatabaseContext.instance) {
      AzureSqlDatabaseContext.instance = new AzureSqlDatabaseContext();
      await AzureSqlDatabaseContext.instance.initializePool(); // Initialize pool here
    }
    return AzureSqlDatabaseContext.instance;
  }

  private async initializePool() {
    if (this.pool && this.pool.connected) {
      return;
    }

    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        this.pool = await sql.connect(sqlConfig);
        console.log("Azure SQL Connection Pool created.");
        return; // Success, exit the loop
      } catch (err: unknown) {
        console.error(`Attempt ${i + 1} of ${maxRetries}: Failed to create Azure SQL Connection Pool.`);
        if (typeof err === 'object' && err !== null) {
          const error = err as { code?: string; originalError?: unknown };
          if (error.code) {
            console.error(`Error Code: ${error.code}`);
          }
          if (error.originalError) {
            console.error(`Original Error: ${error.originalError}`);
          }
        }
        console.error(`Full Error: ${err}`);

        if (i < maxRetries - 1) {
          console.log(`Retrying in ${retryDelay / 1000} seconds...`);
          await new Promise(res => setTimeout(res, retryDelay));
        } else {
          console.error("All connection attempts failed.");
          throw err; // Throw the last error
        }
      }
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.pool) {
      console.error("Connection pool has not been initialized.");
      return false;
    }
    try {
      const request = this.pool.request();
      const result = await request.query('SELECT 1 as result');
      console.log("Azure SQL Test Connection Result:", result.recordset[0].result);
      return result.recordset[0].result === 1;
    } catch (err) {
      console.error("Azure SQL Test Connection Failed:", err);
      return false;
    }
  }

  async createTables(): Promise<void> {
    if (!this.pool) {
      throw new Error("Connection pool has not been initialized.");
    }
    try {
      const request = this.pool.request();

      const createUsersTableSql = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
        CREATE TABLE Users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(255) NOT NULL UNIQUE,
          password NVARCHAR(255) NOT NULL,
          firstName NVARCHAR(255),
          lastName NVARCHAR(255),
          birthDate DATE,
          email NVARCHAR(255) UNIQUE,
          tel NVARCHAR(50),
          createdAt DATETIME2(0) DEFAULT GETDATE(),
          updatedAt DATETIME2(0) DEFAULT GETUTCDATE()
        );
      `;
      await request.query(createUsersTableSql);
      console.log("Table 'Users' created or already exists.");

      const createDocumentsTableSql = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Documents' and xtype='U')
        CREATE TABLE Documents (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          content NVARCHAR(MAX),
          createdAt DATETIME2(0) DEFAULT GETUTCDATE(),
          updatedAt DATETIME2(0) DEFAULT GETUTCDATE()
        );
      `;
      await request.query(createDocumentsTableSql);
      console.log("Table 'Documents' created or already exists.");

    } catch (err) {
      console.error("Failed to create tables:", err);
      throw err;
    }
  }

  async createLogTable(): Promise<void> {
    if (!this.pool) {
      throw new Error("Connection pool has not been initialized.");
    }
    try {
      const request = this.pool.request();

      const createLogTableSql = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Logs' and xtype='U')
        CREATE TABLE Logs (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(255) NULL,
          method NVARCHAR(10) NULL,
          action NVARCHAR(255) NOT NULL,
          result NVARCHAR(50) NOT NULL,
          details NVARCHAR(MAX),
          ipAddress NVARCHAR(45) NULL,
          timestamp DATETIME DEFAULT GETUTCDATE()
        );
      `;
      await request.query(createLogTableSql);
      console.log("Table 'Logs' created or already exists.");
    } catch (err) {
      console.error("Failed to create Logs table:", err);
      throw err;
    }
  }

  public async createRequest(): Promise<sql.Request> {
    if (!this.pool) {
      throw new Error("Connection pool has not been initialized.");
    }
    return this.pool.request();
  }

  public async executeQuery(query: string): Promise<sql.IResult<unknown>> {
    if (!this.pool) {
      throw new Error("Connection pool has not been initialized.");
    }
    const request = this.pool.request();
    return await request.query(query);
  }
}