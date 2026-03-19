import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET environment variable is required and must be at least 32 characters. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }
  return secret;
}

interface TokenPayload {
  userId: number;
  iat: number;
  exp: number;
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '2h' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
