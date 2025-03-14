
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Upload, Wand2 } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";
import { AudioState } from "../types";
import { toast } from "@/components/ui/use-toast";
import { initTranscriptionModel } from "../utils/speechToText";

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
  
  const [modelLoaded, setModelLoaded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preload the model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoaded(false);
        toast({
          title: "Loading speech recognition model",
          description: "This may take a moment...",
        });
        
        await initTranscriptionModel();
        
        setModelLoaded(true);
        toast({
          title: "Model loaded successfully",
          description: "Speech recognition is ready to use",
        });
      } catch (error) {
        console.error("Error loading model:", error);
        toast({
          title: "Model loading failed",
          description: "Will use fallback processing instead",
          variant: "destructive"
        });
      }
    };

    loadModel();
  }, []);

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
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
      
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
      
      toast({
        title: "Recording stopped",
        description: "Processing your audio...",
      });
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
    
    toast({
      title: "File uploaded",
      description: "Processing your audio...",
    });
    
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
        {!modelLoaded && (
          <div className="text-amber-600 flex items-center gap-2 mb-4">
            <Wand2 className="h-4 w-4 animate-pulse" />
            <span>Loading speech model...</span>
          </div>
        )}
        
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
      
      {modelLoaded && (
        <div className="mt-4 text-center text-sm text-green-600">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          Speech recognition model loaded
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
