'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score: number; // 1 to 5 scale
}

const StarRating: React.FC<StarRatingProps> = ({ score }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`w-5 h-5 ${index < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default StarRating;