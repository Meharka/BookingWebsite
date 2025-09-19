import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function POST(request) {
  const { email, password } = await request.json();

  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    return NextResponse.json({ error: 'Missing JWT secrets in environment variables' }, { status: 500 });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Could not find user.' }, { status: 404 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 400 });
    }

    if (user.role === 'VISITOR') {
      await prisma.user.update({
        where: { email },
        data: { role: 'USER' },
      });
    }

    if (user.role === 'HOTEL_OWNER_LOGGED_OUT') {
      await prisma.user.update({
        where: { email },
        data: { role: 'HOTEL_OWNER' },
      });
    }


    // Generate access token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '10d' });

    // Generate a refresh token
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ message: 'Login successful!', token, role: user.role, user: user}, { status: 200 });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return response;

  } catch (error) {
    return NextResponse.json({ error: 'Error during login', details: error.message }, { status: 500 });
  }
}
