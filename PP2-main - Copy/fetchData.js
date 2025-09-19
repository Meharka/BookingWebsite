import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch'; // Import fetch
import dotenv from 'dotenv';
import cuid from 'cuid';


dotenv.config();

const prisma = new PrismaClient();

async function fetchCitiesAndAirports() {
  try {
    // Fetch cities
    const cityResponse = await fetch(
      'https://advanced-flights-system.replit.app/api/cities',
      {
        method: 'GET',
        headers: {
          "x-api-key": process.env.AFS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    const cities = await cityResponse.json();

    // Fetch airports
    const airportResponse = await fetch(
      'https://advanced-flights-system.replit.app/api/airports',
      {
        method: 'GET',
        headers: {
          "x-api-key": process.env.AFS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    const airports = await airportResponse.json();

    console.log('Inserting cities into database...');


      for (const city of cities) {
        const cityId = city.id || cuid();

        const existingCity = await prisma.city.findUnique({
        where: {
        id: cityId, // Ensure the city is unique by name
        },
        });

        
        if (!existingCity) {

        await prisma.city.upsert({
          where: { id: cityId}, // Ensure no duplicate entries
          update: {},
          create: {
            id: cityId,
            name: city.city,
            country: city.country, 
          },
        });
      }
    }

    console.log('Inserting airports into database...');
    for (const airport of airports) {

      const airportId = airport.id || cuid();

        await prisma.airport.upsert({
          where: { id: airportId },
          update: {},
          create: {
            id: airportId,
            name: airport.name,
            code: airport.code,
            country: airport.country,
            city: airport.city,
          },
        });
      } 

    console.log('Data insertion completed successfully.');
  } catch (error) {
    console.error('Error fetching data from AFS API:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fetchCitiesAndAirports();
