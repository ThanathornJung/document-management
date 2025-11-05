import { AzureSqlDatabaseContext } from '../azure-sql/database';
import sql from 'mssql';
import { User } from '../../lib/db';

export class UserRepository {
  private dbContext: AzureSqlDatabaseContext;

  constructor(dbContext: AzureSqlDatabaseContext) {
    this.dbContext = dbContext;
  }

  async getUsers(page: number = 1, pageSize: number = 10, sortBy: string = 'id', sortOrder: 'ASC' | 'DESC' = 'ASC'): Promise<User[]> {
    const request = await this.dbContext.createRequest();
    const offset = (page - 1) * pageSize;
    const result = await request
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
      .query(`
      SELECT 
        id, 
        username, 
        firstName, 
        lastName, 
        birthDate, 
        email, 
        tel, 
        role, 
        createdAt,
        updatedAt
      FROM Users
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);
    return result.recordset as User[];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const request = await this.dbContext.createRequest();
    const result = await request
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id, 
          username, 
          firstName, 
          lastName, 
          birthDate, 
          email, 
          tel, 
          role, 
          createdAt,
          updatedAt
        FROM Users WHERE id = @id
      `);
    return result.recordset[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const request = await this.dbContext.createRequest();
    const result = await request
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT 
          id, 
          username, 
          password, 
          firstName, 
          lastName, 
          birthDate, 
          email, 
          tel, 
          role, 
          createdAt,
          updatedAt
        FROM Users WHERE username = @username
      `);
    return result.recordset[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const request = await this.dbContext.createRequest();
    const result = await request
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT 
          id, 
          username, 
          password, 
          firstName, 
          lastName, 
          birthDate, 
          email, 
          tel, 
          role, 
          createdAt,
          updatedAt
        FROM Users WHERE email = @email
      `);
    return result.recordset[0] as User | undefined;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const request = await this.dbContext.createRequest();
    request.input('username', sql.NVarChar, user.username);
    request.input('password', sql.NVarChar, user.password);
    request.input('firstName', sql.NVarChar, user.firstName);
    request.input('lastName', sql.NVarChar, user.lastName);
    request.input('birthDate', sql.Date, user.birthDate);
    request.input('email', sql.NVarChar, user.email);
    request.input('tel', sql.NVarChar, user.tel);
    request.input('role', sql.NVarChar, user.role || 'user');

    const result = await request.query(`
      INSERT INTO Users (username, password, firstName, lastName, birthDate, email, tel, role)
      OUTPUT 
        INSERTED.id, 
        INSERTED.username, 
        INSERTED.firstName, 
        INSERTED.lastName, 
        INSERTED.birthDate, 
        INSERTED.email, 
        INSERTED.tel, 
        INSERTED.role, 
        INSERTED.createdAt,
        INSERTED.updatedAt
      VALUES (@username, @password, @firstName, @lastName, @birthDate, @email, @tel, @role)
    `);
    return result.recordset[0] as User;
  }

  async updateUser(id: number, userData: Partial<Omit<User, 'id' | 'username' | 'password' | 'createdAt' | 'updatedAt'>>): Promise<User | undefined> {
    const request = await this.dbContext.createRequest();
    let query = 'UPDATE Users SET updatedAt = GETDATE()'; // Always update updatedAt
    const updates: string[] = [];

    if (userData.firstName !== undefined) { updates.push('firstName = @firstName'); request.input('firstName', sql.NVarChar, userData.firstName); }
    if (userData.lastName !== undefined) { updates.push('lastName = @lastName'); request.input('lastName', sql.NVarChar, userData.lastName); }
    if (userData.birthDate !== undefined) { updates.push('birthDate = @birthDate'); request.input('birthDate', sql.Date, userData.birthDate); }
    if (userData.email !== undefined) { updates.push('email = @email'); request.input('email', sql.NVarChar, userData.email); }
    if (userData.tel !== undefined) { updates.push('tel = @tel'); request.input('tel', sql.NVarChar, userData.tel); }
    if (userData.role !== undefined) { updates.push('role = @role'); request.input('role', sql.NVarChar, userData.role); }

    if (updates.length === 0) {
      // If no other fields are updated, just update updatedAt
      query += ' WHERE id = @id';
    } else {
      query += `, ${updates.join(', ')}
      OUTPUT 
        INSERTED.id, 
        INSERTED.username, 
        INSERTED.firstName, 
        INSERTED.lastName, 
        INSERTED.birthDate, 
        INSERTED.email, 
        INSERTED.tel, 
        INSERTED.role, 
        INSERTED.createdAt,
        INSERTED.updatedAt
      WHERE id = @id`;
    }
    request.input('id', sql.Int, id);

    const result = await request.query(query);
    return result.recordset[0] as User | undefined;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    const request = await this.dbContext.createRequest();
    const result = await request
      .input('id', sql.Int, id)
      .input('hashedPassword', sql.NVarChar, hashedPassword)
      .query('UPDATE Users SET password = @hashedPassword WHERE id = @id');
    return result.rowsAffected[0] > 0;
  }
}
