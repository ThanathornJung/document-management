import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../../lib/db'; // Keep User interface for type consistency
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';

const dbContext = new AzureSqlDatabaseContext();

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = parseInt(context.params.id, 10);
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

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = parseInt(context.params.id, 10);
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