import { NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

const dbContext = AzureSqlDatabaseContext.getInstance();

export async function GET() {
  try {
    const documents = await dbContext.getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json(
      { message: 'Failed to fetch documents', error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    const newDocument = await dbContext.createDocument({ title, content });

    return NextResponse.json({ message: 'Document created successfully', document: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, content } = await request.json();

    const updatedDocument = await dbContext.updateDocument(id, { title, content });

    if (!updatedDocument) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Document updated successfully', document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}