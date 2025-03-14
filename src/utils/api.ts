
import { TranscriptionResult } from "../types";
import { transcribeAudio, processTranscription, generateMenuRecommendations } from "./speechToText";

// Since we can't actually connect to the backend specified in the prompt,
// we'll simulate the API response for demo purposes
const mockRestaurants = [
  { id: "restaurant_1", name: "Gourmet Bistro" },
  { id: "restaurant_2", name: "Seafood Delight" }
];

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
  try {
    console.log("Processing audio for restaurant:", restaurantId);
    
    // Perform real speech-to-text transcription
    console.log("Starting transcription...");
    const rawTranscript = await transcribeAudio(audioBlob);
    console.log("Raw transcript:", rawTranscript);
    
    // Process and format the transcript
    const transcript = processTranscription(rawTranscript);
    console.log("Processed transcript:", transcript);
    
    // Generate menu recommendations based on the transcript
    const response = generateMenuRecommendations(transcript, restaurantId);
    console.log("Generated response");
    
    return {
      transcript,
      response
    };
  } catch (error) {
    console.error("Error processing audio:", error);
    throw error;
  }
};
