import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Character-by-character scroll-driven opacity reveal.
 */
export function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = Array.from(text);

  return (
    <p ref={ref} className={className} style={style}>
      {chars.map((c, i) => {
        const start = i / chars.length;
        const end = (i + 1) / chars.length;
        return <Char key={i} char={c} start={start} end={end} progress={scrollYProgress} />;
      })}
    </p>
  );
}

function Char({
  char,
  start,
  end,
  progress,
}: {
  char: string;
  start: number;
  end: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: 0 }}>{char === " " ? "\u00A0" : char}</span>
      <motion.span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity,
        }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    </span>
  );
}
