import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export default function VelorahLanding() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: "hsl(201 100% 13%)",
        color: "hsl(0 0% 100%)",
        fontFamily: "var(--font-body-landing)",
      }}
    >
      <Helmet>
        <title>Velorah — Where dreams rise through the silence</title>
        <meta
          name="description"
          content="Velorah designs tools for deep thinkers, bold creators, and quiet rebels — digital spaces for sharp focus and inspired work."
        />
      </Helmet>

      {/* Fullscreen video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        src={VIDEO_URL}
        aria-hidden="true"
      />

      {/* Nav */}
      <nav className="relative z-10 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link
          to="/"
          className="text-3xl tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(0 0% 100%)" }}
        >
          Velorah<sup className="text-xs">®</sup>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", active: true },
            { label: "Studio" },
            { label: "About" },
            { label: "Journal" },
            { label: "Reach Us" },
          ].map((l) => (
            <a
              key={l.label}
              href="#"
              className="text-sm transition-colors"
              style={{
                color: l.active ? "hsl(0 0% 100%)" : "hsl(240 4% 66%)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 100%)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = l.active ? "hsl(0 0% 100%)" : "hsl(240 4% 66%)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          className="liquid-glass rounded-full px-6 py-2.5 text-sm hover:scale-[1.03]"
          style={{ color: "hsl(0 0% 100%)" }}
        >
          Begin Journey
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-40 py-[90px]">
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] max-w-7xl font-normal"
          style={{
            fontFamily: "'Instrument Serif', serif",
            letterSpacing: "-2.46px",
            color: "hsl(0 0% 100%)",
          }}
        >
          Where <em className="not-italic" style={{ color: "hsl(240 4% 66%)" }}>dreams</em> rise{" "}
          <em className="not-italic" style={{ color: "hsl(240 4% 66%)" }}>through the silence.</em>
        </h1>
        <p
          className="animate-fade-rise-delay text-base sm:text-lg max-w-2xl mt-8 leading-relaxed"
          style={{ color: "hsl(240 4% 66%)" }}
        >
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos,
          we build digital spaces for sharp focus and inspired work.
        </p>
        <button
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base mt-12 cursor-pointer hover:scale-[1.03]"
          style={{ color: "hsl(0 0% 100%)" }}
        >
          Begin Journey
        </button>
      </section>
    </div>
  );
}
