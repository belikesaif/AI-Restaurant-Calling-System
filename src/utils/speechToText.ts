
import { pipeline } from "@huggingface/transformers";

// Store the models once loaded to avoid reloading
let transcriber: any = null;
let textProcessor: any = null;

/**
 * Initialize the transcription model for speech recognition
 */
export const initTranscriptionModel = async () => {
  try {
    if (!transcriber) {
      console.log("Loading transcription model...");
      transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { 
          // Use wasm as the default device for better compatibility
          device: "wasm" 
        }
      );
      console.log("Transcription model loaded successfully");
    }
    return transcriber;
  } catch (error) {
    console.error("Error loading transcription model:", error);
    throw new Error("Failed to load transcription model");
  }
};

/**
 * Transcribe audio using the Whisper model
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const model = await initTranscriptionModel();
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Transcribe the audio
    const result = await model(arrayBuffer);
    
    return result?.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
};

/**
 * Process transcription to improve and format it
 */
export const processTranscription = (text: string): string => {
  // Basic text processing to capitalize first letter and ensure ending punctuation
  if (!text) return "";
  
  let processed = text.trim();
  processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  
  // Add period at the end if no punctuation exists
  if (!/[.!?]$/.test(processed)) {
    processed += ".";
  }
  
  return processed;
};

/**
 * Format the restaurant's recommendations based on the transcription
 */
export const generateMenuRecommendations = (transcription: string, restaurantId: string): string => {
  // In a real application, this would use an LLM to generate personalized recommendations
  // For now, we'll use a template-based approach with the mock data
  
  let response = `Transcribed Text: ${transcription}\n\n`;
  response += "Based on our menu, here are some recommendations:\n";
  
  if (restaurantId === "restaurant_1") {
    response += "• Appetizers: Spring Rolls, Garlic Bread\n";
    response += "• Main Course: Steak, Pasta, Salad\n";
    response += "• Desserts: Cheesecake, Brownie\n";
  } else if (restaurantId === "restaurant_2") {
    response += "• Starters: Calamari, Shrimp Cocktail\n";
    response += "• Main Course: Grilled Salmon, Lobster Roll\n";
    response += "• Desserts: Key Lime Pie, Sorbet\n";
  }
  
  response += "\nThank you for choosing our restaurant. We look forward to serving you!";
  
  return response;
};
