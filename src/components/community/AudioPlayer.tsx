import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  isOwn?: boolean;
}

export const AudioPlayer = ({ audioUrl, isOwn = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      console.error("Erro ao carregar áudio:", {
        url: audioUrl,
        error: audio.error,
        code: audio.error?.code,
        message: audio.error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
      setError(true);
      setLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error("Erro ao reproduzir áudio:", err);
        setError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Gerar alturas do waveform apenas uma vez para evitar flickering
  const waveformBars = useMemo(() => 
    Array.from({ length: 40 }, () => Math.random() * 60 + 40),
    []
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isBlobUrl = audioUrl.startsWith('blob:');

  if (error) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isOwn ? "bg-primary/10" : "bg-muted"
      }`}>
        <span className="text-xs text-destructive">Erro ao carregar</span>
        <Button 
          size="sm" 
          variant="ghost"
          className="h-7 px-2"
          onClick={() => {
            setError(false);
            setLoading(true);
            if (audioRef.current) {
              audioRef.current.load();
            }
          }}
        >
          <Play className="h-3 w-3 mr-1" />
          <span className="text-xs">Tentar novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
      isOwn ? "bg-primary/10" : "bg-muted"
    }`}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        {...(!isBlobUrl && { crossOrigin: "anonymous" })}
      />
      
      {/* Play/Pause Button */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={togglePlay}
        disabled={loading}
        className="h-8 w-8 rounded-full flex-shrink-0"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      {/* Waveform/Progress Bar */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div 
          className="flex-1 h-8 cursor-pointer relative flex items-center gap-0.5 px-1"
          onClick={handleProgressClick}
        >
          {/* Simulated waveform bars */}
          {waveformBars.map((height, i) => {
            const isPast = (i / 40) * 100 <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  isPast ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Time Display */}
        <div className="flex flex-col text-[10px] text-muted-foreground flex-shrink-0 leading-tight">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
