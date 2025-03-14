
import { useState, useEffect } from "react";
import { getRestaurants } from "../utils/api";
import { Restaurant } from "../types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface RestaurantSelectorProps {
  onSelectRestaurant: (id: string) => void;
}

export const RestaurantSelector = ({ onSelectRestaurant }: RestaurantSelectorProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurants() as Restaurant[];
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <label className="text-sm font-medium text-gray-700 block mb-1.5">
        Select Restaurant
      </label>
      <Select onValueChange={onSelectRestaurant} disabled={loading}>
        <SelectTrigger className="w-full bg-white shadow-sm">
          <SelectValue placeholder={loading ? "Loading restaurants..." : "Select a restaurant"} />
        </SelectTrigger>
        <SelectContent>
          {restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RestaurantSelector;
