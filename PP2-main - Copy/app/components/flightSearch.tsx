"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDarkMode } from "../DarkModeContext";
import FlightDetails from "./flightDetails";

interface FlightSearchProps {
  FlightParams?: string;
}

const FlightSearch: React.FC<FlightSearchProps> = ({ FlightParams }) => {
  const searchParams = useSearchParams();
  const { isDarkMode } = useDarkMode();

  const params = new URLSearchParams(FlightParams);
  const origin = params.get("origin");
  const destination = params.get("destination");
  const date = params.get("date") || "";
  const returnDate = params.get("returnDate") || "";
  const type = params.get("type") || "";

  console.log(origin);
  console.log(destination);

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlightIds, setSelectedFlightIds] = useState<string[] | null>(null);
  const [selectedOutboundFlightIds, setSelectedOutboundFlightIds] = useState<string[] | null>(null);
  const [selectedReturnFlightIds, setSelectedReturnFlightIds] = useState<string[] | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  

  useEffect(() => {
    if (!origin || !destination || !date || !type) return;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        let url = `${apiUrl}/api/users/{userid}/flights?origin=${origin}&destination=${destination}&date=${date}&returnDate=${returnDate}&type=${type}`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Error fetching flight data.");
          setFlights([]);
          return;
        }

        const data = await response.json();

        if (type === "ONE-WAY") {
          setFlights(data.results || []);
        }

        if (type === "ROUND-TRIP") {
          setFlights(data || []);
        }
      } catch (error) {
        setError("Failed to fetch flights.");
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [origin, destination, date, type]);

  const handleViewDetailsRoundTrip = (outboundFlight: any, returnFlight: any) => {
    const outboundflightIds = outboundFlight.flights.map((flight: any) => flight.id);
    const returnflightIds = returnFlight.flights.map((flight: any) => flight.id);
    
    setSelectedOutboundFlightIds(outboundflightIds);
    setSelectedReturnFlightIds(returnflightIds);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("outboundflightIds", outboundflightIds.join(","));
    newUrl.searchParams.set("returnflightIds", returnflightIds.join(","));
    
    window.history.pushState(null, "", newUrl.toString());
    setIsOverlayVisible(true);
};


  const handleViewDetails = (flightLeg: any) => {
    const flightIds = flightLeg.flights.map((flight: any) => flight.id);
    
    setSelectedFlightIds(flightIds);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("flightIds", flightIds.join(","));
    window.history.pushState(null, "", newUrl.toString());
    setIsOverlayVisible(true);
  };

  const handleCloseOverlay = () => {
    setSelectedFlightIds([]);
    setSelectedOutboundFlightIds([]);
    setSelectedReturnFlightIds([]);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("flightIds");
    newUrl.searchParams.delete("outboundflightIds");
    newUrl.searchParams.delete("returnflightIds");
    window.history.pushState(null, "", newUrl.toString());
    setIsOverlayVisible(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flights-container relative">
      <div className={`max-w-6xl mx-auto p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-sky-900 text-sky-200" : "bg-white text-sky-700"}`}>
        <h3 className="text-xl font-semibold mb-4">Flight Results</h3>

        {type === 'ONE-WAY' && (
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-sky-100 text-sky-800">
                <th className="p-3">Stops</th>
                <th className="p-3">Airline</th>
                <th className="p-3">Departure</th>
                <th className="p-3">Arrival</th>
                <th className="p-3">Origin</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Price</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4 text-gray-500">
                    No flights available.
                  </td>
                </tr>
              ) : (
                flights.map((flightLeg, index) => {
                  const totalPrice = flightLeg.flights.reduce((acc, flight) => acc + flight.price, 0);
                  const allAirlines = flightLeg.flights.map((flight) => flight.airline?.name).join("/");

                  const firstFlight = flightLeg.flights[0];
                  const lastFlight = flightLeg.flights[flightLeg.flights.length - 1];

                  return (
                    <tr key={flightLeg.id || index} className={` ${isDarkMode ? "odd:bg-sky-700 even:bg-sky-900 text-sky-200" : "odd:bg-white even:bg-sky-100 text-sky-700"}  text-center`}>
                      <td className="p-3 font-semibold">{flightLeg.flights.length - 1}</td>
                      <td className="p-3">{allAirlines}</td>
                      <td className="p-3">{new Date(firstFlight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3">{new Date(lastFlight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3">{firstFlight.origin?.city} ({firstFlight.origin?.code})</td>
                      <td className="p-3">{lastFlight.destination?.city} ({lastFlight.destination?.code})</td>
                      <td className="p-3">{totalPrice} {firstFlight.currency}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleViewDetails(flightLeg)}
                          className="p-2 border border-yellow-300 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {type === 'ROUND-TRIP' && (

          /*
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-sky-100 text-sky-800">
                <th className="p-3">Flight Type</th>
                <th className="p-3">Stops</th>
                <th className="p-3">Airline</th>
                <th className="p-3">Departure</th>
                <th className="p-3">Arrival</th>
                <th className="p-3">Origin</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Price</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-500">
                    No flights available.
                  </td>
                </tr>
              ) : (flights &&
                flights.map((option, index) => {
                    
                  // Outbound Flight details
                  const totalPriceOutbound = option.outboundFlight.flights.reduce((acc, flight) => acc + flight.price, 0);
                  const allAirlinesOutbound = option.outboundFlight.flights.map((flight) => flight.airline?.name).join("/");

                  const firstFlightOutbound = option.outboundFlight.flights[0];
                  const lastFlightOutbound = option.outboundFlight.flights[option.outboundFlight.flights.length - 1];

                  // Return Flight details
                  const totalPriceReturn = option.returnFlight.flights.reduce((acc, flight) => acc + flight.price, 0);
                  const allAirlinesReturn = option.returnFlight.flights.map((flight) => flight.airline?.name).join("/");

                  const firstFlightReturn = option.returnFlight.flights[0];
                  const lastFlightReturn = option.returnFlight.flights[option.returnFlight.flights.length - 1];

                  return (
                    <>

                      <tr key={`outbound-${option.outboundFlight.id}-${index}`} className="odd:bg-white even:bg-sky-100 text-center">
                        <td className="p-3 font-semibold">Outbound</td>
                        <td className="p-3">{option.outboundFlight.flights.length - 1}</td>
                        <td className="p-3">{allAirlinesOutbound}</td>
                        <td className="p-3">{new Date(firstFlightOutbound.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3">{new Date(lastFlightOutbound.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3">{firstFlightOutbound.origin?.city} ({firstFlightOutbound.origin?.code})</td>
                        <td className="p-3">{lastFlightOutbound.destination?.city} ({lastFlightOutbound.destination?.code})</td>
                        <td className="p-3">{totalPriceOutbound} {firstFlightOutbound.currency}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleViewDetails(option.outboundFlight)}
                            className="border border-yellow-300 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>


                      <tr key={`return-${option.returnFlight.id}-${index}`} className="odd:bg-white even:bg-sky-100 text-center">
                        <td className="p-3 font-semibold">Return</td>
                        <td className="p-3">{option.returnFlight.flights.length - 1}</td>
                        <td className="p-3">{allAirlinesReturn}</td>
                        <td className="p-3">{new Date(firstFlightReturn.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3">{new Date(lastFlightReturn.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3">{firstFlightReturn.origin?.city} ({firstFlightReturn.origin?.code})</td>
                        <td className="p-3">{lastFlightReturn.destination?.city} ({lastFlightReturn.destination?.code})</td>
                        <td className="p-3">{totalPriceReturn} {firstFlightReturn.currency}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleViewDetails(option.returnFlight)}
                            className="border border-yellow-300 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    </>
                  );
                
                })
              )}
            </tbody>
          </table>
          */

          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
  <thead>
    <tr className="bg-sky-100 text-sky-800">
      <th className="p-3">Airlines</th>
      <th className="p-3">Outbound Stops</th>
      <th className="p-3">Return Stops</th>

      <th className="p-3">Outbound Arrival</th>
      <th className="p-3">Outbound Departure</th>
      <th className="p-3">Outbound Duration</th>
      <th className="p-3">Return Duration</th>
      
      <th className="p-3">Total Price</th>
      <th className="p-3">Details</th>
    </tr>
  </thead>
  <tbody>
    {flights.length === 0 ? (
      <tr>
        <td colSpan={12} className="text-center p-4 text-gray-500">
          No flights available.
        </td>
      </tr>
    ) : (
      flights.map((option, index) => {
        // Outbound flight details
        const totalPriceOutbound = option.outboundFlight.flights.reduce((acc, flight) => acc + flight.price, 0);
        const firstFlightOutbound = option.outboundFlight.flights[0];
        const lastFlightOutbound = option.outboundFlight.flights[option.outboundFlight.flights.length - 1];

        // Return flight details
        const totalPriceReturn = option.returnFlight.flights.reduce((acc, flight) => acc + flight.price, 0);
        const firstFlightReturn = option.returnFlight.flights[0];
        const lastFlightReturn = option.returnFlight.flights[option.returnFlight.flights.length - 1];

        // Total price
        const totalPrice = totalPriceOutbound + totalPriceReturn;

        // Airlines involved in both directions
        const allAirlines = [
          ...new Set([
            ...option.outboundFlight.flights.map((flight) => flight.airline?.name),
            ...option.returnFlight.flights.map((flight) => flight.airline?.name),
          ]),
        ].join(" / ");

        // Total stops (both flights)
        const outboundStops =option.outboundFlight.flights.length - 1;
        const returnStops = option.returnFlight.flights.length - 1;

        return (
          <tr key={index} className={` ${isDarkMode ? "odd:bg-sky-700 even:bg-sky-900 text-sky-200" : "odd:bg-white even:bg-sky-100 text-sky-700"}  text-center`}>

            <td className="p-3">{allAirlines}</td>
            <td className="p-3">{outboundStops}</td>
            <td className="p-3">{returnStops}</td>
            {/* Outbound Details */}

            <td className="p-3">{firstFlightOutbound.origin?.city} ({firstFlightOutbound.origin?.code})</td>
            <td className="p-3">{lastFlightOutbound.destination?.city} ({lastFlightOutbound.destination?.code})</td>
            <td className="p-3">{new Date(firstFlightOutbound.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br /> ➡️ <br />{new Date(lastFlightOutbound.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>

            {/* Return Details */}
            <td className="p-3">{new Date(firstFlightReturn.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br /> ➡️ <br />{new Date(lastFlightReturn.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>


            {/* Additional Details */}
            
            <td className="p-3 font-semibold">{totalPrice} {firstFlightOutbound.currency}</td>
            <td className="p-3">
              <button
                onClick={() => handleViewDetailsRoundTrip(option.outboundFlight, option.returnFlight)}
                className="border border-yellow-300 bg-yellow-200 text-sky-700 rounded-md focus:outline-none focus:ring-2 p-2"
              >
                View Details
              </button>
            </td>
          </tr>
        );
      })
    )}
  </tbody>
</table>

        )}
      </div>

    {isOverlayVisible && (selectedFlightIds || (selectedOutboundFlightIds && selectedReturnFlightIds)) && (
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
            <div className= {` ${isDarkMode ? "bg-sky-900 text-sky-200" : "bg-stone-100 text-sky-700"} p-6 rounded-lg shadow-lg max-w-4xl w-full relative`}>
              <button 
                onClick={handleCloseOverlay} 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                X
              </button>
              <FlightDetails 
  flightIds={selectedFlightIds} 
  outboundFlightIds={selectedOutboundFlightIds} 
  returnFlightIds={selectedReturnFlightIds} 
/>

            </div>
          </div>
        )}
  </div>
  );
};

export default FlightSearch;
