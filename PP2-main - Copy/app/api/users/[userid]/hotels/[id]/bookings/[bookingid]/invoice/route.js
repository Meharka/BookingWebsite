import { prisma } from '@/utils/db';
import { getQueryParams } from "@/utils/getQueryParams";
import PDFDocument from "pdfkit"
import { authenticate } from "@/utils/auth";
import { NextResponse } from "next/server";
import path from "path";


export async function GET(request, {params}) {
    const { bookingId, userId } = getQueryParams(request.url, [
        "bookingId",
        "userId",
     ]);
     //return NextResponse.json({booking: `booking id : ${bookingId} and userid: ${userId}`})
    const user = await authenticate(request);
    
    if(!bookingId || !userId){
        return NextResponse.json(
            {error: "Booking not found!"},
            {status: 404},
        )
    };

    const booking = await prisma.hotelBooking.findUnique({
        where: {
            id: Number(bookingId),
            userId: Number(userId),
          
        },
      });
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      
      if (!user) {
        return NextResponse.json({ error: "User unthorized" }, { status: 400 });
      }
      
      //return NextResponse.json({useremail: `your email: ${user.email}`})
    // Some of the following code is inspired from https://pdfkit.org/docs/getting_started.html and some from chatgpt. 
    const doc = new PDFDocument({ font: null });
    const fontPath = path.resolve(process.cwd(), "node_modules/pdfkit/js/data/Arial.ttf");
    doc.registerFont("Arial", fontPath);
    doc.font("Arial");
    //return NextResponse.json({"mssage": "PDFDocument"});
    const pdfBuffer = [];
    //doc.on("data", (chunk) => pdfBuffer.push(chunk));
    
    // const fs = await import('fs');

    // doc.pipe(fs.createWriteStream(`invoice_${bookingId}.pdf`));

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

    doc.fontSize(16).text(`Booking Invoice`, { align: "center" });
    doc.moveDown();

    doc.text(`Booking ID: ${booking.id}`); 
    doc.text(`Booking info: ${booking}`); 
    doc.text(`Guest Name: ${user.first_name} ${user.last_name}`)
    doc 
    .text(`email: ${user.email}`)
    .text(`Phone Number: ${user.phone_number}`)
    .text(`Booking Status:  ${booking.status}`)


    //doc.text('Some text with an embedded font!', 100, 100);
    doc.end();
    const pdfData = Buffer.concat(pdfBuffer);
    return NextResponse.json(pdfData, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=invoice-${bookingId}.pdf`,
        },
    });
    
    return NextResponse.json({message: "pdf file was made"});

}