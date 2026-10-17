import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  FileCheck2,
  FilePenLine,
  ScrollText,
  Award,
  Compass,
  ArrowRight,
  X,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { getSubscriptionStatus, dismissWelcomeModal } from "../../services/subscriptionService";

// Full-screen high-performance confetti canvas for the party popper burst
function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#10B981", "#34D399", "#059669", "#6EE7B7", // Emeralds & Greens
      "#F59E0B", "#FBBF24", "#EAB308",             // Champagne & Golds
      "#06B6D4", "#38BDF8",                         // Cyan & Sky
      "#F43F5E", "#FB7185",                         // Coral & Rose
      "#8B5CF6", "#A78BFA"                          // Violet
    ];

    const particles = [];

    const createBurst = (originX, originY, count = 75) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 7 + Math.random() * 18;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5, // upward boost
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 16,
          opacity: 1,
          shape: Math.random() > 0.45 ? "rect" : (Math.random() > 0.4 ? "circle" : "star"),
          decay: 0.009 + Math.random() * 0.013,
        });
      }
    };

    // Wave 1: Immediate central burst
    createBurst(width / 2, height / 2, 90);

    // Wave 2: Left & right party poppers firing inward 200ms later
    const timer2 = setTimeout(() => {
      createBurst(width * 0.2, height * 0.65, 55);
      createBurst(width * 0.8, height * 0.65, 55);
    }, 200);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38; // gravity
        p.vx *= 0.96; // air drag
        p.vy *= 0.96;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 4-point sparkle star
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            ctx.rotate(Math.PI / 4);
            ctx.rect(-p.size / 6, -p.size / 2, p.size / 3, p.size);
          }
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100000] h-full w-full"
    />
  );
}

