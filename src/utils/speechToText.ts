
import { pipeline } from "@huggingface/transformers";

// Store the models once loaded to avoid reloading
let transcriber: any = null;

/**
 * Initialize the transcription model for speech recognition
 */
export const initTranscriptionModel = async () => {
  try {
    if (!transcriber) {
      console.log("Loading transcription model...");
      transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-large-v2",
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
    console.log("Starting transcription process...");
    const model = await initTranscriptionModel();
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    console.log("Audio converted to array buffer, size:", arrayBuffer.byteLength);
    
    // Transcribe the audio
    console.log("Sending audio to model for transcription...");
    const result = await model(arrayBuffer);
    console.log("Transcription result:", result);
    
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
 * Generate restaurant recommendations based on the transcription
 */
export const generateMenuRecommendations = (transcription: string, restaurantId: string): string => {
  console.log(`Generating recommendations for restaurant ${restaurantId} based on: "${transcription}"`);
  
  // Detect keywords in the transcription
  const keywords = {
    vegetarian: /vegetarian|vegan|plant(-| )based|no meat/i,
    spicy: /spicy|hot|chili/i,
    dessert: /dessert|sweet|cake|ice cream/i,
    seafood: /seafood|fish|shrimp|lobster/i,
    kids: /kids|children|child/i,
    drink: /drink|beverage|cocktail|wine|beer/i,
    gluten: /gluten(-| )free|celiac/i,
    healthy: /healthy|light|diet/i,
    popular: /popular|best seller|special|recommend/i
  };
  
  // Base response
  let response = `Transcribed Request: ${transcription}\n\n`;
  response += "Based on our menu, here are some recommendations:\n";
  
  // Restaurant-specific recommendations with dynamic content based on keywords
  if (restaurantId === "restaurant_1") {
    // Gourmet Bistro
    let appetizers = ["Spring Rolls", "Garlic Bread", "Bruschetta"];
    let mains = ["Steak", "Pasta Primavera", "Grilled Chicken"];
    let desserts = ["Cheesecake", "Chocolate Brownie", "Crème Brûlée"];
    let drinks = ["House Wine", "Craft Beer", "Sparkling Water"];
    
    // Modify recommendations based on detected keywords
    if (keywords.vegetarian.test(transcription)) {
      mains = ["Vegetable Risotto", "Eggplant Parmesan", "Mushroom Wellington"];
    }
    
    if (keywords.spicy.test(transcription)) {
      appetizers.push("Spicy Buffalo Wings");
      mains.push("Cajun Chicken Pasta");
    }
    
    if (keywords.dessert.test(transcription)) {
      desserts = ["Tiramisu", "Apple Pie à la Mode", "Chocolate Fondue", "Vanilla Bean Ice Cream"];
    }
    
    if (keywords.kids.test(transcription)) {
      response += "• Kids Menu: Mac & Cheese, Mini Burgers, Chicken Tenders\n";
    }
    
    if (keywords.gluten.test(transcription)) {
      response += "• Gluten-Free Options: Quinoa Salad, Grilled Salmon, Rice Bowl\n";
    }
    
    // Add sections to response
    response += `• Appetizers: ${appetizers.join(", ")}\n`;
    response += `• Main Course: ${mains.join(", ")}\n`;
    response += `• Desserts: ${desserts.join(", ")}\n`;
    
    if (keywords.drink.test(transcription)) {
      response += `• Drinks: ${drinks.join(", ")}\n`;
    }
    
  } else if (restaurantId === "restaurant_2") {
    // Seafood Delight
    let starters = ["Calamari", "Shrimp Cocktail", "Crab Cakes"];
    let mains = ["Grilled Salmon", "Lobster Roll", "Fish & Chips"];
    let desserts = ["Key Lime Pie", "Sorbet", "Coconut Cake"];
    let drinks = ["White Wine", "Tropical Cocktails", "Sparkling Water"];
    
    // Modify recommendations based on detected keywords
    if (keywords.vegetarian.test(transcription)) {
      starters.push("Seaweed Salad");
      mains = ["Vegetable Paella", "Mushroom Risotto", "Vegetable Tempura"];
    }
    
    if (keywords.spicy.test(transcription)) {
      starters.push("Spicy Tuna Tartare");
      mains.push("Cajun Shrimp Pasta");
    }
    
    if (keywords.popular.test(transcription)) {
      response += "• Chef's Specials: Seafood Tower, Surf and Turf, Lobster Bisque\n";
    }
    
    if (keywords.healthy.test(transcription)) {
      response += "• Healthy Options: Grilled Fish Tacos, Poke Bowl, Cedar-Planked Salmon\n";
    }
    
    // Add sections to response
    response += `• Starters: ${starters.join(", ")}\n`;
    response += `• Main Course: ${mains.join(", ")}\n`;
    response += `• Desserts: ${desserts.join(", ")}\n`;
    
    if (keywords.drink.test(transcription)) {
      response += `• Drinks: ${drinks.join(", ")}\n`;
    }
  }
  
  response += "\nThank you for choosing our restaurant. We look forward to serving you!";
  
  return response;
};
