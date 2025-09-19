const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data for 50 hotels
const hotels = [

        { name: 'Hotel Luxe', logo: 'https://example.com/logo1.png', address: '123 Luxury St', city: 'Toronto', star_rating: 5, images: JSON.stringify(['https://example.com/img1.jpg', 'https://example.com/img2.jpg']) },
        { name: 'Oceanview Resort', logo: 'https://example.com/logo2.png', address: '456 Beach Rd', city: 'Vancouver', star_rating: 2, images: JSON.stringify(['https://example.com/img3.jpg', 'https://example.com/img4.jpg']) },
        { name: 'Mountain Escape', logo: 'https://example.com/logo3.png', address: '789 Summit Ave', city: 'Banff', star_rating: 5, images: JSON.stringify(['https://example.com/img5.jpg', 'https://example.com/img6.jpg']) },
        { name: 'Skyline Suites', logo: 'https://example.com/logo4.png', address: '101 Downtown Blvd', city: 'New York', star_rating: 4, images: JSON.stringify(['https://example.com/img7.jpg', 'https://example.com/img8.jpg']) },
        { name: 'Lakeside Inn', logo: 'https://example.com/logo5.png', address: '202 Shoreline Dr', city: 'Paris', star_rating: 3, images: JSON.stringify(['https://example.com/img9.jpg', 'https://example.com/img10.jpg']) },
        { name: 'The Grand Maple', logo: 'https://example.com/logo6.png', address: '303 Heritage Rd', city: 'London', star_rating: 5, images: JSON.stringify(['https://example.com/img11.jpg', 'https://example.com/img12.jpg']) },
        { name: 'Harbor View Hotel', logo: 'https://example.com/logo7.png', address: '404 Seaside Ln', city: 'Tokyo', star_rating: 1, images: JSON.stringify(['https://example.com/img13.jpg', 'https://example.com/img14.jpg']) },
        { name: 'Aurora Lodge', logo: 'https://example.com/logo8.png', address: '505 Northern Lights Rd', city: 'Oslo', star_rating: 3, images: JSON.stringify(['https://example.com/img15.jpg', 'https://example.com/img16.jpg']) },
        { name: 'Sunset Retreat', logo: 'https://example.com/logo9.png', address: '606 Sunset Blvd', city: 'Rome', star_rating: 4, images: JSON.stringify(['https://example.com/img17.jpg', 'https://example.com/img18.jpg']) },
        { name: 'Golden Peak Hotel', logo: 'https://example.com/logo10.png', address: '707 Golden Ave', city: 'Dubai', star_rating: 5, images: JSON.stringify(['https://example.com/img19.jpg', 'https://example.com/img20.jpg']) },
        { name: 'Desert Mirage', logo: 'https://example.com/logo11.png', address: '808 Oasis Rd', city: 'Marrakech', star_rating: 4, images: JSON.stringify(['https://example.com/img21.jpg', 'https://example.com/img22.jpg']) },
        { name: 'Royal Garden Inn', logo: 'https://example.com/logo12.png', address: '909 Royal St', city: 'Bangkok', star_rating: 5, images: JSON.stringify(['https://example.com/img23.jpg', 'https://example.com/img24.jpg']) },
        { name: 'Pacific Breeze Resort', logo: 'https://example.com/logo13.png', address: '1010 Ocean Rd', city: 'Sydney', star_rating: 1, images: JSON.stringify(['https://example.com/img25.jpg', 'https://example.com/img26.jpg']) },
        { name: 'The Emerald Palace', logo: 'https://example.com/logo14.png', address: '1111 Palace Ln', city: 'Vienna', star_rating: 5, images: JSON.stringify(['https://example.com/img27.jpg', 'https://example.com/img28.jpg']) },
        { name: 'Seaside Escape', logo: 'https://example.com/logo15.png', address: '1212 Shore Dr', city: 'Cape Town', star_rating: 4, images: JSON.stringify(['https://example.com/img29.jpg', 'https://example.com/img30.jpg']) },
        { name: 'Zen Retreat', logo: 'https://example.com/logo16.png', address: '1313 Tranquility St', city: 'Bali', star_rating: 5, images: JSON.stringify(['https://example.com/img31.jpg', 'https://example.com/img32.jpg']) },
        { name: 'Majestic Towers', logo: 'https://example.com/logo17.png', address: '1414 Skyline Rd', city: 'Hong Kong', star_rating: 5, images: JSON.stringify(['https://example.com/img33.jpg', 'https://example.com/img34.jpg']) },
        { name: 'The Sapphire Hotel', logo: 'https://example.com/logo18.png', address: '1515 Gemstone Blvd', city: 'Istanbul', star_rating: 4, images: JSON.stringify(['https://example.com/img35.jpg', 'https://example.com/img36.jpg']) },
        { name: 'Rio Grand Hotel', logo: 'https://example.com/logo19.png', address: '1616 Carnival Rd', city: 'Rio de Janeiro', star_rating: 4, images: JSON.stringify(['https://example.com/img37.jpg', 'https://example.com/img38.jpg']) },
        { name: 'Casa de Sol', logo: 'https://example.com/logo20.png', address: '1717 Sunshine Ave', city: 'Madrid', star_rating: 2, images: JSON.stringify(['https://example.com/img39.jpg', 'https://example.com/img40.jpg']) },
        { name: 'Tropical Haven', logo: 'https://example.com/logo21.png', address: '1818 Palm Rd', city: 'Honolulu', star_rating: 5, images: JSON.stringify(['https://example.com/img41.jpg', 'https://example.com/img42.jpg']) },
        { name: 'Eiffel View Hotel', logo: 'https://example.com/logo22.png', address: '1919 Eiffel St', city: 'Paris', star_rating: 1, images: JSON.stringify(['https://example.com/img43.jpg', 'https://example.com/img44.jpg']) },
        { name: 'Snowfall Lodge', logo: 'https://example.com/logo23.png', address: '2020 Alpine Rd', city: 'Zurich', star_rating: 4, images: JSON.stringify(['https://example.com/img45.jpg', 'https://example.com/img46.jpg']) },
        { name: 'Sakura Blossom Hotel', logo: 'https://example.com/logo24.png', address: '2121 Cherry Ln', city: 'Kyoto', star_rating: 5, images: JSON.stringify(['https://example.com/img47.jpg', 'https://example.com/img48.jpg']) },
        { name: 'The Opera House Inn', logo: 'https://example.com/logo25.png', address: '2222 Melody Rd', city: 'Milan', star_rating: 4, images: JSON.stringify(['https://example.com/img49.jpg', 'https://example.com/img50.jpg']) },
        { name: 'Sapphire Palace', logo: 'https://example.com/logo26.png', address: '26 Emerald Lane', city: 'Dubai', star_rating: 5, images: JSON.stringify(['https://example.com/img51.jpg', 'https://example.com/img52.jpg']) },
        { name: 'Ivy Boutique Hotel', logo: 'https://example.com/logo27.png', address: '27 Garden St', city: 'Paris', star_rating: 4, images: JSON.stringify(['https://example.com/img53.jpg', 'https://example.com/img54.jpg']) },
        { name: 'The Victorian Manor', logo: 'https://example.com/logo28.png', address: '28 Historic Ave', city: 'London', star_rating: 3, images: JSON.stringify(['https://example.com/img55.jpg', 'https://example.com/img56.jpg']) },
        { name: 'Harbor Lights Inn', logo: 'https://example.com/logo29.png', address: '29 Seaview Road', city: 'Sydney', star_rating: 1, images: JSON.stringify(['https://example.com/img57.jpg', 'https://example.com/img58.jpg']) },
        { name: 'Grand Kyoto Ryokan', logo: 'https://example.com/logo30.png', address: '30 Cherry Blossom St', city: 'Kyoto', star_rating: 5, images: JSON.stringify(['https://example.com/img59.jpg', 'https://example.com/img60.jpg']) },
        { name: 'Sunset Sands Resort', logo: 'https://example.com/logo31.png', address: '31 Beachfront Dr', city: 'Bali', star_rating: 2, images: JSON.stringify(['https://example.com/img61.jpg', 'https://example.com/img62.jpg']) },
        { name: 'Evergreen Lodge', logo: 'https://example.com/logo32.png', address: '32 Forest Path', city: 'Zurich', star_rating: 4, images: JSON.stringify(['https://example.com/img63.jpg', 'https://example.com/img64.jpg']) },
        { name: 'Royal Pearl Hotel', logo: 'https://example.com/logo33.png', address: '33 Queen’s Road', city: 'Hong Kong', star_rating: 5, images: JSON.stringify(['https://example.com/img65.jpg', 'https://example.com/img66.jpg']) },
        { name: 'Casa del Sol', logo: 'https://example.com/logo34.png', address: '34 Sunset Blvd', city: 'Barcelona', star_rating: 3, images: JSON.stringify(['https://example.com/img67.jpg', 'https://example.com/img68.jpg']) },
        { name: 'The Northern Retreat', logo: 'https://example.com/logo35.png', address: '35 Aurora St', city: 'Reykjavik', star_rating: 4, images: JSON.stringify(['https://example.com/img69.jpg', 'https://example.com/img70.jpg']) },
        { name: 'Golden Lotus Hotel', logo: 'https://example.com/logo36.png', address: '36 Lotus Rd', city: 'Hanoi', star_rating: 3, images: JSON.stringify(['https://example.com/img71.jpg', 'https://example.com/img72.jpg']) },
        { name: 'Ocean Breeze Resort', logo: 'https://example.com/logo37.png', address: '37 Coastal Way', city: 'Cape Town', star_rating: 4, images: JSON.stringify(['https://example.com/img73.jpg', 'https://example.com/img74.jpg']) },
        { name: 'The Andes Lodge', logo: 'https://example.com/logo38.png', address: '38 Mountain Pass', city: 'Santiago', star_rating: 2, images: JSON.stringify(['https://example.com/img75.jpg', 'https://example.com/img76.jpg']) },
        { name: 'Villa Celeste', logo: 'https://example.com/logo39.png', address: '39 Paradise Lane', city: 'Rome', star_rating: 3, images: JSON.stringify(['https://example.com/img77.jpg', 'https://example.com/img78.jpg']) },
        { name: 'Blue Horizon Hotel', logo: 'https://example.com/logo40.png', address: '40 Ocean Drive', city: 'Lisbon', star_rating: 4, images: JSON.stringify(['https://example.com/img79.jpg', 'https://example.com/img80.jpg']) },
        { name: 'Whispering Pines Inn', logo: 'https://example.com/logo41.png', address: '41 Alpine Road', city: 'Geneva', star_rating: 5, images: JSON.stringify(['https://example.com/img81.jpg', 'https://example.com/img82.jpg']) },
        { name: 'Golden Oasis', logo: 'https://example.com/logo42.png', address: '42 Desert View', city: 'Marrakech', star_rating: 3, images: JSON.stringify(['https://example.com/img83.jpg', 'https://example.com/img84.jpg']) },
        { name: 'Metropolitan Towers', logo: 'https://example.com/logo43.png', address: '43 Skyline Ave', city: 'New York', star_rating: 1, images: JSON.stringify(['https://example.com/img85.jpg', 'https://example.com/img86.jpg']) },
        { name: 'Alpine Lodge', logo: 'https://example.com/logo44.png', address: '44 Glacier Rd', city: 'Innsbruck', star_rating: 5, images: JSON.stringify(['https://example.com/img87.jpg', 'https://example.com/img88.jpg']) },
        { name: 'Casa Maravilla', logo: 'https://example.com/logo45.png', address: '45 Vine St', city: 'Buenos Aires', star_rating: 3, images: JSON.stringify(['https://example.com/img89.jpg', 'https://example.com/img90.jpg']) },
        { name: 'Imperial Plaza', logo: 'https://example.com/logo46.png', address: '46 Royal Blvd', city: 'Vienna', star_rating: 4, images: JSON.stringify(['https://example.com/img91.jpg', 'https://example.com/img92.jpg']) },
        { name: 'Zen Garden Resort', logo: 'https://example.com/logo47.png', address: '47 Tranquility Rd', city: 'Seoul', star_rating: 5, images: JSON.stringify(['https://example.com/img93.jpg', 'https://example.com/img94.jpg']) },
        { name: 'The Baltic Retreat', logo: 'https://example.com/logo48.png', address: '48 Seaside Blvd', city: 'Stockholm', star_rating: 3, images: JSON.stringify(['https://example.com/img95.jpg', 'https://example.com/img96.jpg']) },
        { name: 'Lush Tropics Resort', logo: 'https://example.com/logo49.png', address: '49 Rainforest Rd', city: 'Kuala Lumpur', star_rating: 4, images: JSON.stringify(['https://example.com/img97.jpg', 'https://example.com/img98.jpg']) },
        { name: 'Celestial Heights', logo: 'https://example.com/logo50.png', address: '50 Starview Lane', city: 'Singapore', star_rating: 5, images: JSON.stringify(['https://example.com/img99.jpg', 'https://example.com/img100.jpg']) }
      

];

async function main() {
  for (const hotel of hotels) {
    const newHotel = await prisma.hotel.create({
      data: {
        name: hotel.name,
        logo: hotel.logo,
        address: hotel.address,
        city: hotel.city,
        star_rating: hotel.star_rating,
        images: hotel.images ? JSON.parse(hotel.images) : [],
      },
    });
    console.log(`Inserted hotel: ${newHotel.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
