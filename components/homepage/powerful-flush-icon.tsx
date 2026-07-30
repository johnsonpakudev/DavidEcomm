import { cn } from "@/lib/utils";

const STROKE = "#2D3748";
const SWIRL = "#2F80ED";

export function PowerfulFlushIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 52 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-10 md:size-11", className)}
      aria-hidden="true"
    >
      {/* Cistern */}
      <rect
        x="4"
        y="7"
        width="14"
        height="20"
        rx="1.5"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeWidth="2.25"
      />
      <path d="M4 9.5h14" stroke={STROKE} strokeWidth="2.25" strokeLinecap="round" />

      {/* Bowl */}
      <path
        d="M18 19.5H36.5C41.5 19.5 44.5 22.5 44.5 27.5V29.5C44.5 35.5 40 40 33.5 40H23.5C18 40 14.5 36 14.5 31V26C14.5 22 16.5 19.5 18 19.5Z"
        fill="#FFFFFF"
        stroke={STROKE}
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <path d="M18 19.5H38.5" stroke={STROKE} strokeWidth="2.25" strokeLinecap="round" />
      <path d="M22 40H35" stroke={STROKE} strokeWidth="2.25" strokeLinecap="round" />

      {/* Swirl */}
      <path
        d="M31.5 26.5C35.8 26.5 38.5 29.2 38.5 32.8C38.5 37.2 34.2 39.8 30.2 39.8C25.5 39.8 22.5 36.5 22.5 32.5C22.5 27.8 26.8 24.8 32 24.8C37.5 24.8 41 28.5 41 33.2"
        stroke={SWIRL}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M31.8 29.2C34.2 29.2 35.8 30.8 35.8 32.8C35.8 35.2 33.5 36.8 31.2 36.8C28.5 36.8 26.8 35 26.8 32.8C26.8 30.5 28.8 28.8 31.5 28.8C34.2 28.8 36 30.5 36 32.8"
        stroke={SWIRL}
        strokeWidth="2.15"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
