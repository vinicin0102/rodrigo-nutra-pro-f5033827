import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import EmojiPickerReact, { EmojiClickData } from "emoji-picker-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export const EmojiPicker = ({ onEmojiSelect, disabled }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          className="h-10 w-10 bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-400 disabled:opacity-50"
          title="Adicionar emoji"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-none" align="end">
        <EmojiPickerReact onEmojiClick={handleEmojiClick} />
      </PopoverContent>
    </Popover>
  );
};
