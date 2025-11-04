import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request) {
  const dbContext = AzureSqlDatabaseContext.getInstance();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'ASC';

    const documents = await dbContext.getDocuments(page, pageSize, sortBy, sortOrder);
    
    // Format dates for the response
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    }));

    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json(
      { message: 'Failed to fetch documents', error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const dbContext = AzureSqlDatabaseContext.getInstance();
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${title || file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filePath, buffer);

    const newDocument = await dbContext.createDocument({
      title: title || file.name,
      category,
      description,
      filePath: `/uploads/${filename}`,
    });

    return NextResponse.json({ message: 'Document uploaded successfully', document: {
      ...newDocument,
      createdAt: newDocument.createdAt ? new Date(newDocument.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: newDocument.updatedAt ? new Date(newDocument.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    } }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

import { unlink } from 'fs/promises';

export async function PUT(request: Request) {
  const dbContext = AzureSqlDatabaseContext.getInstance();
  try {
    const contentType = request.headers.get('content-type') || '';
    let id, category, description, file, newFileName;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      id = parseInt(formData.get('id') as string, 10);
      category = formData.get('category') as string;
      description = formData.get('description') as string;
      file = formData.get('file') as File | null;
      newFileName = formData.get('newFileName') as string | null;
    } else {
      const body = await request.json();
      id = body.id;
      category = body.category;
      description = body.description;
      file = null;
      newFileName = body.newFileName;
    }

    const existingDocument = await dbContext.getDocumentById(id);
    if (!existingDocument) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    let filePath = existingDocument.filePath;
    let title = existingDocument.title;

    if (file) {
      console.log('File found, processing file upload');
      // Delete old file
      if (existingDocument.filePath) {
        const oldFilePath = join(process.cwd(), 'public', existingDocument.filePath);
        try {
          await unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }

      // Save new file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${newFileName || file.name}`;
      const newFilePath = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(newFilePath, buffer);
      filePath = `/uploads/${filename}`;
      title = newFileName || file.name;
      console.log('New file path:', filePath);
    } else if (newFileName && newFileName !== existingDocument.title) {
      title = newFileName;
    }

    console.log('Updating document with:', { id, category, description, filePath, title });
    const updatedDocument = await dbContext.updateDocument(id, { category, description, filePath, title });

    return NextResponse.json({ message: 'Document updated successfully', document: {
      ...updatedDocument,
      createdAt: updatedDocument?.createdAt ? new Date(updatedDocument.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: updatedDocument?.updatedAt ? new Date(updatedDocument.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    } });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const dbContext = AzureSqlDatabaseContext.getInstance();
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') as string, 10);

    const existingDocument = await dbContext.getDocumentById(id);
    if (!existingDocument) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    if (existingDocument.filePath) {
      const oldFilePath = join(process.cwd(), 'public', existingDocument.filePath);
      try {
        await unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    const deleted = await dbContext.deleteDocument(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}