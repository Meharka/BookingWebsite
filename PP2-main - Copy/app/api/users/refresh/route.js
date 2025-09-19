import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function GET(request) {
  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    return NextResponse.json({ error: 'Missing JWT secrets in environment variables' }, { status: 500 });
  }

  try {
    // Extract refresh token from cookies
    const refreshTokenCookie = request.cookies.get('refreshToken');
    if (!refreshTokenCookie) {
      return NextResponse.json({ error: 'Refresh token missing' }, { status: 400 });
    }

    const refreshToken = refreshTokenCookie.value; // Extract actual token value

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Generate a new access token
    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });

    // Send back the new access token
    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Error refreshing token', details: error.message }, { status: 401 });
  }
}
