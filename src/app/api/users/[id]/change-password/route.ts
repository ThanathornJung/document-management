import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { UserRepository } from '@/lib/repositories/UserRepository';

const dbContext = AzureSqlDatabaseContext.getInstance();
const userRepository = new UserRepository(dbContext);

export async function PUT(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/')[3]; // /api/users/[id]/change-password
    const userId = parseInt(id, 10);
    const { currentPassword, newPassword } = await request.json();

    const user = await userRepository.getUserById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify current password
    if (!user.password || !await bcrypt.compare(currentPassword, user.password)) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updated = await userRepository.updateUserPassword(userId, hashedNewPassword);

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
