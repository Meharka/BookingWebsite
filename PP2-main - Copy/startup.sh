!/bin/bash
USED CHATGPT TO HELP WITH THIS
Step 1: Install all required npm packages
echo "Installing required npm packages..."
npm install
npm install jsonwebtoken
npm i pdfkit
npm i bcryptjs
npm install lucide-react

# Step 2: Run database migrations
echo "Running database migrations..."
npx prisma generate
npx prisma migrate dev

# Step 3: Fetch cities and airports using Node.js and fetch API
echo "Fetching cities and airports from the AFS API..."

npm install cuid


FONT_DIR="$(pwd)/node_modules/pdfkit/js/data"
FONT_URL="https://github.com/matomo-org/travis-scripts/raw/master/fonts/Arial.ttf"


if [ ! -f "$FONT_DIR/Arial.ttf" ]; then
    echo "Downloading Arial.ttf..."
    curl -L "$FONT_URL" -o "$FONT_DIR/Arial.ttf"
else
    echo "Arial.ttf already exists, skipping download."
fi


if [ -f "$FONT_DIR/Arial.ttf" ]; then
    echo "Arial.ttf successfully downloaded to $FONT_DIR"
else
    echo "Error: Failed to download Arial.ttf"
    exit 1
fi

# # Create a Node.js script to fetch data from AFS API
cat > fetchData.js << 'EOL'
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
EOL

# Step 4: Run the fetch data script
echo "Running fetchData.js to fetch cities and airports..."
node fetchData.js

# Step 5: Final confirmation
echo "Startup completed successfully!"
