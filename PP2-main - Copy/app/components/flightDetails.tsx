"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDarkMode } from "../DarkModeContext";

interface FlightDetailsProps {
  flightIds: string[] | null;
  outboundFlightIds: string[] | null;
  returnFlightIds: string[] | null;
}

interface Airport {
  name: string;
  code: string;
  city: string;
  country: string;
}

interface Airline {
  name: string;
  code: string;
}

interface Flight {
  flightNumber: string;
  airline: Airline;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  status: string;
  seats: number;
  price: number;
  currency: string;
}

const FlightDetails = ({
  flightIds,
  outboundFlightIds,
  returnFlightIds,
}: FlightDetailsProps) => {
  const [flightsData, setFlightsData] = useState<Flight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchFlightDetails = async (flightIds: string[] | null) => {
      if (!flightIds || flightIds.length === 0) return [];

      try {
        const flightDetailsPromises = flightIds.map((flightId) =>
          fetch(`http://localhost:3000/api/users/{userid}/flights/${flightId}`)
            .then((response) => response.json())
            .then((data) => data)
        );

        return await Promise.all(flightDetailsPromises);
      } catch (error) {
        setError("Failed to fetch flight details.");
        return [];
      }
    };

    const fetchAllFlightDetails = async () => {
      try {
        setLoading(true);
        let allFlightDetails: Flight[] = [];

        // Fetch details for all available flight sets
        if (flightIds && flightIds.length > 0) {
          const flightDetails = await fetchFlightDetails(flightIds);
          allFlightDetails = [...allFlightDetails, ...flightDetails];
        }

        if (outboundFlightIds && outboundFlightIds.length > 0) {
          const outboundDetails = await fetchFlightDetails(outboundFlightIds);
          allFlightDetails = [...allFlightDetails, ...outboundDetails];
        }

        if (returnFlightIds && returnFlightIds.length > 0) {
          const returnDetails = await fetchFlightDetails(returnFlightIds);
          allFlightDetails = [...allFlightDetails, ...returnDetails];
        }

        setFlightsData(allFlightDetails);
      } catch (error) {
        setError("Failed to fetch all flight details.");
      } finally {
        setLoading(false);
      }
    };

    // Call the function to fetch all details when the component mounts or any of the flightIds arrays change
    fetchAllFlightDetails();
  }, [flightIds, outboundFlightIds, returnFlightIds]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleBookFlight = () => {
    // Store the flight data in localStorage
    if(returnFlightIds){
    localStorage.setItem("departureIDS",  JSON.stringify(outboundFlightIds));
    localStorage.setItem("returnIDS",  JSON.stringify(returnFlightIds));
    localStorage.setItem("flightData",  JSON.stringify(flightsData));
    console.log("outbound flightids inside flight details:  ", outboundFlightIds)
    console.log("return flight ids in flight details:  ",returnFlightIds)
    console.log("local storage outbound1: ",localStorage.getItem("departureIDS"))
    console.log("local storage return: ",localStorage.getItem("returnIDS"))

    }else {
      localStorage.setItem("departureIDS",  JSON.stringify(flightIds));
      localStorage.setItem("returnIDS",  JSON.stringify([]));
      localStorage.setItem("flightData",  JSON.stringify(flightsData)); //modified
      console.log("dept flight ids in flight details:  ",flightIds)
    console.log("local storage outbound: ",localStorage.getItem("departureIDS"))

    }
    // localStorage.removeItem("flightData")
    //const store = (flightIds.map((flightId) => console.log("flightData: ", flightId)))
    
    
    
    
    
  
    // Navigate to the booking page
    router.push("/manage-bookings/create/flightBooking");
  };

  // Calculate total price for both outbound and return flights
  const totalPrice = flightsData?.reduce((acc, flight) => acc + flight.price, 0) || 0;

  return (
    <div className={` ${isDarkMode ? "bg-sky-700 text-sky-200" : "bg-white text-sky-700"} max-w-full mx-auto shadow-lg rounded-2xl p-6 overflow-y-auto`}>
      <h2 className="text-2xl font-semibold text-center mb-4">
        Flight Details
      </h2>

      <div className="space-y-6">
        {flightsData?.map((flightData, index) => (
          <div
            key={index}
            className="flex flex-col space-y-4 p-1 border-b border-sky-300">
            {/* Flight Information, Departure, Arrival, Pricing, Book Flight (on the same line) */}
            <div className="flex flex-wrap md:flex-nowrap justify-between space-x-2">
              {/* Flight Information */}
              <div className="flex-1">
                <h3 className="text-md font-semibold ">Flight Information:</h3>
                <p>
                  <span className="font-semibold">{flightData.flightNumber}</span>
                </p>
                <p>
                  <span className="font-semibold">{flightData.airline.name} ({flightData.airline.code})</span>
                </p>
                <p>
                  <span className="font-semibold">
                    {Math.floor(flightData.duration / 60)}h {flightData.duration % 60}m
                  </span>
                </p>
                <p>
                  Seats Available: <span className="font-semibold">{flightData.seats}</span>
                </p>
                <p
                    className={`font-semibold ${
                        flightData.status === "SCHEDULED"
                        ? "text-green-600 dark:text-green-400"
                        : flightData.status === "CANCELLED"
                        ? "text-red-600 dark:text-red-400"
                        : "text-sky-700 dark:text-sky-200"
                    }`}
                >
                    {flightData.status}
                </p>
              </div>

              {/* Departure Information */}
              <div className="flex-1">
                <h3 className="text-md font-semibold">Departure:</h3>
                <p>
                  <span className="font-semibold">{flightData.origin.name}</span> ({flightData.origin.code})
                </p>
                <p>
                  {flightData.origin.city}, {flightData.origin.country}
                </p>
                <p>
                  {new Date(flightData.departureTime).toLocaleString()}
                </p>
              </div>

            

              {/* Arrival Information */}
              <div className="flex-1">
                <h3 className="text-md font-semibold text-sky-700 dark:text-sky-200">Arrival:</h3>
                <p className="text-sky-700 dark:text-sky-200">
                  <span className="font-semibold">{flightData.destination.name}</span> ({flightData.destination.code})
                </p>
                <p className="text-sky-700 dark:text-sky-200">
                  {flightData.destination.city}, {flightData.destination.country}
                </p>
                <p className="text-sky-700 dark:text-sky-200">
                  {new Date(flightData.arrivalTime).toLocaleString()}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex-1">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {flightData.currency} {flightData.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPrice > 0 && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-sky-700 dark:text-sky-200">
            Total Price: {flightsData?.[0]?.currency} {totalPrice.toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <button 
        onClick={() => handleBookFlight()}
        className="p-4 mt-4 border border-sky-600 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2">
          Book Flight(s)
        </button>
      </div>
    </div>
  );
};

export default FlightDetails;
