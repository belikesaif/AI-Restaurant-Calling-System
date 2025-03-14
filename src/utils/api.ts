
import { TranscriptionResult } from "../types";

// Since we can't actually connect to the backend specified in the prompt,
// we'll simulate the API response for demo purposes
const mockRestaurants = [
  { id: "restaurant_1", name: "Gourmet Bistro" },
  { id: "restaurant_2", name: "Seafood Delight" }
];

const mockMenuResponses = {
  restaurant_1: `Transcribed Text: I'm looking for something light for lunch, maybe with chicken.

Based on our menu, here are some recommendations:
• Appetizers: Spring Rolls, Garlic Bread
• Main Course: Steak, Pasta, Salad
• Desserts: Cheesecake, Brownie

Thank you for choosing Gourmet Bistro. We look forward to serving you!`,
  
  restaurant_2: `Transcribed Text: I'm in the mood for some seafood, what do you recommend?

Based on our menu, here are some recommendations:
• Starters: Calamari, Shrimp Cocktail
• Main Course: Grilled Salmon, Lobster Roll
• Desserts: Key Lime Pie, Sorbet

Thank you for choosing Seafood Delight. We look forward to serving you!`
};

// Get list of restaurants
export const getRestaurants = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRestaurants);
    }, 300);
  });
};

// Upload audio and get transcription
export const processAudio = async (audioBlob: Blob, restaurantId: string): Promise<TranscriptionResult> => {
  // In a real application, we would upload the audio file to the backend
  // For demo purposes, we'll simulate a delay and return mock data
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Extract transcript and response from mock data
      const response = mockMenuResponses[restaurantId as keyof typeof mockMenuResponses];
      const transcript = response.split("Transcribed Text: ")[1].split("\n\n")[0];
      
      resolve({
        transcript,
        response
      });
    }, 2000); // Simulate 2 second processing time
  });
};
