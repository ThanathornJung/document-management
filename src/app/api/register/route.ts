import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { AzureSqlDatabaseContext } from '@/lib/azure-sql/database';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { LogRepository } from '@/lib/repositories/LogRepository';

export async function POST(request: Request) {
  let requestBody;
  let dbContext;
  try {
    dbContext = await AzureSqlDatabaseContext.getInstance();
    const userRepository = new UserRepository(dbContext);
    const logRepository = new LogRepository(dbContext);
    requestBody = await request.json();
    const { firstName, lastName, birthDate, email, tel, username, password } = requestBody;

    // Basic validation
    if (!username || !password || !email || !firstName || !lastName) {
      await logRepository.addLogEntry({
        username: username || 'N/A',
        action: 'REGISTER',
        details: 'Attempted registration with missing fields',
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
      return NextResponse.json({ message: 'Missing required fields: username, password, email, firstName, lastName' }, { status: 400 });
    }

    // Check if username or email already exists
    const existingUserByUsername = await userRepository.getUserByUsername(username);
    if (existingUserByUsername) {
      await logRepository.addLogEntry({
        username: username,
        action: 'REGISTER',
        details: 'Attempted registration with existing username',
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    const existingUserByEmail = await userRepository.getUserByEmail(email);
    if (existingUserByEmail) {
      await logRepository.addLogEntry({
        username: username,
        action: 'REGISTER',
        details: 'Attempted registration with existing email',
        result: 'FAILURE',
        method: 'POST',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
      });
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = await userRepository.createUser({
      firstName,
      lastName,
      birthDate,
      email,
      tel,
      username,
      password: hashedPassword,
      role: 'user', // Assign default role
    });

    await logRepository.addLogEntry({
      username: newUser.username,
      action: 'REGISTER',
      details: 'User registered successfully',
      result: 'SUCCESS',
      method: 'POST',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
    });

    return NextResponse.json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, firstName: newUser.firstName, lastName: newUser.lastName, birthDate: newUser.birthDate, email: newUser.email, tel: newUser.tel, role: newUser.role } }, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    if (dbContext) {
        const logRepository = new LogRepository(dbContext);
        await logRepository.addLogEntry({
            username: requestBody?.username || 'N/A',
            action: 'REGISTER',
            details: 'Error during registration',
            result: 'FAILURE',
            method: 'POST',
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A',
          });
    }
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}