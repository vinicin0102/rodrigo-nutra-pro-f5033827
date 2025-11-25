import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Gem } from "lucide-react";

interface DiamondAnimationProps {
  points: number;
  onComplete?: () => void;
}

export const DiamondAnimation = ({ points, onComplete }: DiamondAnimationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-scale-in">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl opacity-60">
            <div className="w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse" />
          </div>
          
          {/* Main content */}
          <div className="relative bg-gradient-to-br from-cyan-500/90 via-blue-600/90 to-purple-700/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-white/20">
            <div className="text-center space-y-4">
              {/* Animated diamonds */}
              <div className="relative flex items-center justify-center">
                <Gem className="w-20 h-20 text-white animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                <Gem className="w-12 h-12 text-white/60 absolute -left-8 -top-4 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <Gem className="w-12 h-12 text-white/60 absolute -right-8 -top-4 animate-bounce" style={{ animationDelay: '0.4s' }} />
                <Gem className="w-8 h-8 text-white/40 absolute -left-12 top-8 animate-bounce" style={{ animationDelay: '0.6s' }} />
                <Gem className="w-8 h-8 text-white/40 absolute -right-12 top-8 animate-bounce" style={{ animationDelay: '0.8s' }} />
              </div>
              
              {/* Points text */}
              <div className="space-y-2">
                <p className="text-white text-2xl font-bold animate-pulse">
                  PARABÉNS!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    +{points}
                  </span>
                  <Gem className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <p className="text-white/90 text-lg font-semibold">
                  Pontos de Diamante
                </p>
              </div>
            </div>
          </div>

          {/* Sparkles */}
          <div className="absolute inset-0 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
