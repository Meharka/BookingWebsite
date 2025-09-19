"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "./DarkModeContext";
import HotelSearch from "./components/hotelSearch";
import FlightSearch from "./components/flightSearch";
import StarRating from "./components/starRating";
import AirportAutocomplete from "./components/airportAutocomplete";
import CityAutocomplete from "./components/cityAutocomplete";

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchType, setSearchType] = useState("flights");

  // Flight states
  const [originFlight, setOriginFlight] = useState("");
  const [destinationFlight, setDestinationFlight] = useState("");
  const [dateFlight, setDateFlight] = useState("");
  const [returnDateFlight, setReturnDateFlight] = useState("");
  const [typeFlight, setTypeFlight] = useState("ONE-WAY");
  const [FlightParams, setFlightParams] = useState<string>();

  // Hotel states
  const [checkInHotel, setCheckInHotel] = useState("");
  const [checkOutHotel, setCheckOutHotel] = useState("");
  const [cityHotel, setCityHotel] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [HotelParams, setHotelParams] = useState<string>();
  const [starRating, setStarRating] = useState(0);

  const router = useRouter();

  const toggleType = () => {
    setTypeFlight((prev) => (prev === "ONE-WAY" ? "ROUND-TRIP" : "ONE-WAY"));
  };

  const handleSearch = () => {
    if (searchType === "flights") {
      // Clear hotel params when switching to flights
      setHotelParams("");

      const flightParams = new URLSearchParams({
        origin: originFlight,
        destination: destinationFlight,
        date: dateFlight,
        returnDate: typeFlight === "ROUND-TRIP" ? returnDateFlight : "",
        type: typeFlight,
      }).toString();

      setFlightParams(flightParams);
      console.log(flightParams);
      
    } else {
      setFlightParams("");
      const hotelParams = new URLSearchParams({
        checkIn: checkInHotel,
        checkOut: checkOutHotel,
        city: cityHotel,
        hotelName,
        minPrice,
        maxPrice,
        starRating: String(starRating),
      }).toString();
      
      setHotelParams(hotelParams);
    }
  };

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 ${isDarkMode ? "bg-sky-950 text-sky-100" : "bg-sky-100 text-sky-950"}`}>

      <h1 className={`text-5xl font-bold text-center mt-14 mb-6 p-2 ${isDarkMode ? "text-sky-200" : "text-sky-700"}`}>
        FlyNext
      </h1>
      
      <div className="max-w-9xl mx-auto">

        {/* Search Type Buttons */}
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => {
              setSearchType("flights");
              setHotelParams("");
              setFlightParams("");
              window.history.pushState(null, "", "flights");
            }}
            className={`${searchType === "flights" ? "bg-sky-600 text-white" : "bg-white text-sky-600 border border-sky-600"} py-2 px-4 rounded-md hover:bg-sky-500 hover:text-white transition-all`}
          >
            Flights
          </button>
          <button
            onClick={() => {
              setSearchType("hotels");
              setHotelParams("");
              setFlightParams("");
              window.history.pushState(null, "", "hotels");
            }}
            className={`${searchType === "hotels" ? "bg-sky-600 text-white" : "bg-white text-sky-600 border border-sky-600"} py-2 px-4 rounded-md hover:bg-sky-500 hover:text-white transition-all`}
          >
            Hotels
          </button>
        </div>

        <div className={`max-w-5xl mx-auto p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-sky-900 text-sky-200" : "bg-white text-sky-700"}`}>
          {searchType === "flights" && (
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="mt-8">
                <span className="block font-semibold mb-2">Search Flights:</span>
                <div className="grid grid-cols-5 gap-4">
                <AirportAutocomplete
                    value={originFlight}
                    onChange={(airportCode) => setOriginFlight(airportCode)}
                    placeholder="Origin"
                  />

                  <AirportAutocomplete
                    value={destinationFlight}
                    onChange={(airportCode) => setDestinationFlight(airportCode)}
                    placeholder="Destination"
                  />
                  <input
                    type="date"
                    className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                    value={dateFlight}
                    onChange={(e) => setDateFlight(e.target.value)}
                  />

                  {typeFlight === "ROUND-TRIP" && (
                    <input
                      type="date"
                      className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                      value={returnDateFlight}
                      onChange={(e) => setReturnDateFlight(e.target.value)}
                    />
                  )}

                  <button
                    className={`w-full p-3 border border-sky-600 text-sky-700 rounded-md focus:outline-none focus:ring-2 ${typeFlight === "ONE-WAY" ? "bg-sky-100" : "bg-yellow-200"}`}
                    onClick={toggleType}
                  >
                    {typeFlight}
                  </button>
                </div>
              </div>
            </div>
          )}

          {searchType === "hotels" && (
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="mt-8">
                <span className="block font-semibold mb-2">Search Hotels:</span>
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="date"
                    placeholder="Check-in"
                    className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                    value={checkInHotel}
                    onChange={(e) => setCheckInHotel(e.target.value)}
                  />
                  <input
                    type="date"
                    placeholder="Check-out"
                    className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                    value={checkOutHotel}
                    onChange={(e) => setCheckOutHotel(e.target.value)}
                  />
                  <CityAutocomplete
                    value={cityHotel}
                    onChange={(cityHotel) => setCityHotel(cityHotel)}
                    placeholder="City"
                  />
                </div>

                <span className="block font-semibold mb-2 mt-6">Filter By:</span>
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Hotel Name"
                    className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Min. Price"
                    className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                    value={minPrice}
                    step="100"
                    min="0"
                    max={maxPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max. Price"
                    className={` ${isDarkMode ? "text-sky-200" : "text-sky-700"} w-full p-3 border border-sky-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-200`}
                    value={maxPrice}
                    step="100"
                    min={minPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />

                  <StarRating onRatingChange={(rating) => setStarRating(rating)} />

                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button onClick={handleSearch} className="w-full max-w-md bg-yellow-200 text-sky-700 py-3 rounded-md hover:bg-yellow-300 transition-all">
              Search {searchType === "flights" ? "Flights" : "Hotels"}
            </button>
          </div>

          {HotelParams && <HotelSearch HotelParams={HotelParams} />}
          {FlightParams && <FlightSearch FlightParams={FlightParams} />}
        </div>
      </div>
    </div>
  );
}
