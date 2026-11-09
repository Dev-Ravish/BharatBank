const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5 M5 9.5V21h14V9.5",
  arrowUpRight: "M7 17 17 7 M9 7h8v8",
  grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5",
  scan: "M4 9V5h4 M20 9V5h-4 M4 15v4h4 M20 15v4h-4",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  card: "M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z M2 10h20",
  bank: "M3 10 12 4l9 6 M4 10v9h16v-9 M9 13v4 M12 13v4 M15 13v4 M3 21h18",
  chart: "M4 20v-6 M10 20V10 M16 20V4",
  star: "m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7Z",
  bell: "M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z M10 18a2 2 0 0 0 4 0",
  eye: "M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  eyeOff: "M3 3l18 18 M10.6 5.2A10.6 10.6 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a16.6 16.6 0 0 1-3.2 4 M6.6 6.6C3.9 8.3 2 12 2 12s3.5 6.5 10 6.5c1.4 0 2.6-.2 3.7-.6 M9.9 9.9a2.5 2.5 0 0 0 3.5 3.5",
  refresh: "M4 10a8 8 0 0 1 14-5.3L20 7 M20 14a8 8 0 0 1-14 5.3L4 17 M18 4v4h-4 M6 20v-4h4",
  shield: "M12 3 4.5 5.5V11c0 5 3.3 8.3 7.5 10 4.2-1.7 7.5-5 7.5-10V5.5Z",
  clipboard: "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z M6 6h12v15H6z M9 11h6 M9 15h6",
  rupee: "M6 4h12 M6 4c0 3.5 3 6 7 6H6 M6 10h12 M8 10c0 5 4 5.5 5 5.5L19 20",
};

const FILLED = new Set(["bolt", "star"]);

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof PATHS; className?: string }) {
  const filled = FILLED.has(name);
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d={PATHS[name]}
        stroke="currentColor"
        fill={filled ? "currentColor" : "none"}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
