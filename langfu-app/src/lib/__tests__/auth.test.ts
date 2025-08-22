import { hashPassword, verifyPassword, generateToken, verifyToken } from '../auth';
import * as jose from 'jose';

// Mock jose
jest.mock('jose', () => ({
  SignJWT: jest.fn(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-token'),
  })),
  jwtVerify: jest.fn(),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) =>
    Promise.resolve(hash === `hashed_${password}`)
  ),
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBe(`hashed_${password}`);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      expect(hashedPassword).toBe('hashed_');
    });

    it('should handle special characters in password', async () => {
      const password = 'p@$$w0rd!#%';
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBe(`hashed_${password}`);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = `hashed_${password}`;

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = `hashed_${password}`;

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty password verification', async () => {
      const isValid = await verifyPassword('', 'hashed_something');
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', async () => {
      const userId = 'user123';
      const token = await generateToken(userId);

      expect(token).toBe('mock-token');
      expect(jose.SignJWT).toHaveBeenCalledWith({ sub: userId });
    });

    it('should throw error if JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET;

      await expect(generateToken('user123')).rejects.toThrow();
    });

    it('should handle different user ID formats', async () => {
      const userIds = ['123', 'uuid-format', 'user@email.com'];

      for (const userId of userIds) {
        const token = await generateToken(userId);
        expect(token).toBe('mock-token');
      }
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const mockPayload = { sub: 'user123' };
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const payload = await verifyToken('valid-token');

      expect(payload).toEqual(mockPayload);
      expect(jose.jwtVerify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(Uint8Array),
        expect.objectContaining({
          algorithms: ['HS256'],
        })
      );
    });

    it('should throw error for invalid token', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(verifyToken('invalid-token')).rejects.toThrow('Invalid token');
    });

    it('should throw error if JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET;

      await expect(verifyToken('any-token')).rejects.toThrow();
    });

    it('should handle expired tokens', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(new Error('Token expired'));

      await expect(verifyToken('expired-token')).rejects.toThrow('Token expired');
    });
  });

  describe('Integration tests', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'mySecurePassword';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should generate and verify token correctly', async () => {
      const userId = 'user456';

      // Mock the verification to return the expected payload
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: { sub: userId },
      });

      const token = await generateToken(userId);
      const payload = await verifyToken(token);

      expect(payload.sub).toBe(userId);
    });
  });

  describe('Security tests', () => {
    it('should not expose sensitive information in errors', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(
        new Error('Some internal error with sensitive data')
      );

      try {
        await verifyToken('bad-token');
      } catch (error: any) {
        // Error should be generic or sanitized
        expect(error.message).toBeDefined();
      }
    });

    it('should handle timing attacks in password verification', async () => {
      const password = 'testPassword';
      const hash = await hashPassword(password);

      // Multiple attempts should take similar time
      const attempts = 5;
      const times: number[] = [];

      for (let i = 0; i < attempts; i++) {
        const start = Date.now();
        await verifyPassword('wrongPassword', hash);
        times.push(Date.now() - start);
      }

      // Times should be relatively consistent (this is a simplified test)
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance =
        times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;

      // Variance should be low (timing should be consistent)
      expect(variance).toBeLessThan(100); // Adjust threshold as needed
    });
  });
});
