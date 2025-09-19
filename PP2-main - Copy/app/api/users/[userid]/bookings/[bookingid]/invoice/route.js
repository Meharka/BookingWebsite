import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import PDFDocument from 'pdfkit';
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";

import path from "path";


export async function GET(request, {params}) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "bookingId",
        "userId",
     ]);
    //return NextResponse.json({booking: `booking id : ${bookingId} and userid: ${userId}`})
    if(!bookingId || !userId){
        return NextResponse.json(
            {error: "Booking not found!"},
            {status: 404},
        )
    };
    const user = await authenticate(request);

    if(!user){
      return NextResponse.json({error: "User unauthorized"}, {status: 400})
    }

    const booking1 = await prisma.booking.findUnique({
        where: {
            id: Number(bookingId),
            // userId: Number(userId),
            },
            include: {
                flightBookings: true,
                hotelBookings: true
            }
          },
        );
      if (!booking1) {
        return NextResponse.json({ error: "Booking not found1" }, { status: 404 });
      }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    

    // const nextConfig = {
    //   serverExternalPackages: ["pdfkit"],
    // }

    // Some of the following code is inspired from https://pdfkit.org/docs/getting_started.html and some from chatgpt. 

    
    //console.log("PDFDocument is:", PDFDocument);
    const pdfData2 = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ font: null });
      const chunks = [];
  
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
  
      // Optional: Register a custom font
      const fontPath = path.resolve(process.cwd(), "node_modules/pdfkit/js/data/Arial.ttf");
      doc.registerFont("Arial", fontPath);
      doc.font("Arial");
  
      doc.fontSize(20).text(`Booking Invoice`, { align: "center" }).moveDown();
      doc.fontSize(12);
  
      doc.text(`Booking ID: ${booking1.id}`);
      doc.moveDown();
  
      if (booking1.flightBookings.length > 0) {
        const flight = booking1.flightBookings[0];
        doc.text(`Flight Booking Reference: ${flight.reference}`);
        doc.text(`Flight Status: ${flight.status}`);
      }
  
      if (booking1.hotelBookings.length > 0) {
        const hotel = booking1.hotelBookings[0];
        doc.moveDown();
        doc.text(`Hotel Booking ID: ${hotel.id}`);
        doc.text(`Status: ${hotel.status}`);
        doc.text(`Check-in: ${new Date(hotel.check_in).toDateString()}`);
        doc.text(`Check-out: ${new Date(hotel.check_out).toDateString()}`);
      }
  
      doc.moveDown();
      doc.text(`Passenger Name: ${user.first_name} ${user.last_name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Phone: ${user.phone_number}`);
      doc.text(`Passport: ${user.passportNumber}`);
  
      doc.end();
    });
  
    return new NextResponse(pdfData2, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
      },
    });






    const doc = new PDFDocument({ font: null });
    const fontPath = path.resolve(process.cwd(), "node_modules/pdfkit/js/data/Arial.ttf");
    doc.registerFont("Arial", fontPath);
    doc.font("Arial");
    //return NextResponse.json({"mssage": "PDFDocument"});
    const pdfBuffer = [];
    //doc.on("data", (chunk) => pdfBuffer.push(chunk));
    
    //const fs = await import('fs');

   // let buffers = [];

    doc.on("data", (chunk) => pdfBuffer.push(chunk));
    doc.on("end", () => {
        const pdfData = Buffer.concat(pdfBuffer);
        return NextResponse.json(pdfData, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
            },
        });
    });

   //doc.pipe(fs.createWriteStream(`invoice_${bookingId}.pdf`));

  //  doc.on("end", () => {
  //   const pdfData = Buffer.concat(pdfBuffer);
  //   return NextResponse.json(pdfData, {
  //       headers: {
  //           "Content-Type": "application/pdf",
  //           "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
  //       },
  //   });
  //   });

    
    doc.fontSize(16).text(`Booking Invoice`, { align: "center" });
    doc.moveDown();

    doc.text(`Booking ID: ${booking1.id}`); 
    doc.text(`flightBooking: ${booking1.flightBookings}`); 
    doc.text(`flightBooking: ${booking1.flightBookings}`); 
    doc.text(`HotelBooking:  ${booking1.hotelBookings}`); 

    
    doc.text(`Passenger Name: ${user.first_name} ${user.last_name}`)


    doc 
    .text(`PassportNumber: ${user.passportNumber}`)
    .text(`email: ${user.email}`)
    .text(`Phone Number: ${user.phone_number}`)
    // .text(`Booking Status:  ${booking1.status}`)

    doc.text(`Booking information: ${booking1}`);


    //doc.text('Some text with an embedded font!', 100, 100);
    doc.end();
    //const pdfData = Buffer.concat(pdfBuffer);

    //const pdfData = Buffer.concat(buffers);
    //return NextResponse.json({document: doc});
    // return NextResponse.json();
    
      const pdfData = Buffer.concat(pdfBuffer);
        return NextResponse.json(pdfData, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
            },
        });
     return NextResponse.json({message: "pdf file was made"});
  

}


