
import { useEffect, useRef, useState } from "react";
import { AudioWaveform, Volume2 } from "lucide-react";

interface AudioVisualizerProps {
  isRecording: boolean;
}

const AudioVisualizer = ({ isRecording }: AudioVisualizerProps) => {
  const barsCount = 50;
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(barsCount).fill(10));
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Set up audio context and analyser for visualization
      const setupAudioAnalyser = async () => {
        try {
          // Get microphone stream
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          // Create audio context and analyser
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          
          // Connect microphone to analyser
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          // Create data array for frequency data
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          // Store references
          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;
          
          // Start visualization loop
          updateVisualization();
        } catch (error) {
          console.error("Error accessing microphone for visualization:", error);
        }
      };
      
      setupAudioAnalyser();
      
      return () => {
        // Clean up on unmount or when recording stops
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
    } else {
      // Stop visualization when not recording
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);
  
  const updateVisualization = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate new bar heights based on frequency data
    const newLevels = Array(barsCount).fill(0).map((_, i) => {
      // Sample from frequency data - use a distribution that looks good visually
      const index = Math.floor(i * (dataArrayRef.current!.length / barsCount));
      // Get value and normalize it to a percentage (0-100)
      let value = dataArrayRef.current![index] / 255 * 100;
      
      // Add some randomness for a more natural look
      value = value * 0.7 + Math.random() * 30;
      
      // Ensure minimum height
      return Math.max(5, value);
    });
    
    setAudioLevel(newLevels);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(updateVisualization);
  };

  if (!isRecording) {
    return (
      <div className="flex items-center justify-center h-24 my-4">
        <div className="text-muted-foreground flex flex-col items-center gap-2">
          <AudioWaveform className="h-10 w-10 opacity-40" />
          <span>Ready to record</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-32 my-6 animate-fade-in">
      <div className="flex items-center justify-center mb-2">
        <Volume2 className="h-6 w-6 text-primary animate-pulse mr-2" />
        <span className="text-primary font-medium">Recording Audio...</span>
      </div>
      
      <div className="flex items-end space-x-[2px] h-20 bg-gradient-to-b from-background/5 to-background/20 rounded-lg p-2 w-full max-w-md">
        {audioLevel.map((height, index) => {
          // Create a variably delayed animation for each bar for a wave effect
          const delay = `${index * 10}ms`;
          
          return (
            <div
              key={index}
              className="bg-gradient-to-t from-primary to-primary/60 rounded-t-full w-1.5"
              style={{
                height: `${height}%`,
                animationDelay: delay,
                transition: 'height 0.1s ease-in-out',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioVisualizer;
