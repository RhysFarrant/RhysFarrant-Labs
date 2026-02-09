import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none ring-0 placeholder:text-text-muted/80 transition-colors focus:border-accent/60 ${className}`}
      {...props}
    />
  );
}
