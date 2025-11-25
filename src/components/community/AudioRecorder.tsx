import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, X, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AudioPlayer } from "./AudioPlayer";

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob | null) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({ onAudioRecorded, disabled }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Detectar formato de áudio mais compatível
      const getSupportedMimeType = () => {
        const types = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
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
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio recorded:', { size: audioBlob.size, type: audioBlob.type });
        
        setRecordedAudio({ blob: audioBlob, url: audioUrl });
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

  const handleRerecord = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio.url);
      setRecordedAudio(null);
      onAudioRecorded(null);
    }
    startRecording();
  };

  const handleRemove = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio.url);
      setRecordedAudio(null);
      onAudioRecorded(null);
    }
  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio.url);
      }
    };
  }, [recordedAudio]);

  // Show preview if audio is recorded
  if (recordedAudio) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <AudioPlayer audioUrl={recordedAudio.url} isOwn={true} />
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleRerecord}
          disabled={disabled}
          className="h-9 w-9 flex-shrink-0"
          title="Regravar"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleRemove}
          disabled={disabled}
          className="h-9 w-9 flex-shrink-0"
          title="Remover"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={startRecording}
          disabled={disabled}
          className="h-9 w-9"
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1 rounded-full">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={stopRecording}
            className="h-7 w-7"
          >
            <Square className="h-4 w-4 fill-destructive text-destructive" />
          </Button>
          <span className="text-sm font-medium text-destructive">
            {formatTime(recordingTime)}
          </span>
          <Loader2 className="h-3 w-3 animate-spin text-destructive" />
        </div>
      )}
    </div>
  );
};
