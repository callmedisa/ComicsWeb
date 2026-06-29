import { Comic, Panel } from "@/lib/types";

function rowsFor(panels: Panel[]): Panel[][] {
  if (panels.length === 0) return [];
  const rows: Panel[][] = [[panels[0]]];
  const rest = panels.slice(1);
  for (let i = 0; i < rest.length; i += 2) {
    rows.push(rest.slice(i, i + 2));
  }
  return rows;
}

function Bubble({ panel }: { panel: Panel }) {
  const line = panel.dialogue[0];
  if (!line) return null;
  const side = panel.index % 2 === 0 ? "left" : "right";

  return (
    <div className={`absolute top-3 ${side === "left" ? "left-3" : "right-3"} max-w-[80%]`}>
      <div className="speech-bubble text-sm shadow-card">
        <p className="font-body text-sm font-bold text-ink">
          <span className="text-primary">{line.speaker}:</span> {line.text}
        </p>
      </div>
    </div>
  );
}

function MangaPanel({ panel }: { panel: Panel }) {
  return (
    <div className="comic-panel relative aspect-[4/3] w-full overflow-hidden">
      {panel.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={panel.imageUrl}
          alt={panel.sceneLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="placeholder-art absolute inset-0">{panel.sceneLabel.toLowerCase()}</div>
      )}
      <Bubble panel={panel} />
    </div>
  );
}

export function MangaPageView({ comic }: { comic: Comic }) {
  const rows = rowsFor(comic.panels);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      {rows.map((row, i) =>
        row.length === 1 ? (
          <MangaPanel key={row[0].id} panel={row[0]} />
        ) : (
          <div key={i} className="grid grid-cols-2 gap-3">
            {row.map((panel) => (
              <MangaPanel key={panel.id} panel={panel} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
