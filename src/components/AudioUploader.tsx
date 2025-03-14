
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Upload } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";
import { AudioState } from "../types";
import { toast } from "@/components/ui/use-toast";

interface AudioUploaderProps {
  disabled: boolean;
  onAudioCaptured: (audioBlob: Blob) => void;
}

const AudioUploader = ({ disabled, onAudioCaptured }: AudioUploaderProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    hasRecording: false,
    isProcessing: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start recording audio
  const startRecording = async () => {
    try {
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create new media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // On data available, add chunk to array
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // On recording stop
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioState(prev => ({ 
          ...prev, 
          hasRecording: true, 
          audioBlob 
        }));
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process the audio
        onAudioCaptured(audioBlob);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setAudioState(prev => ({ ...prev, isRecording: true, hasRecording: false }));
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && audioState.isRecording) {
      mediaRecorderRef.current.stop();
      setAudioState(prev => ({ ...prev, isRecording: false }));
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const supportedTypes = ['audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/mpeg'];
    
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported Format",
        description: "Please upload a WAV, MP3, or M4A file.",
        variant: "destructive"
      });
      return;
    }
    
    setAudioState(prev => ({ 
      ...prev, 
      hasRecording: true, 
      audioBlob: file 
    }));
    
    onAudioCaptured(file);
  };

  // Open file upload dialog
  const openFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".wav,.mp3,.m4a"
        onChange={handleFileUpload}
      />
      
      <AudioVisualizer isRecording={audioState.isRecording} />
      
      <div className="flex justify-center gap-4 mt-6">
        {!audioState.isRecording ? (
          <>
            <Button
              onClick={startRecording}
              disabled={disabled}
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Mic className="mr-2 h-4 w-4" />
              Record Audio
            </Button>
            
            <Button
              onClick={openFileUpload}
              disabled={disabled}
              variant="outline"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-secondary/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-300"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioUploader;
