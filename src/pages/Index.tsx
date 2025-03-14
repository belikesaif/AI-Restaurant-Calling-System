
import { useState } from "react";
import { TranscriptionResult } from "../types";
import { processAudio } from "../utils/api";
import RestaurantSelector from "../components/RestaurantSelector";
import AudioUploader from "../components/AudioUploader";
import TranscriptionResultComponent from "../components/TranscriptionResult";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const handleRestaurantSelect = (id: string) => {
    setSelectedRestaurant(id);
    // Clear previous results when restaurant changes
    setResult(null);
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

    try {
      // Process the audio and get transcription
      const response = await processAudio(audioBlob, selectedRestaurant);
      setResult(response);
      
      toast({
        title: "Transcription Complete",
        description: "Audio successfully processed.",
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full py-6 px-4 bg-white shadow-sm backdrop-blur-lg bg-opacity-80 sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-2xl font-medium text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Restaurant Voice Assistant
            </span>
          </h1>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto py-12 px-4 space-y-12">
        <section className="space-y-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold tracking-tight">Audio to Menu Recommendations</h2>
            <p className="text-muted-foreground">
              Upload or record customer audio to receive personalized menu suggestions.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
            
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
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Processing audio...</p>
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
