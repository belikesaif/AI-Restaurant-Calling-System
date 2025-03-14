
import { useState } from "react";
import { TranscriptionResult } from "../types";
import { processAudio } from "../utils/api";
import RestaurantSelector from "../components/RestaurantSelector";
import AudioUploader from "../components/AudioUploader";
import TranscriptionResultComponent from "../components/TranscriptionResult";
import { Loader2, Utensils, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRestaurantSelect = (id: string) => {
    setSelectedRestaurant(id);
    // Clear previous results when restaurant changes
    setResult(null);
    setError(null);
  };

  const handleAudioCaptured = async (audioBlob: Blob) => {
    if (!selectedRestaurant) {
      toast({
        title: "Restaurant Selection Required",
        description: "Please select a restaurant before uploading audio.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      console.log("Starting audio processing...");
      // Process the audio and get transcription
      const response = await processAudio(audioBlob, selectedRestaurant);
      
      if (!response.transcript) {
        throw new Error("No transcript was generated. Please try speaking more clearly or for longer.");
      }
      
      setResult(response);
      
      toast({
        title: "Transcription Complete",
        description: "Audio successfully processed using Whisper model.",
      });
    } catch (error: any) {
      console.error("Error processing audio:", error);
      setError(error.message || "Failed to process the audio");
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process the audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="w-full py-6 px-4 bg-white shadow-sm backdrop-blur-lg bg-opacity-80 sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Utensils className="h-7 w-7 text-primary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-500">
              Restaurant Voice Assistant
            </span>
          </h1>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto py-12 px-4 space-y-12">
        <section className="space-y-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold tracking-tight flex items-center justify-center gap-2">
              <span>Audio to Menu Recommendations</span>
              <Sparkles className="h-6 w-6 text-amber-400" />
            </h2>
            <p className="text-muted-foreground text-lg">
              Upload or record customer audio to receive personalized menu suggestions.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-100 rounded-full opacity-20 blur-3xl pointer-events-none" />
            
            <RestaurantSelector onSelectRestaurant={handleRestaurantSelect} />
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            
            <AudioUploader 
              disabled={!selectedRestaurant || isProcessing} 
              onAudioCaptured={handleAudioCaptured}
            />
          </div>
        </section>

        {isProcessing && (
          <div className="flex flex-col items-center justify-center p-12 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4 relative z-10" />
            </div>
            <p className="text-muted-foreground text-lg mt-4">Processing your audio...</p>
          </div>
        )}

        {result && !isProcessing && (
          <section className="space-y-6 animate-fade-in">
            <TranscriptionResultComponent result={result} />
          </section>
        )}
      </main>

      <footer className="w-full py-6 px-4 bg-white border-t">
        <div className="container max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2023 Restaurant Voice Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
