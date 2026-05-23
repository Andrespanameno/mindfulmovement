import { cn } from "@/lib/utils";
import { useMotivationalMessage, type MessagePlacement, type MessageCategory } from "@/hooks/useMotivationalMessage";

interface InspirationCardProps {
  placement: MessagePlacement;
  category?: MessageCategory;
  variant?: "subtle" | "bare";
  className?: string;
}

/**
 * Renders a curated, rotating motivational message for a given placement.
 * - `subtle` (default): bordered, padded card suitable for the home page.
 * - `bare`: no card chrome — just italic text + author, for completion screens.
 */
export function InspirationCard({
  placement,
  category,
  variant = "subtle",
  className,
}: InspirationCardProps) {
  const { message } = useMotivationalMessage({ placement, category });
  if (!message) return null;

  const showAuthor =
    message.author && message.author.trim().length > 0;

  if (variant === "bare") {
    return (
      <div className={cn("text-center", className)}>
        <p className="text-sm italic text-muted-foreground text-pretty leading-relaxed">
          "{message.message}"
        </p>
        {showAuthor && (
          <p className="text-xs font-medium text-muted-foreground mt-2">— {message.author}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("pt-6 border-t border-border", className)}>
      <p className="text-sm italic text-muted-foreground text-pretty leading-relaxed">
        "{message.message}"
      </p>
      {showAuthor && (
        <p className="text-xs font-medium text-muted-foreground mt-2">— {message.author}</p>
      )}
    </div>
  );
}