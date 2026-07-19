import { ButtonHTMLAttributes } from "react";

export function LiveProjectButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-full border-2 font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base transition-colors ${className}`}
      style={{
        borderColor: "#D7E2EA",
        color: "#D7E2EA",
        background: "transparent",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(215,226,234,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children ?? "Live Project"}
    </button>
  );
}