export default function WelcomeTokensModal() {
  const { user, isLoaded } = useUser();
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    if (hasTriggeredRef.current) return;

    let isMounted = true;

    getSubscriptionStatus(user.id, true).then((subData) => {
      if (!isMounted) return;
      if (subData && subData.hasSeenWelcomeModal === false && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        // Step 1: Start 2s celebration with party poppers and green text only
        setIsCelebrating(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isLoaded, user?.id]);

  // Transition from celebration to welcome modal after 2 seconds
  useEffect(() => {
    if (!isCelebrating) return;

    const timer = setTimeout(() => {
      setIsCelebrating(false);
      setIsModalOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isCelebrating]);

  // Allow clicking anywhere during celebration to immediately view the modal
  const handleSkipCelebration = () => {
    setIsCelebrating(false);
    setIsModalOpen(true);
  };

  const handleDismiss = async () => {
    if (dismissing) return;
    setDismissing(true);
    setIsModalOpen(false);
    if (user?.id) {
      await dismissWelcomeModal(user.id);
    }
    setDismissing(false);
  };

  const handleExploreSuite = async () => {
    handleDismiss();
    window.open("https://careersenseai.com/#career-tools", "_blank", "noopener,noreferrer");
  };

  if (!isCelebrating && !isModalOpen) return null;

  const careerTools = [
    {
      name: "AI Resume Builder",
      desc: "Architect ATS-ready, executive resumes with dynamic AI styling.",
      icon: FilePenLine,
      isCurrent: true,
      tag: "You are here",
    },
    {
      name: "ATS Score Checker",
      url: "https://ats.careersenseai.com/",
      desc: "Test your resume against real recruiter ATS screening filters.",
      icon: FileCheck2,
      tag: "Career Tool",
    },
    {
      name: "Cover Letter Builder",
      url: "https://coverletter.careersenseai.com/",
      desc: "Generate persuasive, role-tailored application letters in seconds.",
      icon: ScrollText,
      tag: "Career Tool",
    },
    {
      name: "Certifi (Skill Validation)",
      url: "https://certifi.careersenseai.com/",
      desc: "Take domain skill assessments & earn verified resume badges.",
      icon: Award,
      tag: "Career Tool",
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* STAGE 1: CONFETTI POPPER & PURE GREEN TEXT (NO POPUP CARD) */}
        {/* ========================================================= */}
        {isCelebrating && (
          <div
            key="celebration-screen"
            onClick={handleSkipCelebration}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 cursor-pointer select-none"
          >
            {/* Confetti Particle Streamers */}
            <ConfettiCanvas />

            {/* ONLY this text coming out from the centre of the screen */}
            <motion.h1
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 20,
                mass: 0.8
              }}
              className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#10B981] drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)] filter drop-shadow-[0_0_35px_rgba(16,185,129,0.75)] text-center px-4"
            >
              Free 30,000 AI Tokens
            </motion.h1>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: WELCOME POPUP MODAL (TRANSITIONS IN AFTER POPPER) */}
        {/* ========================================================= */}
        {isModalOpen && (
          <div key="welcome-dialog-screen" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Editorial Obsidian Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-[#071426]/80 backdrop-blur-md"
              onClick={handleDismiss}
              aria-hidden="true"
            />

            {/* Modal Dialog Card in Executive Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#FFFFFF] border border-[#B9964A]/30 p-6 sm:p-8 shadow-2xl transition-all my-auto text-[#071426]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="welcome-modal-title"
            >
              {/* Subtle Gold Aura */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#B9964A]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#123B6D]/10 blur-3xl" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F8FA] text-slate-500 hover:bg-[#E1E7EF] hover:text-[#071426] transition"
                aria-label="Close welcome modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Top Badge & Header */}
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#071426] px-3.5 py-1 text-xs font-bold text-[#B9964A] shadow-xs border border-[#B9964A]/30">
                  <Zap className="h-3.5 w-3.5 fill-[#B9964A] text-[#B9964A] animate-pulse" />
                  <span className="tracking-wide">UNIVERSAL AI ACCESS PASS</span>
                  <span className="h-1 w-1 rounded-full bg-[#B9964A]" />
                  <span className="text-white">30,000 FREE TOKENS</span>
                </div>

                <h2
                  id="welcome-modal-title"
                  className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-[#071426]"
                >
                  Welcome to CareerSense AI!
                </h2>

                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  You’ve unlocked <strong className="text-[#071426] font-bold">30,000 Universal AI Tokens</strong>. They work automatically across all <strong className="text-[#071426] font-bold">4 Career Tools</strong> in our career ecosystem:
                </p>
              </div>

              {/* 4 Career Tools Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {careerTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.name}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${tool.isCurrent
                          ? "bg-gradient-to-br from-[#071426] to-[#0B1F3A] text-white border-[#B9964A]/40 shadow-md"
                          : "bg-[#F7F8FA] hover:bg-[#F2F6FB] border-[#E1E7EF] hover:border-[#B9964A]/50 text-[#071426]"
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${tool.isCurrent
                                ? "bg-[#B9964A]/20 text-[#B9964A]"
                                : "bg-[#071426]/5 text-[#071426]"
                              }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${tool.isCurrent
                                ? "bg-[#B9964A] text-[#071426]"
                                : "bg-[#E1E7EF] text-slate-700"
                              }`}
                          >
                            {tool.tag}
                          </span>
                        </div>

                        <h3
                          className={`mt-2.5 text-sm font-bold tracking-tight ${tool.isCurrent ? "text-white" : "text-[#071426]"
                            }`}
                        >
                          {tool.name}
                        </h3>

                        <p
                          className={`mt-1 text-xs leading-normal ${tool.isCurrent ? "text-slate-300" : "text-slate-600"
                            }`}
                        >
                          {tool.desc}
                        </p>
                      </div>

                      {tool.isCurrent ? (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#B9964A]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active Workspace</span>
                        </div>
                      ) : (
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#123B6D] hover:text-[#071426] hover:underline transition"
                        >
                          <span>Open Tool</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Free Career GPS Highlight Banner */}
              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                  <Compass className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#071426]">Career GPS (Roadmap & Career Score)</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[9px] px-1.5 py-0.2 uppercase tracking-wide">
                      100% Free
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Navigate salary bands, promotions, and skill gaps on CareerSense without using tokens.
                  </p>
                </div>
                <a
                  href="https://careersenseai.com/career-gps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-extrabold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              {/* Action Controls */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleExploreSuite}
                  className="w-full sm:w-auto text-xs font-bold text-[#123B6D] hover:text-[#071426] transition py-2 px-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1"
                >
                  <span>Explore All Platform Tools</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#071426] px-6 py-2.5 text-xs font-extrabold text-[#B9964A] border border-[#B9964A]/40 shadow-lg shadow-[#071426]/20 hover:bg-[#123B6D] hover:text-white transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Building Resume</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
