import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-accent/50 bg-accent/20 text-text-primary hover:border-accent hover:bg-accent/30",
  ghost:
    "border-border bg-surface/70 text-text-secondary hover:border-text-muted hover:text-text-primary",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
