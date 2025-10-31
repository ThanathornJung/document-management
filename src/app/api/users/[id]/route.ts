import { NextRequest, NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

const dbContext = AzureSqlDatabaseContext.getInstance();

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/')[3];
    const userId = parseInt(id, 10);
    const user = await dbContext.getUserById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Exclude sensitive information like password before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    console.log("Backend GET /api/users/[id] response:", userWithoutPassword);
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/')[3];
    const userId = parseInt(id, 10);
    const updatedData = await request.json();

    // Prevent changing sensitive fields like password or id through this route
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, id: _id, ...updatableData } = updatedData;

    const updatedUser = await dbContext.updateUser(userId, updatableData);

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log("Backend PUT /api/users/[id] response:", updatedUser);
    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
