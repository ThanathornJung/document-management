import { AzureSqlDatabaseContext } from '../azure-sql/database';
import sql from 'mssql';
import { Document } from '../../lib/db';

export class DocumentRepository {
  private dbContext: AzureSqlDatabaseContext;

  constructor(dbContext: AzureSqlDatabaseContext) {
    this.dbContext = dbContext;
  }

  async getDocuments(page: number = 1, pageSize: number = 10, sortBy: string = 'id', sortOrder: 'ASC' | 'DESC' = 'ASC'): Promise<Document[]> {
    const request = await this.dbContext.createRequest();
    const offset = (page - 1) * pageSize;
    const result = await request
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
      .query(`
        SELECT 
          id, 
          title, 
          category, 
          description, 
          filePath, 
          createdAt, 
          updatedAt
        FROM Documents
        ORDER BY ${sortBy} ${sortOrder}
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);
    return result.recordset as Document[];
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const request = await this.dbContext.createRequest();
    const result = await request
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id, 
          title, 
          category, 
          description, 
          filePath, 
          createdAt, 
          updatedAt
        FROM Documents WHERE id = @id
      `);
    return result.recordset[0] as Document | undefined;
  }

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'content'>): Promise<Document> {
    const request = await this.dbContext.createRequest();
    request.input('title', sql.NVarChar, document.title);
    request.input('category', sql.NVarChar, document.category);
    request.input('description', sql.NVarChar, document.description);
    request.input('filePath', sql.NVarChar, document.filePath);

    const result = await request.query(`
      INSERT INTO Documents (title, category, description, filePath)
      OUTPUT 
        INSERTED.id, 
        INSERTED.title, 
        INSERTED.category, 
        INSERTED.description, 
        INSERTED.filePath, 
        INSERTED.createdAt, 
        INSERTED.updatedAt
      VALUES (@title, @category, @description, @filePath)
    `);
    return result.recordset[0] as Document;
  }

  async updateDocument(id: number, documentData: Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt'> & { filePath?: string }>): Promise<Document | undefined> {
    const request = await this.dbContext.createRequest();
    let query = 'UPDATE Documents SET updatedAt = GETDATE()';
    const updates: string[] = [];

    if (documentData.title !== undefined) { updates.push('title = @title'); request.input('title', sql.NVarChar, documentData.title); }
    if (documentData.category !== undefined) { updates.push('category = @category'); request.input('category', sql.NVarChar, documentData.category); }
    if (documentData.description !== undefined) { updates.push('description = @description'); request.input('description', sql.NVarChar, documentData.description); }
    if (documentData.filePath !== undefined) { updates.push('filePath = @filePath'); request.input('filePath', sql.NVarChar, documentData.filePath); }

    if (updates.length === 0) {
      return this.getDocumentById(id);
    }

    query += `, ${updates.join(', ')}
      OUTPUT 
        INSERTED.id, 
        INSERTED.title, 
        INSERTED.category, 
        INSERTED.description, 
        INSERTED.filePath, 
        INSERTED.createdAt, 
        INSERTED.updatedAt
      WHERE id = @id`;
    request.input('id', sql.Int, id);

    const result = await request.query(query);
    return result.recordset[0] as Document | undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const request = await this.dbContext.createRequest();
    const result = await request
      .input('id', sql.Int, id)
      .query('DELETE FROM Documents WHERE id = @id');
    return result.rowsAffected[0] > 0;
  }
}
