import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function POST(request) {
  const { first_name, last_name, email, password, profile_picture, phone_number, role } = await request.json();

  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    return NextResponse.json({ error: 'Missing JWT secrets in environment variables' }, { status: 500 });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        profile_picture,
        phone_number,
        role: role
      },
    });

    // Generate access token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '10d' });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: newUser.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ 
      message: 'User successfully created!', 
      role: newUser.role,
      token, refreshToken, userId: newUser.id
    }, { status: 201 });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return response;

  } catch (error) {
    return NextResponse.json({ error: 'Error during signup', details: error.message }, { status: 500 });
  }
}
