import { ReactNode } from "react";
import { Panel } from "@/lib/types";

export function ComicPage({
  panel,
  placeholder,
}: {
  panel: Panel;
  placeholder?: ReactNode;
}) {
  const line = panel.dialogue[0];
  const caption = panel.sceneLabel.replace(/^comic scene · /, "").toUpperCase();

  return (
    <div className="comic-panel overflow-hidden border-[4px] border-ink shadow-[0_0_0_4px_#E2F5F0]">
      <div className="bg-ink px-4 py-2">
        <p className="font-display text-[11px] font-extrabold uppercase tracking-[.04em] text-white">
          {caption}
        </p>
      </div>

      <div className="relative aspect-[4/3] w-full">
        {panel.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={panel.imageUrl}
            alt={panel.sceneLabel}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="placeholder-art absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            {placeholder}
          </div>
        )}

        {line && panel.imageUrl && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="speech-bubble inline-block max-w-[85%]">
              <p className="font-body text-sm font-bold text-ink">
                <span className="text-primary">{line.speaker}:</span> {line.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
