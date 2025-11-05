import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { LogRepository } from '@/lib/repositories/LogRepository';

export async function POST(request: Request) {
  let dbContext;
  try {
    dbContext = await AzureSqlDatabaseContext.getInstance();
    const userRepository = new UserRepository(dbContext);
    const logRepository = new LogRepository(dbContext);

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
    }

    // Check if an admin user already exists to prevent multiple super-admins
    const existingAdmin = await userRepository.getUserByUsername(username);
    if (existingAdmin && existingAdmin.role === 'admin') {
      return NextResponse.json({ message: 'Admin user already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.createUser({
      username,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      tel: 'N/A',
      birthDate: new Date('2000-01-01'),
      role: 'admin',
    });

    await logRepository.addLogEntry({
      username: newUser.username,
      action: 'CREATE_ADMIN_USER',
      details: 'Initial admin user created successfully.',
      result: 'SUCCESS',
      method: 'POST',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
    });

    return NextResponse.json({ message: 'Admin user created successfully.', user: { id: newUser.id, username: newUser.username, role: newUser.role } }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin user:', error);
    if (dbContext) {
      const logRepository = new LogRepository(dbContext);
      await logRepository.addLogEntry({
        username: 'system',
        action: 'CREATE_ADMIN_USER',
        details: `Failed to create admin user. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
    }
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
