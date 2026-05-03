import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  starClassName?: string;
}

export function StarRating({
  rating,
  maxStars = 5,
  className,
  starClassName,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={cn("flex items-center space-x-0.5", className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn("w-4 h-4 fill-accent text-accent", starClassName)}
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          key="half"
          className={cn("w-4 h-4 fill-accent text-accent", starClassName)}
        />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn("w-4 h-4 text-muted-foreground/30", starClassName)}
        />
      ))}
    </div>
  );
}
