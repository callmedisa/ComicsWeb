export function TeacherCard({
  emoji,
  stripeColors,
  name,
  role,
  bio,
  photoUrl,
}: {
  emoji: string;
  stripeColors: [string, string];
  name: string;
  role: string;
  bio: string;
  photoUrl?: string | null;
}) {
  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div
        className="relative mb-4 h-36 overflow-hidden rounded-panel border-[3px] border-ink"
        style={
          photoUrl
            ? undefined
            : {
                background: `repeating-linear-gradient(135deg, ${stripeColors[0]} 0 14px, ${stripeColors[1]} 14px 28px)`,
              }
        }
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="absolute left-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white text-base">
            {emoji}
          </span>
        )}
      </div>
      <div className="font-display text-lg font-extrabold text-ink">{name}</div>
      <div className="label-caps mt-0.5 text-primary">{role}</div>
      <p className="mt-2 text-sm text-muted-2">{bio}</p>
    </div>
  );
}
