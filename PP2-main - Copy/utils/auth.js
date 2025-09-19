import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticate(request) {
  // Get the Authorization header from the request
  const authHeader = request.headers.get('Authorization');
  
  // Check if the Authorization header is present
  if (!authHeader) {
    throw new Error('No token provided');
  }

  // Extract the token from the header (Authorization: Bearer <token>)
  const token = authHeader.split(' ')[1]; // The token is the second part of the string

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Verify and decode the token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the user from the database using the decoded userId
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    // If no user is found, throw an error
    if (!user) {
      throw new Error('User not found');
    }

    // Return the authenticated user
    return user;
  } catch (err) {
    // If token is invalid or expired, throw an error
    throw new Error('Invalid or expired token');
  }
}
