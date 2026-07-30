import { cn } from "@/lib/utils";

export function PowerfulFlushIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7 md:size-8", className)}
      aria-hidden="true"
    >
      <path
        d="M8 12.5h13.5a2 2 0 0 1 2 2V27a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14.5a2 2 0 0 1 2-2Z"
        fill="#F3F6F9"
        stroke="#1E2B3B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 12.5V10.75a2.25 2.25 0 0 1 2.25-2.25h4.5A2.25 2.25 0 0 1 19.5 10.75V12.5"
        stroke="#1E2B3B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M21.5 16.25h11.25c2.9 0 5.25 2.35 5.25 5.25v4.25c0 5.45-4.4 9.85-9.85 9.85h-2.4c-5.45 0-9.85-4.4-9.85-9.85v-4.25c0-2.9 2.35-5.25 5.25-5.25Z"
        fill="#E8F1FA"
        stroke="#1E2B3B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M27.5 24.25c2.35 1.45 2.55 4.55.45 6.35c-1.45 1.2-3.55 1.05-4.75-.35"
        stroke="#4F86C6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28.25 21.75c1.35-1.65 3.75-2.05 5.35-.75"
        stroke="#4F86C6"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M26.75 27.1c-.55 1.15-1.85 1.7-3 1.25"
        stroke="#6FA8E8"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
