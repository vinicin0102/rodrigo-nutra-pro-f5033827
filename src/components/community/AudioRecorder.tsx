import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob | null) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({ onAudioRecorded, disabled }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Detectar formato de áudio mais compatível (priorizar Safari/iOS)
      const getSupportedMimeType = () => {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        const types = isSafari 
          ? [
              'audio/mp4',
              'audio/aac',
              'audio/webm;codecs=opus',
              'audio/webm',
              'audio/ogg'
            ]
          : [
              'audio/webm;codecs=opus',
              'audio/webm',
              'audio/mp4',
              'audio/ogg;codecs=opus',
              'audio/ogg'
            ];
        
        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            console.log('Using audio format:', type);
            return type;
          }
        }
        return 'audio/webm'; // fallback
      };

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Audio recorded:', { size: audioBlob.size, type: audioBlob.type });
        
        onAudioRecorded(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erro ao acessar microfone",
        description: "Permita o acesso ao microfone para gravar áudio",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={startRecording}
          disabled={disabled}
          className="h-11 w-11 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white disabled:opacity-50"
          title="Gravar áudio"
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={stopRecording}
            className="h-8 w-8 hover:bg-red-500/20"
          >
            <Square className="h-4 w-4 fill-red-500 text-red-500" />
          </Button>
          <span className="text-sm font-medium text-red-400">
            {formatTime(recordingTime)}
          </span>
          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
        </div>
      )}
    </div>
  );
};
