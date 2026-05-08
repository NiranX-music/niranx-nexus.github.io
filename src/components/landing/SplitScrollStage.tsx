import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface SplitScrollStageProps {
  leftChildren: ReactNode[];
  rightChildren: ReactNode[];
  /** 0 - 40 (%) — how far the columns drift apart on scroll */
  intensity?: number;
  /** Spring smoothness: higher = snappier, lower = silkier */
  stiffness?: number;
  damping?: number;
  /** Enable CSS scroll-snap on each section */
  snap?: boolean;
}

/**
 * SplitScrollStage — 3D split landing with counter-parallax.
 * LEFT drifts down, RIGHT drifts up. Tunable intensity, easing, snap.
 */
export function SplitScrollStage({
  leftChildren,
  rightChildren,
  intensity = 18,
  stiffness = 60,
  damping = 24,
  snap = false,
}: SplitScrollStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Silkier spring with mass for inertia
  const smooth = useSpring(scrollYProgress, {
    stiffness,
    damping,
    mass: 0.6,
    restDelta: 0.0005,
  });

  const drift = Math.max(0, Math.min(40, intensity));
  const tilt = Math.min(4, drift / 6);

  const leftY = useTransform(smooth, [0, 1], ['0%', `${drift}%`]);
  const leftRotate = useTransform(smooth, [0, 1], [0, -tilt]);
  const rightY = useTransform(smooth, [0, 1], ['0%', `-${drift}%`]);
  const rightRotate = useTransform(smooth, [0, 1], [0, tilt]);

  const snapItem = snap ? 'snap-start snap-always' : '';

  return (
    <div
      ref={ref}
      className="relative"
      style={{ perspective: '1600px' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 md:px-8">
        {/* LEFT — drifts down */}
        <motion.div
          style={{ y: leftY, rotateZ: leftRotate, transformStyle: 'preserve-3d' }}
          className="flex flex-col gap-12 will-change-transform"
        >
          {leftChildren.map((child, i) => (
            <motion.div
              key={`l-${i}`}
              initial={{ opacity: 0, x: -40, rotateY: 8 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`origin-left ${snapItem}`}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>

        {/* RIGHT — drifts up */}
        <motion.div
          style={{ y: rightY, rotateZ: rightRotate, transformStyle: 'preserve-3d' }}
          className="flex flex-col gap-12 will-change-transform md:mt-32"
        >
          {rightChildren.map((child, i) => (
            <motion.div
              key={`r-${i}`}
              initial={{ opacity: 0, x: 40, rotateY: -8 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`origin-right ${snapItem}`}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
