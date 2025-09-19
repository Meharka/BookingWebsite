import { useState } from "react";

const StarRating = ({ totalStars = 5, onRatingChange }: { totalStars?: number; onRatingChange?: (rating: number) => void }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleClick = (star: number) => {
    setRating(star);
    if (onRatingChange) onRatingChange(star);
  };

  return (
    <div className="flex space-x-1">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            className={`cursor-pointer text-2xl ${
              starValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;