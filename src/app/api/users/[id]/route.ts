import { NextResponse } from 'next/server';
import { readDb, writeDb, Db, User } from '../../../../lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params; // Await the params object
    const userId = parseInt(resolvedParams.id, 10);
    const db: Db = await readDb();
    const user = db.users.find((u: User) => {
      return u.id === userId;
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Exclude sensitive information like password before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params; // Await the params object
    const userId = parseInt(resolvedParams.id, 10);
    const updatedData = await request.json();

    const db: Db = await readDb();
    const userIndex = db.users.findIndex((u: User) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent changing sensitive fields like password or id through this route
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, id: _id, ...updatableData } = updatedData;

    db.users[userIndex] = { ...db.users[userIndex], ...updatableData };
    await writeDb(db);

    return NextResponse.json({ message: 'User updated successfully', user: db.users[userIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}