// This file will contain the database context for Azure SQL Database.
// It will handle the connection and provide methods for database operations.

import { sqlConfig } from "./connection";
import sql from 'mssql';
import { User, Document } from '../../lib/db'; // Import existing interfaces

export class AzureSqlDatabaseContext {
  private static instance: AzureSqlDatabaseContext;
  private pool: sql.ConnectionPool | undefined;

  private constructor() { // Make constructor private
    console.log("Azure SQL Database Context initialized with config:", sqlConfig);
  }

  public static getInstance(): AzureSqlDatabaseContext {
    if (!AzureSqlDatabaseContext.instance) {
      AzureSqlDatabaseContext.instance = new AzureSqlDatabaseContext();
    }
    return AzureSqlDatabaseContext.instance;
  }

  private async initializePool() {
    if (!this.pool || !this.pool.connected) {
      try {
        this.pool = await sql.connect(sqlConfig);
        console.log("Azure SQL Connection Pool created.");
      } catch (err) {
        console.error("Failed to create Azure SQL Connection Pool:", err);
        throw err;
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initializePool();
      const request = this.pool!.request();
      const result = await request.query('SELECT 1 as result');
      console.log("Azure SQL Test Connection Result:", result.recordset[0].result);
      return result.recordset[0].result === 1;
    } catch (err) {
      console.error("Azure SQL Test Connection Failed:", err);
      return false;
    }
  }

  async createTables(): Promise<void> {
    try {
      await this.initializePool();
      const request = this.pool!.request();

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
          createdAt DATETIME2(0) DEFAULT GETDATE()
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
          createdAt DATETIME2(0) DEFAULT GETDATE(),
          updatedAt DATETIME2(0) DEFAULT GETDATE()
        );
      `;
      await request.query(createDocumentsTableSql);
      console.log("Table 'Documents' created or already exists.");

    } catch (err) {
      console.error("Failed to create tables:", err);
      throw err;
    }
  }

  // User CRUD Operations
  async getUsers(): Promise<User[]> {
    await this.initializePool();
    const result = await this.pool!.request().query('SELECT id, username, firstName, lastName, birthDate, email, tel, createdAt FROM Users');
    return result.recordset as User[];
  }

  async getUserById(id: number): Promise<User | undefined> {
    await this.initializePool();
    const result = await this.pool!.request()
      .input('id', sql.Int, id)
      .query('SELECT id, username, firstName, lastName, birthDate, email, tel, createdAt FROM Users WHERE id = @id');
    return result.recordset[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.initializePool();
    const result = await this.pool!.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT id, username, password, firstName, lastName, birthDate, email, tel, createdAt FROM Users WHERE username = @username');
    return result.recordset[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.initializePool();
    const result = await this.pool!.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, username, password, firstName, lastName, birthDate, email, tel, createdAt FROM Users WHERE email = @email');
    return result.recordset[0] as User | undefined;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await this.initializePool();
    const request = this.pool!.request();
    request.input('username', sql.NVarChar, user.username);
    request.input('password', sql.NVarChar, user.password);
    request.input('firstName', sql.NVarChar, user.firstName);
    request.input('lastName', sql.NVarChar, user.lastName);
    request.input('birthDate', sql.Date, user.birthDate);
    request.input('email', sql.NVarChar, user.email);
    request.input('tel', sql.NVarChar, user.tel);

    const result = await request.query(`
      INSERT INTO Users (username, password, firstName, lastName, birthDate, email, tel)
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.firstName, INSERTED.lastName, INSERTED.birthDate, INSERTED.email, INSERTED.tel, INSERTED.createdAt
      VALUES (@username, @password, @firstName, @lastName, @birthDate, @email, @tel)
    `);
    return result.recordset[0] as User;
  }

  async updateUser(id: number, userData: Partial<Omit<User, 'id' | 'username' | 'password' | 'createdAt'>>): Promise<User | undefined> {
    await this.initializePool();
    const request = this.pool!.request();
    let query = 'UPDATE Users SET ';
    const updates: string[] = [];

    if (userData.firstName !== undefined) { updates.push('firstName = @firstName'); request.input('firstName', sql.NVarChar, userData.firstName); }
    if (userData.lastName !== undefined) { updates.push('lastName = @lastName'); request.input('lastName', sql.NVarChar, userData.lastName); }
    if (userData.birthDate !== undefined) { updates.push('birthDate = @birthDate'); request.input('birthDate', sql.Date, userData.birthDate); }
    if (userData.email !== undefined) { updates.push('email = @email'); request.input('email', sql.NVarChar, userData.email); }
    if (userData.tel !== undefined) { updates.push('tel = @tel'); request.input('tel', sql.NVarChar, userData.tel); }

    if (updates.length === 0) {
      return this.getUserById(id); // No updates to perform
    }

    query += updates.join(', ') + ' WHERE id = @id';
    request.input('id', sql.Int, id);

    const result = await request.query(query);
    if (result.rowsAffected[0] > 0) {
      return this.getUserById(id);
    }
    return undefined;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    await this.initializePool();
    const result = await this.pool!.request()
      .input('id', sql.Int, id)
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .query('UPDATE Users SET password = @hashedPassword WHERE id = @id');
    return result.rowsAffected[0] > 0;
  }

  // Document CRUD Operations
  async getDocuments(): Promise<Document[]> {
    await this.initializePool();
    const result = await this.pool!.request().query('SELECT id, title, content, createdAt, updatedAt FROM Documents');
    return result.recordset as Document[];
  }

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    await this.initializePool();
    const request = this.pool!.request();
    request.input('title', sql.NVarChar, document.title);
    request.input('content', sql.NVarChar, document.content);

    const result = await request.query(`
      INSERT INTO Documents (title, content)
      OUTPUT INSERTED.id, INSERTED.title, INSERTED.content, INSERTED.createdAt, INSERTED.updatedAt
      VALUES (@title, @content)
    `);
    return result.recordset[0] as Document;
  }

  async updateDocument(id: number, documentData: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<Document | undefined> {
    await this.initializePool();
    const request = this.pool!.request();
    let query = 'UPDATE Documents SET updatedAt = GETDATE()'; // Always update updatedAt
    
    if (documentData.title !== undefined) { query += ', title = @title'; request.input('title', sql.NVarChar, documentData.title); }
    if (documentData.content !== undefined) { query += ', content = @content'; request.input('content', sql.NVarChar, documentData.content); }

    query += ' WHERE id = @id';
    request.input('id', sql.Int, id);

    const result = await request.query(query);
    if (result.rowsAffected[0] > 0) {
      return (await this.pool!.request().input('id', sql.Int, id).query('SELECT id, title, content, createdAt, updatedAt FROM Documents WHERE id = @id')).recordset[0] as Document;
    }
    return undefined;
  }

  public async executeQuery(query: string): Promise<sql.IResult<unknown>> {
    await this.initializePool();
    const request = this.pool!.request();
    return await request.query(query);
  }
}