"use client";

export type CursorState = { x: number; y: number; visible: boolean; click: number };

export default function GhostCursor({ cursor }: { cursor: CursorState }) {
  return (
    <div
      className={`ghost-cursor${cursor.visible ? " show" : ""}`}
      style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      aria-hidden
    >
      <span key={cursor.click} className={cursor.click ? "gc-ring" : ""} />
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M4 2l15 9-6.5 1.6L9.8 19z" fill="#fff" stroke="#4a1527" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      <b>Saarthi</b>
    </div>
  );
}
