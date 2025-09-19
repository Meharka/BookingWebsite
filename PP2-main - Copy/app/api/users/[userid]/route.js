import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
import { NextResponse } from 'next/server';
const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]; // Get token from authorization header

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    // Validate token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { first_name, last_name, profile_picture, phone_number } = await request.json();

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        first_name,
        last_name,
        profile_picture,
        phone_number,
      },
    });

    return NextResponse.json({ message: 'Profile successfully updated!', user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating profile', details: error.message }, { status: 500 });
  }
}




export async function GET(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1]; // Get token from authorization header

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    // Validate token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    

    //const { first_name, last_name, profile_picture, phone_number } = await request.json();

    // Update user profile
    const find = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(!find){
      return NextResponse.json({message: "User not found", user: null}, {status: 404})
    }

    return NextResponse.json({ message: 'Profile found!', user: find }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error finding user', details: error.message }, { status: 500 });
  }
}