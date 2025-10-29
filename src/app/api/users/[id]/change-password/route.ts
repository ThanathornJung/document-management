import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { readDb, writeDb, Db, User } from '../../../../lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id, 10);
    const { currentPassword, newPassword } = await request.json();

    const db: Db = await readDb();
    const userIndex = db.users.findIndex((u: User) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = db.users[userIndex];

    // Verify current password
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    db.users[userIndex].password = hashedNewPassword;
    await writeDb(db);

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
