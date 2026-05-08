import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface SplitScrollStageProps {
  leftChildren: ReactNode[];
  rightChildren: ReactNode[];
}

/**
 * SplitScrollStage — A 3D-feeling split landing layout.
 * As the user scrolls the page, the LEFT column drifts DOWNWARD
 * and the RIGHT column drifts UPWARD (counter-parallax), with a
 * subtle perspective tilt to sell the 3D effect.
 */
export function SplitScrollStage({ leftChildren, rightChildren }: SplitScrollStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.4 });

  // Left column: drifts down as you scroll
  const leftY = useTransform(smooth, [0, 1], ['0%', '18%']);
  const leftRotate = useTransform(smooth, [0, 1], [0, -2]);

  // Right column: drifts up as you scroll
  const rightY = useTransform(smooth, [0, 1], ['0%', '-18%']);
  const rightRotate = useTransform(smooth, [0, 1], [0, 2]);

  return (
    <div ref={ref} className="relative" style={{ perspective: '1600px' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 md:px-8">
        {/* LEFT column — moves down */}
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
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="origin-left"
            >
              {child}
            </motion.div>
          ))}
        </motion.div>

        {/* RIGHT column — moves up */}
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
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="origin-right"
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
