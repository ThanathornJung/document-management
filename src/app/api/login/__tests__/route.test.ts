import { POST } from '../route';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';

// Mock AzureSqlDatabaseContext methods
const mockGetUserByUsername = jest.fn();

// Mock AzureSqlDatabaseContext constructor
jest.mock('@/lib/azure-sql/database', () => ({
  AzureSqlDatabaseContext: jest.fn().mockImplementation(() => ({
    getUserByUsername: mockGetUserByUsername,
  })),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Login API', () => {
  let mockBcryptCompare: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetUserByUsername.mockReset();
    mockBcryptCompare = bcrypt.compare as jest.Mock;
    mockBcryptCompare.mockReset();
  });

  it('should return 200 for successful login', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      tel: '1234567890',
    };

    mockGetUserByUsername.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(true);

    const mockRequest = {
      json: async () => ({ username: 'testuser', password: 'password123', rememberMe: false }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Login successful');
    expect(data.user.username).toBe('testuser');
    expect(mockGetUserByUsername).toHaveBeenCalledWith('testuser');
    expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashedpassword');
  });

  it('should return 401 for invalid username', async () => {
    mockGetUserByUsername.mockResolvedValue(undefined);

    const mockRequest = {
      json: async () => ({ username: 'nonexistent', password: 'password123', rememberMe: false }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Invalid username or password');
    expect(mockGetUserByUsername).toHaveBeenCalledWith('nonexistent');
    expect(mockBcryptCompare).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid password', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
    };

    mockGetUserByUsername.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(false);

    const mockRequest = {
      json: async () => ({ username: 'testuser', password: 'wrongpassword', rememberMe: false }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Invalid username or password');
    expect(mockGetUserByUsername).toHaveBeenCalledWith('testuser');
    expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
  });

  it('should return 500 for internal server error', async () => {
    mockGetUserByUsername.mockRejectedValue(new Error('Database error'));

    const mockRequest = {
      json: async () => ({ username: 'testuser', password: 'password123', rememberMe: false }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Internal server error');
    expect(data.error).toBe('Database error');
  });
});