import { NextResponse } from 'next/server';
import { readDb, writeDb, Db, Document } from '../../../lib/db';

export async function GET() {
  try {
    const db: Db = await readDb(); // Use helper to read
    return NextResponse.json(db.documents);
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

    const db: Db = await readDb(); // Use helper to read

    const newDocument: Document = {
      id: db.documents.length > 0 ? Math.max(...db.documents.map((doc: Document) => doc.id)) + 1 : 1,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.documents.push(newDocument);
    await writeDb(db); // Use helper to write

    return NextResponse.json({ message: 'Document created successfully', document: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, content } = await request.json(); // Assuming ID is passed in the body for simplicity

    const db: Db = await readDb(); // Use helper to read

    const documentIndex = db.documents.findIndex((doc: Document) => doc.id === id);

    if (documentIndex === -1) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    db.documents[documentIndex] = {
      ...db.documents[documentIndex],
      title: title || db.documents[documentIndex].title,
      content: content || db.documents[documentIndex].content,
      updatedAt: new Date().toISOString(),
    };

    await writeDb(db); // Use helper to write

    return NextResponse.json({ message: 'Document updated successfully', document: db.documents[documentIndex] });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}