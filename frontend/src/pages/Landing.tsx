import React, { useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-5 py-4 shadow-card">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-primary-600" />
          <span className="text-sm text-surface-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    // Parallax effect on hero visual
    const handleMouseMove = (e: MouseEvent) => {
      const layers = document.querySelectorAll("[data-parallax-layer]");
      if (!layers.length) return;

      const { innerWidth, innerHeight } = window;
      const x = (innerWidth / 2 - e.clientX) / innerWidth;
      const y = (innerHeight / 2 - e.clientY) / innerHeight;

      layers.forEach((layer) => {
        const depth = parseFloat(layer.getAttribute("data-depth") || "1");
        const translateX = x * depth * 18;
        const translateY = y * depth * 18;
        (layer as HTMLElement).style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Navbar visual state on scroll
    const nav = document.getElementById("top-nav");
    const onScroll = () => {
      if (nav) {
        if (window.scrollY > 12) {
          nav.classList.add("is-scrolled");
        } else {
          nav.classList.remove("is-scrolled");
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="landing-page">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-page {
          font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: radial-gradient(circle at top, #f5f7f4 0%, #faf8f3 52%);
          color: #3d3428;
          line-height: 1.6;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --forest-green: #2d5016;
          --sage-green: #7a9b76;
          --soft-cream: #faf8f3;
          --warm-beige: #e8e3d5;
          --clay-brown: #8b7355;
          --deep-earth: #3d3428;
          --ai-cyan: #4a9b8e;
          --mist-white: #f5f7f4;
          --page-max-width: 1200px;
          --page-gutter: 3rem;
          --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --radius-lg: 24px;
          --radius-md: 16px;
          --shadow-soft: 0 14px 45px rgba(61, 52, 40, 0.16);
          --shadow-subtle: 0 10px 25px rgba(61, 52, 40, 0.12);
        }

        .page-shell {
          max-width: var(--page-max-width);
          margin: 0 auto;
          padding: 0 var(--page-gutter);
        }

        @media (max-width: 1024px) {
          .page-shell {
            padding: 0 2rem;
          }
        }

        @media (max-width: 768px) {
          .page-shell {
            padding: 0 1.5rem;
          }
        }

        section {
          padding: 5rem 0;
        }

        @media (max-width: 768px) {
          section {
            padding: 3.75rem 0;
          }
        }

        .section-heading {
          max-width: 640px;
          margin-bottom: 2.5rem;
        }

        .section-kicker {
          font-size: 0.8rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--sage-green);
          margin-bottom: 0.75rem;
        }

        .section-title {
          font-family: 'Crimson Pro', serif;
          font-size: clamp(2rem, 3vw, 2.75rem);
          font-weight: 400;
          letter-spacing: -0.03em;
          color: var(--forest-green);
          margin-bottom: 0.75rem;
        }

        .section-subtitle {
          font-size: 0.98rem;
          color: var(--clay-brown);
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        :focus-visible {
          outline: 2px solid var(--forest-green);
          outline-offset: 4px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.9rem 1.9rem;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: transform var(--transition-normal),
            box-shadow var(--transition-normal),
            background-color var(--transition-normal),
            color var(--transition-normal), border-color var(--transition-normal);
          font-family: inherit;
          white-space: nowrap;
        }

        .btn-primary {
          background: var(--deep-earth);
          color: var(--soft-cream);
          box-shadow: 0 10px 28px rgba(61, 52, 40, 0.25);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(61, 52, 40, 0.32);
        }

        .btn-secondary {
          background: transparent;
          border: 1.5px solid rgba(122, 155, 118, 0.6);
          color: var(--forest-green);
        }

        .btn-secondary:hover {
          background: rgba(122, 155, 118, 0.12);
          border-color: var(--forest-green);
          transform: translateY(-2px);
        }

        .nav-shell {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 40;
          backdrop-filter: blur(12px);
          background: rgba(250, 248, 243, 0.92);
          border-bottom: 1px solid rgba(61, 52, 40, 0.06);
          transition: border-color var(--transition-normal),
            background-color var(--transition-normal),
            box-shadow var(--transition-normal);
        }

        .nav-shell.is-scrolled {
          background: rgba(250, 248, 243, 0.98);
          border-bottom-color: rgba(61, 52, 40, 0.12);
          box-shadow: 0 10px 30px rgba(61, 52, 40, 0.12);
        }

        .nav-inner {
          max-width: var(--page-max-width);
          margin: 0 auto;
          padding: 1.15rem var(--page-gutter);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .nav-inner {
            padding: 0.95rem 2rem;
          }
        }

        @media (max-width: 768px) {
          .nav-inner {
            padding: 0.85rem 1.5rem;
          }
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          color: inherit;
        }

        .nav-logo-mark {
          font-size: 1.6rem;
        }

        .nav-logo-text {
          display: flex;
          flex-direction: column;
        }

        .nav-logo-main {
          font-family: 'Crimson Pro', serif;
          font-size: 1.4rem;
          letter-spacing: -0.04em;
          color: var(--forest-green);
          font-weight: 500;
        }

        .nav-logo-sub {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--clay-brown);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.2rem;
          font-size: 0.88rem;
        }

        .nav-link {
          position: relative;
          text-decoration: none;
          color: var(--deep-earth);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 400;
          font-size: 0.8rem;
          padding-bottom: 0.2rem;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 0;
          height: 1px;
          background: var(--forest-green);
          transition: width var(--transition-normal);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-ghost-link {
          font-size: 0.85rem;
          text-decoration: none;
          color: var(--clay-brown);
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .nav-ghost-link {
            display: none;
          }

          .btn.nav-primary {
            padding-inline: 1.4rem;
          }
        }

        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          align-items: center;
          gap: 4rem;
        }

        .hero-main {
          padding-top: 6.5rem;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          background: rgba(122, 155, 118, 0.12);
          border: 1px solid rgba(122, 155, 118, 0.28);
          font-size: 0.8rem;
          color: var(--forest-green);
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 1.9rem;
        }

        .hero-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: var(--ai-cyan);
          box-shadow: 0 0 0 4px rgba(74, 155, 142, 0.22);
          animation: pulse 2.2s ease-in-out infinite;
        }

        .hero-title {
          font-family: 'Crimson Pro', serif;
          font-size: clamp(3.1rem, 5vw, 4.4rem);
          font-weight: 300;
          line-height: 1.12;
          letter-spacing: -0.04em;
          color: var(--forest-green);
          margin-bottom: 1.4rem;
        }

        .hero-title span {
          font-weight: 500;
          display: inline-block;
          position: relative;
        }

        .hero-title span::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0.05em;
          width: 100%;
          height: 0.22em;
          background: linear-gradient(90deg, rgba(122, 155, 118, 0.4), rgba(74, 155, 142, 0.4));
          opacity: 0.65;
          border-radius: 999px;
          z-index: -1;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          max-width: 520px;
          color: var(--clay-brown);
          margin-bottom: 2.4rem;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 1.9rem;
          font-size: 0.78rem;
          color: var(--clay-brown);
        }

        .hero-meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          background: rgba(245, 247, 244, 0.9);
          border: 1px solid rgba(61, 52, 40, 0.06);
        }

        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.1rem;
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            padding-top: 5rem;
          }

          .hero-main {
            padding-top: 5.3rem;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 0.98rem;
          }
        }

        .hero-visual {
          position: relative;
          height: 560px;
          padding-top: 5.5rem;
          animation: fadeIn 1s ease-out 0.2s both;
        }

        .visual-frame {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: linear-gradient(135deg, rgba(122, 155, 118, 0.16), rgba(74, 155, 142, 0.12));
          box-shadow: var(--shadow-soft);
        }

        .visual-layer-base {
          position: absolute;
          inset: 9%;
          border-radius: 18px;
          background: radial-gradient(circle at 10% 0, #e9f3e6 0, #c7e0c3 40%, #98b892 100%);
          overflow: hidden;
          transform-origin: center;
        }

        .field-grid {
          position: absolute;
          inset: 12%;
          border-radius: 16px;
          border: 1px solid rgba(250, 248, 243, 0.55);
          background-image: linear-gradient(rgba(250, 248, 243, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250, 248, 243, 0.16) 1px, transparent 1px);
          background-size: 20px 20px;
          mix-blend-mode: soft-light;
        }

        .field-patch {
          position: absolute;
          border-radius: 10px;
          background: rgba(250, 248, 243, 0.9);
          box-shadow: 0 8px 22px rgba(61, 52, 40, 0.18);
          padding: 0.7rem 0.9rem;
          min-width: 120px;
          font-size: 0.75rem;
          color: var(--deep-earth);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .field-patch strong {
          font-size: 0.8rem;
        }

        .field-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          font-size: 0.68rem;
          background: rgba(74, 155, 142, 0.08);
          color: var(--ai-cyan);
        }

        .field-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
        }

        .field-metric span:last-child {
          font-weight: 600;
          color: var(--forest-green);
        }

        .timeline-card {
          position: absolute;
          right: 8%;
          bottom: 10%;
          width: 190px;
          border-radius: 14px;
          padding: 0.85rem 0.95rem;
          background: rgba(29, 49, 25, 0.96);
          color: var(--mist-white);
          font-size: 0.74rem;
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.35);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .timeline-label {
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-size: 0.65rem;
          opacity: 0.7;
        }

        .timeline-pill {
          padding: 0.15rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(202, 231, 215, 0.5);
          font-size: 0.62rem;
          color: rgba(225, 244, 235, 0.9);
        }

        .timeline-rows {
          display: grid;
          gap: 0.25rem;
          margin-bottom: 0.4rem;
        }

        .timeline-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
        }

        .timeline-row span:last-child {
          color: var(--ai-cyan);
          font-weight: 600;
        }

        .timeline-footnote {
          font-size: 0.64rem;
          opacity: 0.75;
          margin-top: 0.15rem;
        }

        .signal-chip {
          position: absolute;
          padding: 0.4rem 0.75rem;
          border-radius: 999px;
          background: rgba(250, 248, 243, 0.9);
          border: 1px solid rgba(61, 52, 40, 0.08);
          font-size: 0.7rem;
          color: var(--clay-brown);
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          box-shadow: 0 8px 24px rgba(61, 52, 40, 0.16);
        }

        .signal-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--ai-cyan);
        }

        .float-shape {
          position: absolute;
          border-radius: 999px;
          opacity: 0.35;
          background: radial-gradient(circle at 30% 0, rgba(74, 155, 142, 0.2), rgba(122, 155, 118, 0.1));
          animation: floatDiagonal 9s ease-in-out infinite;
        }

        .float-shape.alt {
          background: radial-gradient(circle at 20% 100%, rgba(139, 115, 85, 0.24), rgba(232, 227, 213, 0.65));
          animation-duration: 7.5s;
          animation-direction: alternate-reverse;
        }

        .float-1 {
          width: 110px;
          height: 110px;
          top: 10%;
          right: -4%;
        }

        .float-2 {
          width: 90px;
          height: 90px;
          bottom: 13%;
          left: -6%;
        }

        .float-3 {
          width: 60px;
          height: 60px;
          top: 33%;
          left: 5%;
        }

        @media (max-width: 900px) {
          .hero-visual {
            height: 480px;
          }
        }

        @media (max-width: 768px) {
          .hero-visual {
            height: 420px;
            padding-top: 2.5rem;
          }
        }

        .features-section {
          background: radial-gradient(circle at top left, rgba(232, 227, 213, 0.6), transparent 55%), var(--soft-cream);
          border-top: 1px solid rgba(61, 52, 40, 0.04);
          border-bottom: 1px solid rgba(61, 52, 40, 0.03);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.75rem;
        }

        @media (max-width: 960px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .feature-card {
          background: rgba(245, 247, 244, 0.9);
          border-radius: 18px;
          padding: 1.5rem 1.45rem;
          border: 1px solid rgba(61, 52, 40, 0.08);
          box-shadow: 0 10px 26px rgba(61, 52, 40, 0.08);
          transition: transform var(--transition-normal),
            box-shadow var(--transition-normal),
            border-color var(--transition-normal);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-subtle);
          border-color: rgba(61, 52, 40, 0.16);
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 11px;
          background: rgba(122, 155, 118, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.9rem;
          font-size: 1.1rem;
        }

        .feature-title {
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--forest-green);
          margin-bottom: 0.4rem;
        }

        .feature-text {
          font-size: 0.9rem;
          color: var(--clay-brown);
          margin-bottom: 0.7rem;
        }

        .feature-meta {
          font-size: 0.76rem;
          color: var(--clay-brown);
          opacity: 0.9;
        }

        .workflow-shell {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 2.75rem;
          align-items: center;
        }

        @media (max-width: 960px) {
          .workflow-shell {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .workflow-steps {
          display: grid;
          gap: 1.4rem;
        }

        .workflow-step {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 1rem;
          align-items: flex-start;
        }

        .workflow-step-index {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: 1px solid rgba(61, 52, 40, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--forest-green);
          background: rgba(250, 248, 243, 0.95);
        }

        .workflow-step-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--forest-green);
          margin-bottom: 0.25rem;
        }

        .workflow-step-text {
          font-size: 0.9rem;
          color: var(--clay-brown);
        }

        .workflow-meta {
          margin-top: 1.5rem;
          font-size: 0.82rem;
          color: var(--clay-brown);
        }

        .workflow-panel {
          border-radius: 20px;
          padding: 1.6rem 1.7rem;
          background: linear-gradient(145deg, rgba(26, 47, 26, 0.98), rgba(45, 80, 22, 0.94));
          color: var(--mist-white);
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.38);
        }

        .workflow-panel-title {
          font-size: 0.95rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 0.35rem;
        }

        .workflow-panel-main {
          font-family: 'Crimson Pro', serif;
          font-size: 1.5rem;
          font-weight: 400;
          letter-spacing: -0.03em;
          margin-bottom: 1.1rem;
        }

        .workflow-panel-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
          font-size: 0.78rem;
        }

        .workflow-pill {
          padding: 0.6rem 0.7rem;
          border-radius: 12px;
          background: rgba(245, 247, 244, 0.04);
          border: 1px solid rgba(202, 231, 215, 0.32);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .workflow-pill span:first-child {
          opacity: 0.7;
          font-size: 0.72rem;
        }

        .workflow-pill span:last-child {
          font-weight: 600;
          color: var(--ai-cyan);
        }

        .workflow-panel-foot {
          margin-top: 1.1rem;
          font-size: 0.7rem;
          opacity: 0.75;
        }

        .trust-section {
          background: var(--mist-white);
          border-top: 1px solid rgba(61, 52, 40, 0.05);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 2.5rem;
          align-items: center;
        }

        @media (max-width: 960px) {
          .trust-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .trust-list {
          display: grid;
          gap: 1.1rem;
          font-size: 0.9rem;
          color: var(--clay-brown);
        }

        .trust-item {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 0.8rem;
          align-items: flex-start;
        }

        .trust-bullet {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 2px solid rgba(122, 155, 118, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          color: var(--forest-green);
        }

        .trust-metrics-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1.4rem;
          font-size: 0.8rem;
          color: var(--clay-brown);
          margin-top: 1.3rem;
        }

        .trust-metric {
          padding: 0.8rem 1rem;
          border-radius: 14px;
          background: rgba(250, 248, 243, 0.95);
          border: 1px solid rgba(61, 52, 40, 0.06);
          min-width: 150px;
        }

        .trust-metric strong {
          display: block;
          font-size: 1rem;
          color: var(--forest-green);
        }

        .cta-section {
          padding-bottom: 4.2rem;
        }

        .cta-panel {
          border-radius: 22px;
          padding: 2.6rem 2.4rem;
          background: radial-gradient(circle at top right, rgba(74, 155, 142, 0.14), transparent 55%), var(--deep-earth);
          color: var(--mist-white);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 2.4rem;
          align-items: center;
        }

        .cta-title {
          font-family: 'Crimson Pro', serif;
          font-size: 2rem;
          letter-spacing: -0.03em;
          margin-bottom: 0.6rem;
        }

        .cta-subtitle {
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .cta-right {
          display: flex;
          flex-direction: column;
          gap: 1.3rem;
        }

        .cta-bullets {
          font-size: 0.8rem;
          opacity: 0.87;
        }

        .cta-bullets li {
          margin-left: 1rem;
          margin-bottom: 0.3rem;
        }

        .cta-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem 1rem;
        }

        @media (max-width: 960px) {
          .cta-panel {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 768px) {
          .cta-panel {
            padding: 2.1rem 1.7rem;
          }
        }

        footer {
          border-top: 1px solid rgba(61, 52, 40, 0.05);
          padding: 1.5rem 0 2rem;
          font-size: 0.78rem;
          color: var(--clay-brown);
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .footer-links {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .footer-links a {
          text-decoration: none;
          color: inherit;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.45;
          }
        }

        @keyframes floatDiagonal {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(16px, -18px, 0);
          }
        }
      `}</style>

      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>

      <header className="nav-shell" id="top-nav">
        <div className="nav-inner">
          <Link to="/landing" className="nav-brand">
            <span className="nav-logo-mark" aria-hidden="true">🌱</span>
            <span className="nav-logo-text">
              <span className="nav-logo-main">KrishiBodh</span>
              <span className="nav-logo-sub">Cultivated Intelligence</span>
            </span>
          </Link>

          <nav aria-label="Primary">
            <ul className="nav-links">
              <li>
                <a
                  href="#platform"
                  className="nav-link"
                  onClick={(e) => handleAnchorClick(e, "#platform")}
                >
                  Platform
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="nav-link"
                  onClick={(e) => handleAnchorClick(e, "#features")}
                >
                  Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="nav-link"
                  onClick={(e) => handleAnchorClick(e, "#workflow")}
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#trust"
                  className="nav-link"
                  onClick={(e) => handleAnchorClick(e, "#trust")}
                >
                  Why KrishiBodh
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-cta-group">
            
            <Link to="/signup" className="btn btn-primary nav-primary">
              Sign in to your account
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="page-shell" style={{ paddingTop: "5.5rem" }}>
        <section id="platform" className="hero" aria-labelledby="hero-heading">
          <div className="hero-main">
            <div className="hero-badge">
              <span className="hero-badge-dot" aria-hidden="true"></span>
              <span>Calm AI for complex agricultural decisions</span>
            </div>

            <h1 id="hero-heading" className="hero-title">
              Turn scattered field data into
              <span> grounded decisions.</span>
            </h1>

            <p className="hero-subtitle">
              KrishiBodh quietly ingests weather, soil and market signals to
              surface what matters most—so agronomists, FPOs and farmers can move
              with clarity, not guesswork.
            </p>

            <div className="hero-cta-row">
              <Link to="/signup" className="btn btn-primary">
                Let's Dive in
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#workflow"
                className="btn btn-secondary"
                onClick={(e) => handleAnchorClick(e, "#workflow")}
              >
                See how KrishiBodh thinks
              </a>
            </div>

            <div className="hero-meta" aria-label="Highlights">
              <div className="hero-meta-pill">
                <span aria-hidden="true">●</span>
                <span>Field-tested with multi-season data</span>
              </div>
              <div className="hero-meta-pill">
                <span aria-hidden="true">∞</span>
                <span>From single farm to district-scale programs</span>
              </div>
            </div>
          </div>

          <aside
            className="hero-visual"
            aria-label="KrishiBodh intelligence overview"
          >
            <div className="float-shape float-1" aria-hidden="true"></div>
            <div className="float-shape float-2 alt" aria-hidden="true"></div>
            <div className="float-shape float-3" aria-hidden="true"></div>

            <div className="visual-frame">
              <div
                className="visual-layer-base"
                data-parallax-layer
                data-depth="0.35"
              >
                <div className="field-grid" aria-hidden="true"></div>

                <div
                  className="field-patch"
                  style={{ top: "18%", left: "12%" }}
                  data-parallax-layer
                  data-depth="0.7"
                >
                  <div className="field-tag">
                    <span className="signal-dot" aria-hidden="true"></span>
                    Kharif cluster • North
                  </div>
                  <strong>Moisture window open</strong>
                  <div className="field-metric">
                    <span>Next 4 days</span>
                    <span>+23% yield band</span>
                  </div>
                </div>

                <div
                  className="field-patch"
                  style={{ top: "52%", right: "10%" }}
                  data-parallax-layer
                  data-depth="0.9"
                >
                  <div className="field-tag">
                    <span className="signal-dot" aria-hidden="true"></span>
                    Pest pressure
                  </div>
                  <strong>Stem borer risk rising</strong>
                  <div className="field-metric">
                    <span>Priority</span>
                    <span>Target 17 villages</span>
                  </div>
                </div>

                <div
                  className="field-patch"
                  style={{ bottom: "12%", left: "26%" }}
                  data-parallax-layer
                  data-depth="0.8"
                >
                  <div className="field-tag">
                    <span className="signal-dot" aria-hidden="true"></span>
                    Market insight
                  </div>
                  <strong>Soybean vs Maize mix</strong>
                  <div className="field-metric">
                    <span>Margin delta</span>
                    <span>₹ 3,200 / acre</span>
                  </div>
                </div>

                <div
                  className="timeline-card"
                  data-parallax-layer
                  data-depth="1.1"
                >
                  <div className="timeline-header">
                    <span className="timeline-label">Today • Advisory stream</span>
                    <span className="timeline-pill">AI + Agronomist</span>
                  </div>
                  <div className="timeline-rows">
                    <div className="timeline-row">
                      <span>Water stress alerts</span>
                      <span>14 fields</span>
                    </div>
                    <div className="timeline-row">
                      <span>NPK imbalance</span>
                      <span>7 clusters</span>
                    </div>
                    <div className="timeline-row">
                      <span>Rain-safe spray window</span>
                      <span>3 hrs</span>
                    </div>
                  </div>
                  <p className="timeline-footnote">
                    KrishiBodh sorts, scores and routes insights before they reach
                    the farmer.
                  </p>
                </div>

                <div
                  className="signal-chip"
                  style={{ top: "8%", right: "18%" }}
                  data-parallax-layer
                  data-depth="0.6"
                >
                  <span className="signal-dot" aria-hidden="true"></span>
                  <span>Live soil probes connected</span>
                </div>

                <div
                  className="signal-chip"
                  style={{ bottom: "26%", left: "10%" }}
                  data-parallax-layer
                  data-depth="0.65"
                >
                  <span className="signal-dot" aria-hidden="true"></span>
                  <span>Satellite index refreshed · 3h ago</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section
          id="features"
          className="features-section"
          aria-labelledby="features-heading"
        >
          <div className="section-heading">
            <p className="section-kicker">Capabilities</p>
            <h2 id="features-heading" className="section-title">
              One calm surface for the moving parts of your season.
            </h2>
            <p className="section-subtitle">
              KrishiBodh weaves together agronomy, climate and market signals into
              a single, trustworthy layer of intelligence—grounded in Indian
              contexts, not generic global defaults.
            </p>
          </div>

          <div className="features-grid" aria-label="Platform capabilities">
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">📡</div>
              <h3 className="feature-title">Field-aware weather intelligence</h3>
              <p className="feature-text">
                Move beyond district-level forecasts. KrishiBodh blends IMD feeds
                with local observations to surface spray-safe windows, heat
                stress and water risk at the field cluster level.
              </p>
              <p className="feature-meta">
                Designed for extension teams planning advisories across thousands
                of hectares.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">🌾</div>
              <h3 className="feature-title">Seasonal crop planning guidance</h3>
              <p className="feature-text">
                Explore crop mix scenarios that factor in soil profiles, past
                performance and price bands, with clear language recommendations
                suitable for farmer meetings.
              </p>
              <p className="feature-meta">
                Output you can put straight into WhatsApp groups and village
                trainings.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">🪲</div>
              <h3 className="feature-title">Early pest and disease narratives</h3>
              <p className="feature-text">
                Combine forecasted humidity, crop stage and known outbreaks to
                tell a simple story: where to scout, what to look for, and when
                to act—without creating panic.
              </p>
              <p className="feature-meta">
                Aligned with standard IPM practices; no black-box prescriptions.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">💧</div>
              <h3 className="feature-title">Irrigation and input timing</h3>
              <p className="feature-text">
                When rainfall plays along, KrishiBodh lets you safely skip
                irrigations. When it doesn't, it flags critical windows for water
                and nutrition to protect yield potential.
              </p>
              <p className="feature-meta">
                Built for groundwater-constrained regions and canal schedules.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">📊</div>
              <h3 className="feature-title">Impact views for leadership</h3>
              <p className="feature-text">
                Quiet dashboards show adoption, risk exposure and outcome
                movement across your portfolio—without overwhelming charts or
                vanity metrics.
              </p>
              <p className="feature-meta">
                Export-ready summaries for funders, boards and government partners.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true">🤝</div>
              <h3 className="feature-title">Co-pilot for expert agronomists</h3>
              <p className="feature-text">
                KrishiBodh suggests, you decide. Every insight can be reviewed,
                edited and documented—creating a shared memory across seasons and
                teams.
              </p>
              <p className="feature-meta">
                Keeps the human in the loop, while handling the heavy pattern
                recognition.
              </p>
            </article>
          </div>
        </section>

        <section
          id="workflow"
          aria-labelledby="workflow-heading"
          style={{ scrollMarginTop: "5rem" }}
        >
          <div className="workflow-shell">
            <div>
              <div className="section-heading">
                <p className="section-kicker">How KrishiBodh works</p>
                <h2 id="workflow-heading" className="section-title">
                  From scattered data to a single, steady advisory voice.
                </h2>
              </div>

              <div className="workflow-steps" aria-label="Workflow steps">
                <div className="workflow-step">
                  <div className="workflow-step-index">01</div>
                  <div>
                    <p className="workflow-step-title">Listen to the whole landscape</p>
                    <p className="workflow-step-text">
                      KrishiBodh ingests weather feeds, soil tests, crop records
                      and basic field boundaries. No expensive hardware is
                      required—existing data is enough to begin.
                    </p>
                  </div>
                </div>

                <div className="workflow-step">
                  <div className="workflow-step-index">02</div>
                  <div>
                    <p className="workflow-step-title">
                      Build field clusters that behave alike
                    </p>
                    <p className="workflow-step-text">
                      Instead of treating every plot separately, the platform
                      groups fields with similar conditions, allowing advisors to
                      act at scale while staying context-aware.
                    </p>
                  </div>
                </div>

                <div className="workflow-step">
                  <div className="workflow-step-index">03</div>
                  <div>
                    <p className="workflow-step-title">
                      Surface only the decisions that matter
                    </p>
                    <p className="workflow-step-text">
                      Each day, KrishiBodh generates a small queue of
                      human-readable nudges: which cluster to call, what action to
                      suggest, and why the timing matters now.
                    </p>
                  </div>
                </div>

                <div className="workflow-step">
                  <div className="workflow-step-index">04</div>
                  <div>
                    <p className="workflow-step-title">
                      Learn quietly from every outcome
                    </p>
                    <p className="workflow-step-text">
                      Over seasons, the system observes which advisories were
                      adopted and what yields followed, refining its priors
                      without overwriting local wisdom.
                    </p>
                  </div>
                </div>
              </div>

              <p className="workflow-meta">
                <strong>Architecture note:</strong> KrishiBodh is designed as a
                layered decision system—data ingestion, clustering, insight
                generation and storytelling are separated so each can evolve
                without disrupting the others.
              </p>
            </div>

            <aside className="workflow-panel" aria-label="Example system snapshot">
              <p className="workflow-panel-title">Tonight's snapshot</p>
              <p className="workflow-panel-main">
                "If we act on these 29 villages, we protect most of next
                fortnight's yield risk."
              </p>

              <div className="workflow-panel-grid">
                <div className="workflow-pill">
                  <span>Fields in watchlist</span>
                  <span>384 across 3 districts</span>
                </div>
                <div className="workflow-pill">
                  <span>High-risk pest clusters</span>
                  <span>11 (stem borer, pod borer)</span>
                </div>
                <div className="workflow-pill">
                  <span>Rain-safe spray windows</span>
                  <span>2.8 hrs avg.</span>
                </div>
                <div className="workflow-pill">
                  <span>Advisories validated</span>
                  <span>87% with agronomists</span>
                </div>
              </div>

              <p className="workflow-panel-foot">
                The experience is intentional: a quiet, narrative summary first;
                metrics only where they anchor trust—never to overwhelm.
              </p>
            </aside>
          </div>
        </section>

        <section
          id="trust"
          className="trust-section"
          aria-labelledby="trust-heading"
          style={{ scrollMarginTop: "5rem" }}
        >
          <div className="trust-grid">
            <div>
              <div className="section-heading">
                <p className="section-kicker">Why trust KrishiBodh</p>
                <h2 id="trust-heading" className="section-title">
                  Built for Indian fields, not generic training data.
                </h2>
                <p className="section-subtitle">
                  The system is intentionally conservative with its language and
                  transparent with its assumptions—anchored in publicly available
                  datasets and field trials, not opaque "magic".
                </p>
              </div>

              <dl className="trust-list">
                <div className="trust-item">
                  <div className="trust-bullet" aria-hidden="true">✓</div>
                  <div>
                    <dt>Aligned with agronomy, not just algorithms.</dt>
                    <dd>
                      Every model output is paired with agronomist-reviewed
                      ranges, so advisors can confidently discuss "why" with
                      farmers.
                    </dd>
                  </div>
                </div>

                <div className="trust-item">
                  <div className="trust-bullet" aria-hidden="true">✓</div>
                  <div>
                    <dt>Transparent assumptions, visible to your team.</dt>
                    <dd>
                      Moisture thresholds, pest pressure levels and economic
                      break-even points are editable and documented—not hidden in
                      a model card you never see.
                    </dd>
                  </div>
                </div>

                <div className="trust-item">
                  <div className="trust-bullet" aria-hidden="true">✓</div>
                  <div>
                    <dt>Designed for low-friction rollouts.</dt>
                    <dd>
                      Works with simple smartphone access and existing WhatsApp
                      groups; heavy compute happens in the background, not on
                      farmer devices.
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <aside aria-label="Indicative impact metrics">
              <div className="trust-metrics-row">
                <div className="trust-metric">
                  <strong>2–4 qtl/acre</strong>
                  <span>yield band protected in pilot seasons, even in volatile rainfall years.</span>
                </div>
                <div className="trust-metric">
                  <strong>30–40%</strong>
                  <span>reduction in "urgent" calls for extension teams, replaced with calmer planning.</span>
                </div>
                <div className="trust-metric">
                  <strong>&lt; 6 weeks</strong>
                  <span>from first data sync to meaningful, localized advisories.</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        
      </main>

      <footer aria-label="Site footer">
        <div className="page-shell footer-inner">
          <p>
            © {new Date().getFullYear()} KrishiBodh. Crafted with care for the people who grow our food.
          </p>
          <div className="footer-links">
            <a
              href="#workflow"
              onClick={(e) => handleAnchorClick(e, "#workflow")}
            >
              How it works
            </a>
            <a
              href="#trust"
              onClick={(e) => handleAnchorClick(e, "#trust")}
            >
              Trust & ethics
            </a>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
