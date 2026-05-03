export default function SkeletonCard() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-3 overflow-hidden">
      <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-[#2A2A2A] animate-pulse" />
      <div className="h-3 w-full rounded bg-[#252525] animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-[#252525] animate-pulse" />
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 flex gap-4 items-start"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-[#2A2A2A] animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-[#252525] animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-[#252525] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}