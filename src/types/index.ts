
export interface Restaurant {
  id: string;
  name: string;
}

export interface MenuCategory {
  name: string;
  items: string[];
}

export interface TranscriptionResult {
  transcript: string;
  response: string;
}

export interface AudioState {
  isRecording: boolean;
  hasRecording: boolean;
  audioBlob?: Blob;
  isProcessing: boolean;
}
