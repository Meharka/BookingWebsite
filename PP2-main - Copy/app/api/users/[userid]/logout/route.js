import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';


export async function POST(request) {
  
  try{

    const url = new URL(request.url);
    const userId = url.searchParams.get('userid');
    const parseduserid = parseInt(userId);

    if (!userId) {
      return NextResponse.json({ error: 'Must have userid.' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseduserid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updatedUser = user;
    if (user.role === "USER"){

        const updatedUser = await prisma.user.update({
          where: { id: parseduserid},
          data: { role: 'VISITOR' },
        });
    
      }
    
    else if (user.role === "HOTEL_OWNER"){

      const updatedUser = await prisma.user.update({
        where: { id: parseduserid},
        data: { role: 'HOTEL_OWNER_LOGGED_OUT' },
      });
  
    }
  
    return NextResponse.json({ message: 'Logged out', updatedUser});;
  }
catch (error) {
  return NextResponse.json({ error: 'Error during logout', details: error.message }, { status: 500 });
}}