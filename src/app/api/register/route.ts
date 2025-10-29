import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sha1 from 'sha1';
import { readDb, writeDb, Db, User } from '../../../lib/db';

async function checkPwnedPassword(password: string): Promise<boolean> {
  const sha1Hash = sha1(password).toUpperCase();
  const prefix = sha1Hash.substring(0, 5);
  const suffix = sha1Hash.substring(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) {
    console.error(`HIBP API error: ${response.status} ${response.statusText}`);
    return false;
  }

  const text = await response.text();
  const pwnedHashes = text.split('\n').map(line => line.trim().split(':'));

  for (const [hashSuffix, count] of pwnedHashes) {
    if (hashSuffix === suffix) {
      console.warn(`Password found in data breach with ${count} occurrences.`);
      return true;
    }
  }
  return false;
}

export async function POST(request: Request) {

  try {
    const { firstName, lastName, birthDate, email, tel, username, password } = await request.json();

    const db: Db = await readDb(); // Use helper to read

    // Check if username or email already exists
    if (db.users.some((user: User) => user.username === username)) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    if (db.users.some((user: User) => user.email === email)) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    // Check if password has been pwned
    if (await checkPwnedPassword(password)) {
      return NextResponse.json({ message: 'The password you just used was found in a data breach. Please choose a different password.' }, { status: 400 });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser: User = {
      id: db.users.length > 0 ? Math.max(...db.users.map((user: User) => user.id)) + 1 : 1,
      firstName,
      lastName,
      birthDate,
      email,
      tel,
      username,
      password: hashedPassword, // Store the hashed password
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    await writeDb(db); // Use helper to write

    return NextResponse.json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username, firstName: newUser.firstName, lastName: newUser.lastName, birthDate: newUser.birthDate, email: newUser.email, tel: newUser.tel } }, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
