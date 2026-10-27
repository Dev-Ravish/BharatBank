"use client";

export type CursorState = { x: number; y: number; visible: boolean; click: number };

export default function GhostCursor({ cursor, busy }: { cursor: CursorState; busy: boolean }) {
  return (
    <>
      {busy && (
        <div className="guide-banner" role="status">
          <span className="guide-dot" /> Bharat is using the screen…
        </div>
      )}
      <div
        className={`ghost-cursor${cursor.visible ? " show" : ""}`}
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
        aria-hidden
      >
        <span key={cursor.click} className={cursor.click ? "gc-ring" : ""} />
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path d="M4 2l15 9-6.5 1.6L9.8 19z" fill="#fff" stroke="#0f766e" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <b>Bharat</b>
      </div>
    </>
  );
}
