import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { LiveProjectButton } from "./LiveProjectButton";

export interface ProjectData {
  number: string;
  name: string;
  category: string;
  col1: [string, string];
  col2: string;
}

interface StackedProjectCardsProps {
  projects: ProjectData[];
}

export function StackedProjectCards({ projects }: StackedProjectCardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={containerRef} className="relative">
      {projects.map((p, i) => (
        <StickyCard
          key={i}
          index={i}
          total={projects.length}
          project={p}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

function StickyCard({
  index,
  total,
  project,
  containerRef,
}: {
  index: number;
  total: number;
  project: ProjectData;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={cardRef} className="h-[85vh] sticky" style={{ top: `${96 + index * 28}px` }}>
      <motion.article
        style={{ scale }}
        className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 p-4 sm:p-6 md:p-8 h-full flex flex-col"
        // eslint-disable-next-line react/forbid-dom-props
      >
        <div
          className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 p-4 sm:p-6 md:p-8 h-full flex flex-col"
          style={{ borderColor: "#D7E2EA", background: "#0C0C0C" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-baseline gap-6">
              <span
                className="font-black leading-none"
                style={{ fontSize: "clamp(3rem, 10vw, 140px)", color: "#D7E2EA" }}
              >
                {project.number}
              </span>
              <div>
                <div
                  className="uppercase tracking-widest text-xs sm:text-sm font-light"
                  style={{ color: "#D7E2EA", opacity: 0.6 }}
                >
                  {project.category}
                </div>
                <div
                  className="uppercase font-medium"
                  style={{
                    color: "#D7E2EA",
                    fontSize: "clamp(1rem, 2.2vw, 2.1rem)",
                  }}
                >
                  {project.name}
                </div>
              </div>
            </div>
            <LiveProjectButton />
          </div>

          <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
            <div className="col-span-2 flex flex-col gap-4">
              <img
                src={project.col1[0]}
                alt={`${project.name} preview 1`}
                loading="lazy"
                className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
                style={{ height: "clamp(130px, 16vw, 230px)" }}
              />
              <img
                src={project.col1[1]}
                alt={`${project.name} preview 2`}
                loading="lazy"
                className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
                style={{ height: "clamp(160px, 22vw, 340px)" }}
              />
            </div>
            <div className="col-span-3">
              <img
                src={project.col2}
                alt={`${project.name} feature`}
                loading="lazy"
                className="w-full h-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              />
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
