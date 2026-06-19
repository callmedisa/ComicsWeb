export function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="flex h-[84px] w-[84px] items-center justify-center rounded-full animate-pop"
      style={{
        background: `conic-gradient(#36C77C 0 ${score}%, #E3F1EC ${score}% 100%)`,
      }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white font-display text-xl font-extrabold text-ink">
        {score}
      </div>
    </div>
  );
}
