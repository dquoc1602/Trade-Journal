import clsx from "clsx";

export function Spinner({ tone = "light", className }: { tone?: "light" | "danger"; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-block h-3.5 w-3.5 rounded-full border-2 animate-spin",
        tone === "light" && "border-white/40 border-t-white",
        tone === "danger" && "border-loss/40 border-t-loss",
        className
      )}
    />
  );
}
