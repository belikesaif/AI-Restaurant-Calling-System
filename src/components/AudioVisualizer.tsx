
import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
}

const AudioVisualizer = ({ isRecording }: AudioVisualizerProps) => {
  const barsCount = 30;
  const barsArray = Array.from({ length: barsCount });

  if (!isRecording) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-24 my-6 animate-fade-in">
      <div className="flex items-end space-x-1">
        {barsArray.map((_, index) => {
          // Create a variably delayed animation for each bar for a wave effect
          const delay = `${index * 50}ms`;
          const randomHeight = Math.random() * 100 + 10;
          
          return (
            <div
              key={index}
              className="bg-primary w-1.5 rounded-full animate-pulse-wave"
              style={{
                height: `${randomHeight}%`,
                animationDelay: delay,
                animationDuration: '0.8s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioVisualizer;
