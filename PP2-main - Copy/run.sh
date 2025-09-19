#!/bin/bash

# This script starts the backend server for the hotel management project

# Print a message indicating the start of the process
echo "Starting the backend server..."

# Install the dependencies if they are not installed
npm install
npm install jsonwebtoken
npm i pdfkit

# Generate the Prisma client (make sure the client is generated after migrations)
npx prisma generate
# Run Prisma migrations to ensure the database schema is up-to-date
npx prisma migrate dev




# Start the Next.js server
npm run dev

# Print a message when the server is started
echo "Backend server is running on http://localhost:3000"