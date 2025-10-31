import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

const dbContext = new AzureSqlDatabaseContext();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id, 10);
    const { currentPassword, newPassword } = await request.json();

    const user = await dbContext.getUserById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (!user.password || !await bcrypt.compare(currentPassword, user.password)) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updated = await dbContext.updateUserPassword(userId, hashedNewPassword);

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}