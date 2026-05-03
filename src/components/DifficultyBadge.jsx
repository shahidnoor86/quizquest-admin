const CONFIG = {
  Easy:   { bg: "bg-green-500/15",  border: "border-green-500/30",  text: "text-green-400"  },
  Medium: { bg: "bg-amber-500/15",  border: "border-amber-500/30",  text: "text-amber-400"  },
  Hard:   { bg: "bg-red-500/15",    border: "border-red-500/30",    text: "text-red-400"    },
};

export default function DifficultyBadge({ difficulty }) {
  const cfg = CONFIG[difficulty] ?? CONFIG.Medium;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {difficulty}
    </span>
  );
}