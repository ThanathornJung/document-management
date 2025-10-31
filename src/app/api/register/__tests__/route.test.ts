import { POST } from '../route';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import sha1 from 'sha1';

// Mock AzureSqlDatabaseContext methods
const mockGetUserByUsername = jest.fn();
const mockGetUserByEmail = jest.fn();
const mockCreateUser = jest.fn();

// Mock AzureSqlDatabaseContext constructor
jest.mock('@/lib/azure-sql/database', () => ({
  AzureSqlDatabaseContext: jest.fn().mockImplementation(() => ({
    getUserByUsername: mockGetUserByUsername,
    getUserByEmail: mockGetUserByEmail,
    createUser: mockCreateUser,
  })),
  __esModule: true,
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

// Mock sha1 (assuming it's a default export or has a specific mock structure)
jest.mock('sha1', () => jest.fn());

// Mock fetch for checkPwnedPassword
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Register API', () => {
  let mockBcryptHash: jest.Mock;
  let mockSha1: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetUserByUsername.mockReset();
    mockGetUserByEmail.mockReset();
    mockCreateUser.mockReset();
    mockBcryptHash = bcrypt.hash as jest.Mock;
    mockBcryptHash.mockReset();
    mockSha1 = sha1 as jest.Mock;
    mockSha1.mockReset();
    mockFetch.mockReset();

    // Default mock for checkPwnedPassword (not pwned)
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => 'somehash:0',
    });
    mockSha1.mockReturnValue('SOMEHASH');
  });

  it('should return 201 for successful registration', async () => {
    mockGetUserByUsername.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue(undefined);
    mockBcryptHash.mockResolvedValue('hashedpassword');
    mockCreateUser.mockResolvedValue({
      id: 1,
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      birthDate: '2000-01-01',
      email: 'new@example.com',
      tel: '1234567890',
    });

    const mockRequest = {
      json: async () => ({
        firstName: 'New',
        lastName: 'User',
        birthDate: '2000-01-01',
        email: 'new@example.com',
        tel: '1234567890',
        username: 'newuser',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User registered successfully');
    expect(data.user.username).toBe('newuser');
    expect(mockGetUserByUsername).toHaveBeenCalledWith('newuser');
    expect(mockGetUserByEmail).toHaveBeenCalledWith('new@example.com');
    expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({ username: 'newuser', password: 'hashedpassword' }));
  });

  it('should return 409 if username already exists', async () => {
    mockGetUserByUsername.mockResolvedValue({ id: 1, username: 'existinguser' });

    const mockRequest = {
      json: async () => ({
        firstName: 'New',
        lastName: 'User',
        birthDate: '2000-01-01',
        email: 'new@example.com',
        tel: '1234567890',
        username: 'existinguser',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe('Username already exists');
    expect(mockGetUserByUsername).toHaveBeenCalledWith('existinguser');
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should return 409 if email already exists', async () => {
    mockGetUserByUsername.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

    const mockRequest = {
      json: async () => ({
        firstName: 'New',
        lastName: 'User',
        birthDate: '2000-01-01',
        email: 'existing@example.com',
        tel: '1234567890',
        username: 'newuser',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe('Email already exists');
    expect(mockGetUserByEmail).toHaveBeenCalledWith('existing@example.com');
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should return 400 if password has been pwned', async () => {
    mockGetUserByUsername.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => 'SOMEHASH:1',
    });
    mockSha1.mockReturnValue('SOMEHASH');

    const mockRequest = {
      json: async () => ({
        firstName: 'New',
        lastName: 'User',
        birthDate: '2000-01-01',
        email: 'new@example.com',
        tel: '1234567890',
        username: 'newuser',
        password: 'pwnedpassword',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('The password you just used was found in a data breach. Please choose a different password.');
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should return 500 for internal server error', async () => {
    mockGetUserByUsername.mockRejectedValue(new Error('Database error'));

    const mockRequest = {
      json: async () => ({
        firstName: 'New',
        lastName: 'User',
        birthDate: '2000-01-01',
        email: 'new@example.com',
        tel: '1234567890',
        username: 'newuser',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Internal server error');
    expect(data.error).toBe('Database error');
  });
});