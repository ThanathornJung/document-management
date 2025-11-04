import { NextRequest, NextResponse } from 'next/server';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { UserRepository } from '@/lib/repositories/UserRepository';

const dbContext = AzureSqlDatabaseContext.getInstance();
const userRepository = new UserRepository(dbContext);

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/')[3];
    const userId = parseInt(id, 10);
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Exclude sensitive information like password before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    // No need to format dates here, return raw Date objects
    const responseUser = {
      ...userWithoutPassword,
      createdAt: userWithoutPassword.createdAt ? new Date(userWithoutPassword.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: userWithoutPassword.updatedAt ? new Date(userWithoutPassword.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    };

    console.log("Backend GET /api/users/[id] response:", responseUser);
    return NextResponse.json(responseUser, { status: 200 });
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
    const { password: _password, id: _id, birthDate: rawBirthDate, ...updatableData } = updatedData;

    let birthDate: Date | undefined;
    if (rawBirthDate) {
      birthDate = new Date(rawBirthDate);
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json({ message: 'Invalid birthDate format' }, { status: 400 });
      }
    }

    const updatedUser = await userRepository.updateUser(userId, { ...updatableData, birthDate });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Format dates for the response
    const responseUser = {
      ...updatedUser,
      createdAt: updatedUser.createdAt ? new Date(updatedUser.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
      updatedAt: updatedUser.updatedAt ? new Date(updatedUser.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : undefined,
    };

    console.log("Backend PUT /api/users/[id] response:", responseUser);
    return NextResponse.json({ message: 'User updated successfully', user: responseUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
