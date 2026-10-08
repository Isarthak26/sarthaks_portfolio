/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'motion/react';
import { useState, useEffect, useRef, FormEvent, type ReactNode } from 'react';
import { 
  Cloud, 
  Container, 
  GitBranch, 
  Server, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Globe, 
  Mail, 
  Linkedin, 
  Instagram, 
  Github, 
  ArrowRight, 
  Menu, 
  X, 
  ExternalLink, 
  BookOpen, 
  Compass, 
  Lightbulb, 
  Users, 
  Sparkles, 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  GraduationCap, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  NAV_LINKS, 
  SKILLS, 
  PROJECTS, 
  STATS, 
  SOCIAL_LINKS, 
  TECH_STACK, 
  TechItem,
  WORK_PHILOSOPHY, 
  BEYOND_CODE, 
  ProjectItem, 
  RESUME_URL 
} from './data/constants';

const EASING_EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  key?: string | number;
  className?: string;
  delay?: number;
  staggerIndex?: number;
  yOffset?: number;
}

function Reveal({
  children,
  className = '',
  delay = 0,
  staggerIndex = 0,
  yOffset = 16,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const cappedIndex = Math.min(6, Math.max(0, staggerIndex));
  const totalDelay = delay + cappedIndex * 0.07; // 70ms stagger

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
      transition={{
        duration: 0.5,
        delay: totalDelay,
        ease: EASING_EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CONTACT_CHANNELS = [
  {
    name: 'GitHub',
    href: 'https://github.com/Isarthak26',
    icon: Github,
    ariaLabel: 'GitHub profile',
    tooltip: 'GitHub profile'
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sarthak-bordia-3b9b891a0/',
    icon: Linkedin,
    ariaLabel: 'LinkedIn profile',
    tooltip: 'LinkedIn profile'
  }
];

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [resumeViewMode, setResumeViewMode] = useState<'document' | 'pdf'>('document');

  // Parallax motion values for desktop photo (subtle +/-7px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const photoParallaxX = useSpring(mouseX, { damping: 25, stiffness: 120 });
  const photoParallaxY = useSpring(mouseY, { damping: 25, stiffness: 120 });

  // Contact Form State & Validation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: ''
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formAnnouncement, setFormAnnouncement] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Core Technologies Interactive State
  const [activeTechId, setActiveTechId] = useState<string | null>(null);
  const [popoverState, setPopoverState] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    placeAbove: boolean;
    arrowLeft: number;
  } | null>(null);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const techSectionRef = useRef<HTMLElement>(null);
  const logoButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Popover Position on Desktop
  useEffect(() => {
    if (!activeTechId || isMobileScreen) {
      setPopoverState(null);
      return;
    }

    const updatePosition = () => {
      const btn = logoButtonRefs.current[activeTechId];
      if (!btn) return;

      const btnRect = btn.getBoundingClientRect();
      const cardWidth = Math.min(320, window.innerWidth - 32);
      const btnCenterX = btnRect.left + btnRect.width / 2;

      let cardLeft = btnCenterX - cardWidth / 2;
      const minLeft = 16;
      const maxLeft = window.innerWidth - cardWidth - 16;
      cardLeft = Math.max(minLeft, Math.min(maxLeft, cardLeft));

      const arrowLeft = Math.max(20, Math.min(cardWidth - 20, btnCenterX - cardLeft));

      // Calculate vertical space: if >= 220px above, place above; else place below
      const spaceAbove = btnRect.top;
      const placeAbove = spaceAbove >= 220;

      if (placeAbove) {
        setPopoverState({
          left: cardLeft,
          bottom: window.innerHeight - btnRect.top + 10,
          placeAbove: true,
          arrowLeft,
        });
      } else {
        setPopoverState({
          left: cardLeft,
          top: btnRect.bottom + 10,
          placeAbove: false,
          arrowLeft,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [activeTechId, isMobileScreen]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!activeTechId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const id = activeTechId;
        setActiveTechId(null);
        logoButtonRefs.current[id]?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const activeBtn = logoButtonRefs.current[activeTechId];
      if (activeBtn && activeBtn.contains(target)) return;

      const desktopCard = document.getElementById(`tech-card-desktop-${activeTechId}`);
      if (desktopCard && desktopCard.contains(target)) return;

      const mobileCard = document.getElementById(`tech-card-mobile-${activeTechId}`);
      if (mobileCard && mobileCard.contains(target)) return;

      setActiveTechId(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeTechId]);

  const handleLogoClick = (techId: string) => {
    setActiveTechId((prev) => (prev === techId ? null : techId));
  };

  useEffect(() => {
    let ticking = false;
    const updateScrollMetrics = () => {
      setScrolled(window.scrollY > 40);

      // Scroll Progress (0 to 1)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));

      // Bottom-of-page check: prioritize Contact when near/at the end of page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActiveSection('contact');
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollMetrics);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollMetrics();

    // Scroll-Spy IntersectionObserver
    const sectionIds = ['home', 'about', 'projects', 'skills', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        // Only update if not scrolled all the way to bottom
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
          setActiveSection('contact');
          return;
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0.1
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  // Subtle desktop photo mouse parallax (desktop only, disabled when reduced motion requested)
  useEffect(() => {
    if (shouldReduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; // desktop only
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) / (centerX || 1);
      const deltaY = (e.clientY - centerY) / (centerY || 1);
      mouseX.set(deltaX * 7); // +/-7px subtle shift
      mouseY.set(deltaY * 7);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion, mouseX, mouseY]);

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('sarthakbordia10@gmail.com');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const validateForm = () => {
    const errors: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter your name.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) {
      errors.message = 'Please enter a message.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormStatus('sending');
    setFormAnnouncement('Sending your message…');
    setFormErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          website: formData.website
        })
      });

      if (res.ok) {
        setFormStatus('success');
        setFormAnnouncement("Thanks! I'll reply soon.");
        setFormData({ name: '', email: '', message: '', website: '' });
        setFormErrors({});
        setFormErrorMessage('');
      } else {
        const data = await res.json().catch(() => ({}));
        let msg = data.error;
        if (res.status === 404) {
          msg = 'Backend endpoint /api/contact not found. If on Vercel, please make sure the latest deployment is active (do not roll back to an older commit without api/contact.js).';
        }
        setFormErrorMessage(msg || 'Could not send. Please verify server settings or try again.');
        setFormStatus('error');
        setFormAnnouncement(msg || 'Something went wrong.');
      }
    } catch {
      // In preview environments or network failures, deliver graceful fallback with retry option
      const networkMsg = 'Could not reach /api/contact. If deployed on Vercel, make sure the latest deployment is live and not rolled back.';
      setFormErrorMessage(networkMsg);
      setFormStatus('error');
      setFormAnnouncement('Something went wrong. Please try again.');
    }
  };

  const activeTech = TECH_STACK.find((t) => t.id === activeTechId);

  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASING_EASE_OUT_EXPO }}
      className="min-h-screen text-[#1A1A1A] font-sans selection:bg-[#6366F1] selection:text-white overflow-x-hidden relative"
    >
      {/* Scroll Progress Bar (3px, indigo gradient) */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#4F46E5] pointer-events-none origin-left no-print"
        style={{
          transform: `scaleX(${scrollProgress})`,
          transformOrigin: 'left',
          willChange: 'transform'
        }}
        aria-hidden="true"
      />

      {/* Background Gradient */}
      <div 
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{
          background: '#e3eeff',
          backgroundImage: 'linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)'
        }}
      />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-[12px] border-b border-gray-200/60 shadow-xs py-2.5 md:py-3.5' 
            : 'bg-transparent border-b border-transparent py-4 md:py-5 shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-bold tracking-tight text-[#6366F1]"
          >
            Sarthak<span className="text-[#1A1A1A]">.</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link, idx) => {
              const targetId = link.href.replace('#', '');
              const isActive = activeSection === targetId;
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`text-sm transition-colors relative py-1.5 px-0.5 ${
                    isActive 
                      ? 'text-gray-900 font-semibold' 
                      : 'text-gray-600 hover:text-[#6366F1] font-medium'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(targetId);
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.a>
              );
            })}
            <div className="flex items-center gap-5 pl-2 border-l border-gray-200/80">
              <motion.button
                onClick={() => setIsResumeOpen(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-gray-600 hover:text-[#6366F1] transition-colors cursor-pointer"
              >
                Resume
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setActiveSection('contact');
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#6366F1] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#4F46E5] transition-all shadow-md shadow-[#6366F1]/20 active:scale-95 cursor-pointer"
              >
                Let's Talk
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md border-b overflow-hidden shadow-lg"
            >
              <div className="flex flex-col p-6 gap-4">
                {NAV_LINKS.map((link) => {
                  const targetId = link.href.replace('#', '');
                  const isActive = activeSection === targetId;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        setActiveSection(targetId);
                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`text-lg font-medium transition-colors ${isActive ? 'text-[#6366F1] font-bold' : 'text-gray-700 hover:text-[#6366F1]'}`}
                    >
                      {link.name}
                    </a>
                  );
                })}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsResumeOpen(true);
                    }}
                    className="text-center text-gray-700 hover:text-[#6366F1] py-2 font-medium text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText size={16} /> Resume
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveSection('contact');
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#6366F1] text-white py-2.5 rounded-full text-sm font-semibold shadow-md active:scale-95 cursor-pointer"
                  >
                    Let's Talk
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-[80px] md:pt-24 pb-8 md:pb-12 px-5 md:px-6 max-w-7xl mx-auto min-h-0 md:min-h-[calc(100vh-4.5rem)] flex flex-col justify-center">
        {/* ========================================================= */}
        {/* MOBILE HERO (under 768px: left-aligned product layout)     */}
        {/* ========================================================= */}
        <div className="md:hidden flex flex-col text-left w-full">
          {/* 1. Identity row: 64px avatar + name & role */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASING_EASE_OUT_EXPO }}
            className="flex items-center gap-3.5 mb-3.5"
          >
            <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-md shadow-[#6366F1]/15 bg-gray-100">
              <img
                src="/assets/images/photo.png"
                alt="Sarthak Bordia"
                className="w-full h-full object-cover object-[center_top]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight">
                Sarthak Bordia
              </h2>
              <p className="text-[14px] text-[#6366F1] font-semibold mt-0.5">
                CS Undergrad · DevOps
              </p>
            </div>
          </motion.div>

          {/* 2. Availability pill below it */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.13, ease: EASING_EASE_OUT_EXPO }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[12px] sm:text-[13px] font-semibold mb-3.5 max-w-full shadow-2xs self-start"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="whitespace-nowrap truncate">Open to internships · India &amp; Remote</span>
          </motion.div>

          {/* 3. Headline, left-aligned */}
          <motion.h1
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.21, ease: EASING_EASE_OUT_EXPO }}
            className="text-[clamp(2rem,9vw,2.5rem)] font-extrabold tracking-tight leading-[1.1] text-gray-900 mb-3 [text-wrap:balance]"
          >
            I build &amp; automate{' '}
            <span className="bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#4F46E5] bg-clip-text text-transparent">
              cloud infrastructure
            </span>
          </motion.h1>

          {/* 4. Bio, left-aligned, max 2 to 3 lines on mobile */}
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.29, ease: EASING_EASE_OUT_EXPO }}
            className="text-base leading-[1.6] mb-5 font-normal [text-wrap:pretty]"
            style={{ color: '#374151' }}
          >
            Docker, Kubernetes, Azure and Terraform. I ship GitOps pipelines and observable microservices.
          </motion.p>

          {/* 5. CTAs: two full-width stacked buttons (52px tall) */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.37, ease: EASING_EASE_OUT_EXPO }}
            className="flex flex-col gap-2.5 w-full mb-3.5"
          >
            <button
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full h-[52px] bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/25 active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
            >
              Explore My Work <ArrowRight size={18} />
            </button>

            <a
              href={RESUME_URL}
              download="Sarthak_Bordia_Resume.pdf"
              className="w-full h-[52px] bg-white text-gray-800 border-2 border-gray-200 hover:border-[#6366F1] hover:text-[#6366F1] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
            >
              <Download size={18} /> Download Resume
            </a>
          </motion.div>

          {/* 6. Social row under buttons (LinkedIn & GitHub 44px, no Instagram) */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: EASING_EASE_OUT_EXPO }}
            className="flex items-center gap-2.5 mb-4"
          >
            <a
              href="https://www.linkedin.com/in/sarthak-bordia-3b9b891a0/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white border border-[#6366F1]/30 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              title="LinkedIn Profile"
              aria-label="LinkedIn profile"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://github.com/Isarthak26"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-white border border-[#6366F1]/30 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              title="GitHub Profile"
              aria-label="GitHub profile"
            >
              <Github size={18} />
            </a>
          </motion.div>

          {/* 7. Horizontally scrollable row of tech chips */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.53, ease: EASING_EASE_OUT_EXPO }}
            className="relative w-full max-w-full overflow-hidden"
          >
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#e3eeff]/95 to-transparent z-10" />
            <div className="flex items-center gap-1.5 overflow-x-auto snap-x snap-proximity py-1 pr-8 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mr-1 shrink-0">
                Stack:
              </span>
              {['Docker', 'Kubernetes', 'Azure', 'Terraform', 'Prometheus', 'ArgoCD', 'Jenkins', 'Python'].map((tech) => (
                <span
                  key={tech}
                  className="snap-start shrink-0 px-2.5 py-1 rounded-full bg-white/85 text-gray-700 border border-gray-200 text-xs font-medium shadow-2xs whitespace-nowrap"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP HERO (768px and up: unchanged original layout)     */}
        {/* ========================================================= */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Content on Desktop */}
          <div className="text-left">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-3 shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Open to DevOps / SRE / Backend internships · India &amp; Remote</span>
            </motion.div>

            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: EASING_EASE_OUT_EXPO }}
              className="text-[#6366F1] font-bold tracking-wider uppercase text-sm mb-3 block"
            >
              SARTHAK BORDIA · CS UNDERGRAD · DEVOPS
            </motion.p>

            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: EASING_EASE_OUT_EXPO }}
              className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-4 text-gray-900"
            >
              I build &amp; automate <br />
              <span className="bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#4F46E5] bg-clip-text text-transparent">
                cloud infrastructure
              </span>
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.33, ease: EASING_EASE_OUT_EXPO }}
              className="text-lg mb-6 max-w-xl leading-relaxed font-normal [text-wrap:balance]"
              style={{ color: '#374151' }}
            >
              Specializing in automated cloud delivery and container orchestration using Docker, Kubernetes (AKS), Azure, Terraform, and Prometheus. Recently deployed production-grade GitOps microservices on Azure with automated CI/CD pipelines and real-time observability.
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: EASING_EASE_OUT_EXPO }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#6366F1] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#4F46E5] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/25 active:scale-95 cursor-pointer min-h-[44px]"
              >
                Explore My Work <ArrowRight size={17} />
              </motion.button>

              <motion.a 
                href={RESUME_URL}
                download="Sarthak_Bordia_Resume.pdf"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-gray-800 border-2 border-gray-200 hover:border-[#6366F1] hover:text-[#6366F1] px-5 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer min-h-[44px]"
              >
                <Download size={17} /> Download Resume
              </motion.a>

              <div className="flex items-center gap-2">
                <motion.a 
                  href="https://www.linkedin.com/in/sarthak-bordia-3b9b891a0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  className="w-11 h-11 rounded-full bg-white border border-[#6366F1]/30 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin size={18} />
                </motion.a>
                <motion.a 
                  href="https://github.com/Isarthak26"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  className="w-11 h-11 rounded-full bg-white border border-[#6366F1]/30 hover:border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
                  title="GitHub Profile"
                  aria-label="GitHub profile"
                >
                  <Github size={18} />
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.51, ease: EASING_EASE_OUT_EXPO }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mr-1">
                Core Stack:
              </span>
              {['Docker', 'Kubernetes', 'Azure', 'Terraform', 'Prometheus', 'Python'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-[#6366F1] border border-gray-200/80 text-xs font-medium transition-colors shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Desktop Photo on Right with slow float and mouse parallax */}
          <div className="flex justify-center">
            <motion.div
              style={shouldReduceMotion ? {} : { x: photoParallaxX, y: photoParallaxY }}
              className="relative max-w-[380px] w-full"
            >
              <div className="absolute -inset-6 bg-[#6366F1]/20 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] blur-2xl -z-10 animate-pulse" />

              <motion.div 
                animate={shouldReduceMotion ? {} : { y: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                whileHover={{ scale: 1.03, rotate: -1 }}
                className="w-full aspect-square relative z-10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#6366F1]/10 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] animate-morph" />
                <img 
                  src="/assets/images/photo.png" 
                  alt="Sarthak Bordia" 
                  className="w-full h-full object-cover object-[center_top] rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] shadow-2xl relative z-10 border-8 border-white/60 backdrop-blur-sm"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <motion.a
                href="https://www.instagram.com/sarthak.bordia/"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                whileHover={{ scale: 1.14, rotate: 8, y: -3 }}
                whileTap={{ scale: 0.92 }}
                className="absolute -top-3 right-6 z-20 w-14 h-14 rounded-full bg-white/95 hover:bg-white backdrop-blur-md border-2 border-white ring-2 ring-gray-200/70 hover:ring-pink-300 shadow-xl shadow-gray-900/15 flex items-center justify-center text-[#E1306C] hover:text-[#D62976] group transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                title="Follow Sarthak on Instagram (@sarthak.bordia)"
                aria-label="Instagram profile"
              >
                <Instagram size={24} className="transition-transform group-hover:scale-110" />
              </motion.a>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-10 md:mt-24 pt-6 md:pt-12 border-t border-gray-100">
          {STATS.map((stat, idx) => (
            <Reveal
              key={stat.label}
              staggerIndex={idx}
              className="text-center p-2"
            >
              <h3 className="text-2xl md:text-4xl font-bold text-[#6366F1] mb-1 md:mb-2">{stat.value}</h3>
              <p className="text-[10px] md:text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="pt-16 md:pt-20 pb-16 md:pb-24 bg-white/40 backdrop-blur-sm w-full max-w-full overflow-x-clip box-border">
        <div className="w-full max-w-7xl mx-auto px-5 md:px-6 min-w-0 box-border">
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-start mb-16 w-full min-w-0">
            {/* Photo Column - static on mobile, sticky on desktop, full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="order-1 md:order-1 md:sticky md:top-24 w-full max-w-full md:max-w-none mx-auto min-w-0"
            >
              <div className="aspect-[4/5] md:aspect-square w-full max-w-full rounded-3xl overflow-hidden shadow-xl relative border border-gray-100/90 bg-gray-100">
                <img 
                  src="/assets/images/2.jpeg" 
                  alt="Sarthak Bordia" 
                  className="w-full h-full object-cover object-[center_20%]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Inset Badge: Open to internships with green pulsing dot - 16px inset, fits within photo width */}
                <div className="absolute bottom-4 left-4 z-20 max-w-[calc(100%-32px)] bg-white/95 backdrop-blur-md border border-gray-200/90 px-3 sm:px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2 overflow-hidden">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate">
                    Open to internships · India &amp; Remote
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Text Column - order-2 */}
            <div className="order-2 md:order-2 text-left w-full max-w-full min-w-0">
              {/* Eyebrow Label */}
              <motion.span
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0, ease: EASING_EASE_OUT_EXPO }}
                className="text-[#6366F1] font-bold tracking-wider uppercase text-xs md:text-sm mb-2 block min-w-0"
              >
                ABOUT ME
              </motion.span>

              {/* Headline */}
              <motion.h2
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
                className="text-[clamp(1.75rem,7vw,2.25rem)] md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 md:mb-5 leading-tight [text-wrap:balance] break-words [overflow-wrap:anywhere] min-w-0 max-w-full"
              >
                Driven by how systems scale, engineered from the ground up.
              </motion.h2>

              {/* Bio Paragraphs */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.16, ease: EASING_EASE_OUT_EXPO }}
                className="space-y-3.5 text-sm md:text-base leading-relaxed mb-4 [text-wrap:pretty] break-words [overflow-wrap:anywhere] min-w-0 max-w-full"
                style={{ color: '#374151' }}
              >
                <p>
                  While many first enter software through user interfaces, I was drawn to what happens underneath: how servers communicate, how distributed systems handle failure, and how automated pipelines transform chaotic manual releases into predictable deployments.
                </p>
                <p>
                  I engineer resilient cloud infrastructure and microservices with Docker, Kubernetes (AKS), Terraform, Azure, AWS, and Prometheus. Recently, I deployed an end-to-end GitOps pipeline on Azure with ArgoCD, achieving automated container security scans and zero-downtime rolling releases.
                </p>
              </motion.div>

              {/* One-line "How I work" statement */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.24, ease: EASING_EASE_OUT_EXPO }}
                className="p-3.5 sm:p-4 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/15 mb-4 w-full max-w-full min-w-0"
              >
                <p className="text-xs md:text-sm font-medium text-gray-800 leading-relaxed break-words [overflow-wrap:anywhere]">
                  <span className="text-[#6366F1] font-bold uppercase tracking-wider text-[11px] mr-1.5 inline-block">
                    How I work:
                  </span>
                  Clarity in system design, humility in code reviews, and end-to-end ownership of what I ship.
                </p>
              </motion.div>

              {/* Tech Badges Row under Bio */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.32, ease: EASING_EASE_OUT_EXPO }}
                className="flex flex-wrap items-center gap-2 mb-6 w-full max-w-full min-w-0"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mr-1 shrink-0">
                  Key Tooling:
                </span>
                {['Docker', 'Kubernetes', 'Terraform', 'Azure', 'AWS', 'Prometheus', 'ArgoCD', 'CI/CD'].map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-full bg-white text-gray-700 hover:text-[#6366F1] border border-gray-200/90 text-xs font-medium shadow-2xs transition-colors shrink-0"
                  >
                    {tool}
                  </span>
                ))}
              </motion.div>

              {/* Education & Certifications Cards - Semantic <ul> full width, no clipping, text wraps */}
              <motion.ul
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.40, ease: EASING_EASE_OUT_EXPO }}
                className="space-y-3 md:space-y-3.5 mb-8 w-full max-w-full min-w-0 list-none p-0"
              >
                <li className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-gray-200/80 shadow-xs w-full max-w-full min-w-0">
                  <div className="w-12 h-12 bg-[#6366F1]/10 rounded-xl flex items-center justify-center text-[#6366F1] shrink-0">
                    <GraduationCap size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wider">Academic Foundation</p>
                    <p className="font-bold text-sm md:text-base text-gray-900 break-words [overflow-wrap:anywhere] leading-snug">
                      B.Tech in Computer Science &amp; Engineering
                    </p>
                    <p className="text-xs text-gray-500 break-words [overflow-wrap:anywhere] mt-0.5">
                      Bennett University, Greater Noida (Expected 2027)
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-gray-200/80 shadow-xs w-full max-w-full min-w-0">
                  <div className="w-12 h-12 bg-[#6366F1]/10 rounded-xl flex items-center justify-center text-[#6366F1] shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wider">Certified Fundamentals</p>
                    <p className="font-bold text-xs sm:text-sm text-gray-900 break-words [overflow-wrap:anywhere] leading-snug">
                      Peer-to-Peer Protocols &amp; LANs (Univ. of Colorado)
                    </p>
                    <p className="text-xs text-gray-500 break-words [overflow-wrap:anywhere] mt-0.5">
                      OS: Power User (Google) • Digital Electronics • ML (IBM)
                    </p>
                  </div>
                </li>
              </motion.ul>

              {/* Action Buttons: Stacked, full width (max 360px), centered, 48px tall on mobile; inline pill + text link on desktop */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.48, ease: EASING_EASE_OUT_EXPO }}
                className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 w-full max-w-[360px] mx-auto md:max-w-none md:mx-0 pt-2 min-w-0"
              >
                <motion.a
                  href={RESUME_URL}
                  download="Sarthak_Bordia_Resume.pdf"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto h-12 md:h-auto min-h-[48px] md:min-h-[44px] flex items-center justify-center gap-2 bg-[#6366F1] text-white px-6 md:px-7 py-3 rounded-full font-semibold hover:bg-[#4F46E5] transition-all shadow-lg shadow-[#6366F1]/25 active:scale-95 cursor-pointer text-sm sm:text-base shrink-0"
                >
                  <Download size={17} /> Download Resume
                </motion.a>
                <motion.button
                  onClick={() => setIsResumeOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto h-12 md:h-auto min-h-[48px] md:min-h-[44px] flex items-center justify-center gap-1.5 text-sm sm:text-base font-semibold text-gray-800 md:text-gray-700 bg-white md:bg-transparent border border-gray-200 md:border-0 rounded-full md:rounded-none hover:text-[#6366F1] hover:border-[#6366F1] transition-all cursor-pointer px-6 md:px-0 py-3 md:py-2 shrink-0"
                >
                  View Full Resume <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section - Positioned before How I Think & What I Bring to a Team */}
      <section id="projects" className="py-16 md:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 gap-6 text-center md:text-left">
            <div>
              <motion.span 
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0, ease: EASING_EASE_OUT_EXPO }}
                className="text-[#6366F1] font-semibold tracking-wider uppercase text-xs md:text-sm mb-3 md:mb-4 block"
              >
                Hands-on Engineering
              </motion.span>
              <motion.h2 
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
                className="text-3xl md:text-5xl font-bold mb-2"
              >
                Featured Projects
              </motion.h2>
              <motion.p 
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.16, ease: EASING_EASE_OUT_EXPO }}
                className="text-gray-500 text-sm md:text-base max-w-xl"
              >
                Real problems, architectural decisions, and key learnings. Click on any project card to inspect the full case study.
              </motion.p>
            </div>
            <motion.a 
              href="https://github.com/Isarthak26" 
              target="_blank" 
              rel="noopener noreferrer"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.20, ease: EASING_EASE_OUT_EXPO }}
              className="text-[#6366F1] font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm md:text-base"
            >
              All Repositories on GitHub <ArrowRight className="w-4.5 h-4.5 md:w-5 md:h-5" />
            </motion.a>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {PROJECTS.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: Math.min(6, idx) * 0.07, ease: EASING_EASE_OUT_EXPO }}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="group cursor-pointer bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                onClick={() => setSelectedProject(project)}
              >
                <div>
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl mb-4 aspect-[4/3] bg-gray-100">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4 md:p-6">
                      <div className="flex justify-end gap-2">
                        {project.infraGithub && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(project.infraGithub, '_blank');
                            }}
                            className="w-8 h-8 md:w-9 md:h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#6366F1] transition-colors"
                            title="View GitOps Infra Repository"
                          >
                            <GitBranch className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </span>
                        )}
                        {project.github && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(project.github, '_blank');
                            }}
                            className="w-8 h-8 md:w-9 md:h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#6366F1] transition-colors"
                            title="View App Repository"
                          >
                            <Github className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </span>
                        )}
                        <span className="w-8 h-8 md:w-9 md:h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#6366F1] transition-colors" title="Read Case Study">
                          <ExternalLink className="w-4 h-4 md:w-4.5 md:h-4.5" />
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map(tag => (
                          <span key={tag} className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-[#6366F1] transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.summary}
                  </p>

                  {/* Direct Git Repo Link(s) with Git Logo */}
                  {(project.github || project.infraGithub) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100/90 hover:bg-[#1A1A1A] hover:text-white text-gray-800 text-xs font-semibold transition-all border border-gray-200/80 group/git shadow-xs"
                          title="Open Git Repository"
                        >
                          <Github size={14} className="text-gray-800 group-hover/git:text-white transition-colors" />
                          <span>{project.infraGithub ? 'App Git' : 'Git Repo'}</span>
                          <ExternalLink size={10} className="opacity-50 group-hover/git:opacity-100 transition-opacity" />
                        </a>
                      )}
                      {project.infraGithub && (
                        <a
                          href={project.infraGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/90 hover:bg-[#0078D4] hover:text-white text-[#0078D4] text-xs font-semibold transition-all border border-blue-200/80 group/infra shadow-xs"
                          title="Open GitOps Infrastructure Repository"
                        >
                          <GitBranch size={14} className="text-[#0078D4] group-hover/infra:text-white transition-colors" />
                          <span>Infra Git</span>
                          <ExternalLink size={10} className="opacity-50 group-hover/infra:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#6366F1]">
                  <span>View Story & Architecture</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How I Think & What I Bring to a Team (Mindset & Philosophy Section) */}
      <section className="py-16 md:py-20 bg-white/40 backdrop-blur-sm border-t border-gray-100/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-6 w-full min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 min-w-0 px-2">
            <motion.span 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0, ease: EASING_EASE_OUT_EXPO }}
              className="text-[#6366F1] font-bold tracking-wider uppercase text-xs md:text-sm mb-2 block"
            >
              MINDSET &amp; CHARACTER
            </motion.span>
            <motion.h3 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
              className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight break-words [overflow-wrap:anywhere]"
            >
              How I Think &amp; What I Bring to a Team
            </motion.h3>
            <motion.p 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.16, ease: EASING_EASE_OUT_EXPO }}
              className="text-gray-600 text-xs md:text-sm mt-2 font-normal break-words [overflow-wrap:anywhere]"
            >
              Beyond terminal commands, here are the principles that shape how I collaborate, learn, and build.
            </motion.p>
          </div>

          {/* 3-column grid on desktop, 2 on tablet, 1 on mobile, equal heights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch mb-6 w-full min-w-0">
            {WORK_PHILOSOPHY.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: Math.min(6, idx) * 0.07, ease: EASING_EASE_OUT_EXPO }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                className="bg-white/85 p-5 sm:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full min-w-0 max-w-full overflow-hidden"
              >
                <div>
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center mb-4 shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  {/* Consistent single line title min-height so body starts at same vertical height */}
                  <h4 className="font-bold text-base md:text-lg mb-2 text-gray-900 min-h-[28px] flex items-center break-words [overflow-wrap:anywhere]">
                    {item.title}
                  </h4>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed [text-wrap:pretty] break-words [overflow-wrap:anywhere]" style={{ color: '#374151' }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* BEYOND CODE Slim Strip */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 0.5, delay: 0.25, ease: EASING_EASE_OUT_EXPO }}
            className="w-full max-w-full min-w-0 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center shrink-0">
                <BEYOND_CODE.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-md shrink-0">
                  {BEYOND_CODE.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {BEYOND_CODE.title}:
                </span>
                <span className="text-xs sm:text-sm text-gray-700 break-words [overflow-wrap:anywhere]" style={{ color: '#374151' }}>
                  {BEYOND_CODE.description}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section ref={techSectionRef} className="py-12 md:py-20 border-y border-gray-100 relative bg-white/30 backdrop-blur-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <motion.p 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0, ease: EASING_EASE_OUT_EXPO }}
              className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#4B5563]"
            >
              Core Technologies &amp; Infrastructure Tools
            </motion.p>
            <motion.p 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
              className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1.5 font-medium"
            >
              <Sparkles size={13} className="text-[#6366F1]" /> Tap a logo to see how I use it.
            </motion.p>
          </div>

          {/* Logo Strip Buttons: 48px tall, full opacity, evenly spaced, 44px+ tap target */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {TECH_STACK.map((tech) => {
              const isActive = activeTechId === tech.id;
              return (
                <button
                  key={tech.id}
                  ref={(el) => {
                    logoButtonRefs.current[tech.id] = el;
                  }}
                  type="button"
                  onClick={() => handleLogoClick(tech.id)}
                  aria-label={isActive ? `${tech.name}, hide details` : `${tech.name}, show details`}
                  aria-expanded={isActive}
                  aria-controls={isMobileScreen ? `tech-card-mobile-${tech.id}` : `tech-card-desktop-${tech.id}`}
                  title={`${tech.name} — Click for details`}
                  className={`group relative min-w-[52px] min-h-[52px] p-2 sm:p-2.5 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 outline-none ${
                    isActive
                      ? 'ring-2 ring-[#6366F1] ring-offset-2 ring-offset-white -translate-y-1 bg-white shadow-md'
                      : 'hover:scale-108 hover:-translate-y-0.5 hover:bg-white/80 active:scale-95'
                  }`}
                >
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className={`h-10 sm:h-12 w-auto max-w-[56px] object-contain opacity-100 transition-transform ${
                      tech.scaleClass || ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop / Tablet Anchored Popover Card (>= 640px) */}
        <AnimatePresence>
          {!isMobileScreen && activeTech && popoverState && (
            <motion.div
              id={`tech-card-desktop-${activeTech.id}`}
              role="region"
              aria-label={`${activeTech.name} details`}
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.94,
                y: shouldReduceMotion ? 0 : popoverState.placeAbove ? 6 : -6,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.94,
                y: shouldReduceMotion ? 0 : popoverState.placeAbove ? 6 : -6,
              }}
              transition={{ duration: shouldReduceMotion ? 0.05 : 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: `${popoverState.left}px`,
                ...(popoverState.placeAbove
                  ? { bottom: `${popoverState.bottom}px` }
                  : { top: `${popoverState.top}px` }),
                width: '320px',
                zIndex: 50,
              }}
              className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100/90 text-left select-text"
            >
              {/* Pointing Arrow */}
              <div
                className={`absolute w-3 h-3 bg-white rotate-45 border-gray-200/80 ${
                  popoverState.placeAbove
                    ? 'bottom-[-7px] border-r border-b'
                    : 'top-[-7px] border-l border-t'
                }`}
                style={{
                  left: `${popoverState.arrowLeft}px`,
                  transform: 'translateX(-50%) rotate(45deg)',
                }}
              />

              {/* Header: Logo, Name, Close button */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0">
                    <img
                      src={activeTech.icon}
                      alt=""
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{activeTech.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTechId(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close card"
                >
                  <X size={15} />
                </button>
              </div>

              {/* What It Is */}
              <p className="text-xs text-gray-600 leading-snug mb-2.5 font-normal">
                {activeTech.whatItIs}
              </p>

              {/* How I Use It */}
              <div className="bg-[#6366F1]/5 border border-[#6366F1]/15 rounded-xl p-2.5 text-xs text-gray-800 leading-relaxed">
                <span className="font-bold text-[#4F46E5] block text-[10px] uppercase tracking-wider mb-1">
                  How I use it
                </span>
                <p className="text-gray-700 text-xs leading-normal">{activeTech.howIUseIt}</p>
              </div>

              {/* Optional Project Link */}
              {activeTech.projectId && (
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('projects');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    const proj = PROJECTS.find((p) => p.id === activeTech.projectId);
                    if (proj) setSelectedProject(proj);
                    setActiveTechId(null);
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer group"
                >
                  <span>See it in {activeTech.projectName || 'Featured Projects'}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Sheet (< 640px) */}
        <AnimatePresence>
          {isMobileScreen && activeTech && (
            <>
              {/* Tap-to-close Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setActiveTechId(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 sm:hidden"
                aria-hidden="true"
              />

              {/* Fixed Bottom Sheet */}
              <motion.div
                id={`tech-card-mobile-${activeTech.id}`}
                role="region"
                aria-label={`${activeTech.name} details`}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.05 : 0.2, ease: 'easeOut' }}
                className="fixed inset-x-0 bottom-0 z-50 mx-3 mb-3 p-4 sm:p-5 bg-white rounded-2xl border border-gray-200/90 shadow-2xl sm:hidden max-w-[calc(100%-24px)] box-border pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
              >
                {/* Drag Handle Indicator */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

                {/* Header: Logo, Name, Close Button */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={activeTech.icon}
                        alt=""
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-base truncate">{activeTech.name}</h4>
                      <p className="text-[11px] text-gray-400 font-medium">Core Infrastructure</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTechId(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Close details"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* What It Is */}
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {activeTech.whatItIs}
                </p>

                {/* How I Use It */}
                <div className="bg-[#6366F1]/5 border border-[#6366F1]/15 rounded-xl p-3 text-xs leading-relaxed text-gray-800 mb-3">
                  <span className="font-bold text-[#4F46E5] block text-[11px] uppercase tracking-wider mb-1">
                    How I use it
                  </span>
                  <p className="text-gray-700 leading-normal">{activeTech.howIUseIt}</p>
                </div>

                {/* Optional Project Link */}
                {activeTech.projectId && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTechId(null);
                      const el = document.getElementById('projects');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      const proj = PROJECTS.find((p) => p.id === activeTech.projectId);
                      if (proj) setSelectedProject(proj);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#6366F1]/10 hover:bg-[#6366F1]/15 text-[#6366F1] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>See it in {activeTech.projectName || 'Featured Projects'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 md:py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <motion.span 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0, ease: EASING_EASE_OUT_EXPO }}
              className="text-[#6366F1] font-semibold tracking-wider uppercase text-xs md:text-sm mb-3 md:mb-4 block"
            >
              Technical Foundations
            </motion.span>
            <motion.h2 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              How I Build &amp; Automate
            </motion.h2>
            <motion.div 
              initial={shouldReduceMotion ? {} : { opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASING_EASE_OUT_EXPO }}
              className="w-16 md:w-20 h-1 md:h-1.5 bg-[#6366F1] mx-auto rounded-full mb-4 origin-center" 
            />
            <motion.p 
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.5, delay: 0.16, ease: EASING_EASE_OUT_EXPO }}
              className="text-gray-500 text-sm md:text-base max-w-xl mx-auto"
            >
              A breakdown of the practical skills I have sharpened through real projects, lab experiments, and continuous study.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {SKILLS.map((skill, idx) => (
              <motion.div
                key={skill.title}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: Math.min(6, idx) * 0.07, ease: EASING_EASE_OUT_EXPO }}
                whileHover={shouldReduceMotion ? {} : { y: -5 }}
                className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-50 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                    <skill.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{skill.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{skill.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-y-auto flex flex-col relative my-auto"
            >
              {/* Modal Header Bar */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Project Case Study</span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Title & Tags */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <h3 className="text-2xl md:text-3xl font-bold">{selectedProject.title}</h3>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {selectedProject.github && (
                        <a
                          href={selectedProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-black text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs"
                        >
                          <Github size={14} />
                          <span>{selectedProject.infraGithub ? 'App Git' : 'Git Repo'}</span>
                        </a>
                      )}
                      {selectedProject.infraGithub && (
                        <a
                          href={selectedProject.infraGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#0078D4] hover:bg-[#005A9E] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs"
                        >
                          <GitBranch size={14} />
                          <span>Infra Git</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProject.tags.map(tag => (
                      <span key={tag} className="bg-[#6366F1]/10 text-[#6366F1] text-xs px-3 py-1 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {selectedProject.summary}
                  </p>
                </div>

                {/* Architecture Visual */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-[#0B0F19] p-2 flex items-center justify-center">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title} 
                    className="w-full max-h-[380px] object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Narrative Sections */}
                <div className="space-y-4">
                  <div className="p-4 md:p-5 rounded-2xl bg-gray-50/80 border border-gray-100">
                    <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1.5 flex items-center gap-2">
                      <span className="text-[#6366F1]">🎯</span> The Problem & Why I Built It
                    </h4>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      {selectedProject.problem}
                    </p>
                  </div>

                  <div className="p-4 md:p-5 rounded-2xl bg-gray-50/80 border border-gray-100">
                    <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1.5 flex items-center gap-2">
                      <span className="text-[#6366F1]">⚙️</span> Architecture & Approach
                    </h4>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      {selectedProject.approach}
                    </p>
                  </div>

                  <div className="p-4 md:p-5 rounded-2xl bg-gray-50/80 border border-gray-100">
                    <h4 className="font-bold text-sm md:text-base text-gray-900 mb-1.5 flex items-center gap-2">
                      <span className="text-[#6366F1]">🧩</span> Challenges Encountered & Overcome
                    </h4>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      {selectedProject.challenges}
                    </p>
                  </div>

                  <div className="p-4 md:p-5 rounded-2xl bg-[#6366F1]/5 border border-[#6366F1]/15">
                    <h4 className="font-bold text-sm md:text-base text-[#4F46E5] mb-1.5 flex items-center gap-2">
                      <span>💡</span> Key Takeaway & What I Learned
                    </h4>
                    <p className="text-gray-700 text-xs md:text-sm leading-relaxed font-medium">
                      {selectedProject.learnings}
                    </p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 flex flex-wrap justify-end gap-3">
                  {selectedProject.github && (
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-sm"
                    >
                      <Github size={16} /> App Repo (portfolio_depl)
                    </a>
                  )}
                  {selectedProject.infraGithub && (
                    <a
                      href={selectedProject.infraGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0078D4] hover:bg-[#005A9E] text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-sm"
                    >
                      <GitBranch size={16} /> GitOps Infra Repo (portfolio_infra)
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Preview & Download Modal */}
      <AnimatePresence>
        {isResumeOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsResumeOpen(false)}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto modal-backdrop-print-hide"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl md:rounded-3xl shadow-2xl overflow-y-auto flex flex-col relative my-auto border border-gray-100 print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 md:px-7 py-3.5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 modal-chrome no-print">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">Sarthak Bordia — Resume</h3>
                    <p className="text-[11px] text-gray-500">B.Tech in CSE (DevOps Specialization) • Bennett University</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View Switcher */}
                  <div className="flex bg-gray-100 p-0.5 rounded-full border border-gray-200 text-xs">
                    <button
                      onClick={() => setResumeViewMode('document')}
                      className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                        resumeViewMode === 'document' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Formatted View
                    </button>
                    <button
                      onClick={() => setResumeViewMode('pdf')}
                      className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                        resumeViewMode === 'pdf' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      PDF Preview
                    </button>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="hidden sm:inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                    title="Print or Save as PDF"
                  >
                    <Printer size={13} /> Print
                  </button>

                  <a
                    href={RESUME_URL}
                    download="Sarthak_Bordia_Resume.pdf"
                    className="inline-flex items-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm"
                  >
                    <Download size={13} /> Download PDF
                  </a>

                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    title="Open raw PDF in new browser tab"
                  >
                    <ExternalLink size={13} /> Open
                  </a>

                  <button
                    onClick={() => setIsResumeOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black ml-1 cursor-pointer"
                    aria-label="Close resume modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-8 bg-gray-50/70 flex flex-col items-center print:p-0 print:bg-white">
                {/* Formatted View (Always available to print engine via print:block) */}
                <div className={`w-full max-w-3xl bg-white shadow-xl rounded-2xl border border-gray-200/90 p-6 md:p-10 text-[#0F172A] font-sans text-left resume-print-wrapper ${
                  resumeViewMode === 'document' ? 'block' : 'hidden print:block'
                }`}>
                  {/* Header */}
                  <div className="text-center pb-2.5 border-b-[2.5px] border-[#1B365D]">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
                      SARTHAK BORDIA
                    </h1>
                    <p className="text-xs sm:text-[13px] text-gray-600 font-medium">
                      Greater Noida, UP &nbsp;|&nbsp; 
                      <a href="tel:+917610305451" className="hover:text-[#2563EB] transition-colors font-semibold"> +91 7610305451</a> &nbsp;|&nbsp; 
                      <a href="mailto:sarthakbordia10@gmail.com" className="hover:text-[#2563EB] transition-colors font-semibold"> sarthakbordia10@gmail.com</a>
                    </p>
                    <div className="flex justify-center items-center gap-3 text-xs sm:text-[13px] font-semibold text-[#2563EB] mt-1.5">
                      <a href="https://github.com/Isarthak26" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <Github size={13} /> GitHub
                      </a>
                      <span className="text-gray-300 font-normal">|</span>
                      <a href="https://www.linkedin.com/in/sarthak-bordia-3b9b891a0/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <Linkedin size={13} /> LinkedIn
                      </a>
                      <span className="text-gray-300 font-normal">|</span>
                      <a href="https://github.com/Isarthak26" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <Globe size={13} /> Portfolio
                      </a>
                    </div>
                  </div>

                  {/* PROFESSIONAL SUMMARY */}
                  <div className="mt-4 print-avoid-break">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#1B365D] uppercase mb-1 print-section-header">
                      Professional Summary
                    </h2>
                    <p className="text-xs sm:text-[13px] leading-relaxed text-gray-700">
                      Computer Science undergraduate specializing in DevOps, with hands-on experience in cloud infrastructure, CI/CD pipelines, containerization, and automated deployments. Experienced with AWS, Azure, Docker, Kubernetes, Terraform, and Jenkins. Driven problem-solver focused on building scalable, reliable systems through practical engineering and infrastructure automation.
                    </p>
                  </div>

                  {/* TECHNICAL SKILLS & CORE COMPETENCIES */}
                  <div className="mt-4 print-avoid-break">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#1B365D] uppercase mb-1.5 print-section-header">
                      Technical Skills &amp; Core Competencies
                    </h2>
                    <div className="space-y-1 text-xs sm:text-[13px] leading-relaxed">
                      <div>
                        <span className="font-bold text-gray-900">Programming &amp; Core CS: </span>
                        <span className="text-gray-700">C++, Python, Data Structures &amp; Algorithms, REST APIs, Linux CLI, Bash</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">Cloud &amp; Infrastructure: </span>
                        <span className="text-gray-700">AWS (EC2, S3, VPC, ALB, Route 53, ACM, RDS), Azure (AKS, ACR), Docker, Kubernetes, Terraform</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">DevOps &amp; Observability: </span>
                        <span className="text-gray-700">Jenkins, ArgoCD (GitOps), Nginx, Prometheus, Grafana, k6, Git</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">Core Competencies: </span>
                        <span className="text-gray-700">Technical Communication, Workflow Automation, Infrastructure as Code, End-to-End System Design</span>
                      </div>
                    </div>
                  </div>

                  {/* FEATURED PROJECTS */}
                  <div className="mt-4">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#1B365D] uppercase mb-2 print-section-header">
                      Featured Projects
                    </h2>
                    <div className="space-y-3.5">
                      {/* Project 1 */}
                      <div className="print-avoid-break">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h3 className="font-bold text-xs sm:text-[13.5px] text-gray-900">
                            CloudOpt AI
                          </h3>
                          <a href="https://github.com/Isarthak26/CloudOpt" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] hover:underline">
                            [View Project]
                          </a>
                        </div>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#0284C7] mt-0.5">
                          Python (FastAPI), Docker Compose, Prometheus, Grafana, k6
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs sm:text-[12.5px] text-gray-700 list-disc list-outside pl-4 leading-relaxed">
                          <li>Architected a local-first cloud measurement platform isolating backend API workloads from telemetry collection pipelines.</li>
                          <li>Executed 9 validated k6 experiments across 3 CPU/memory tier configurations under varied load profiles, identifying CPU saturation as the root cause of a 17–28x p95 latency surge at 0.25 CPU / 128 MB limits.</li>
                          <li>Designed threshold-based recommendation scripts in Python to evaluate workload allocations against target SLA thresholds.</li>
                        </ul>
                      </div>

                      {/* Project 2 */}
                      <div className="print-avoid-break">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h3 className="font-bold text-xs sm:text-[13.5px] text-gray-900">
                            Azure GitOps CI/CD Pipeline
                          </h3>
                          <a href="https://github.com/Isarthak26/portfolio_infra" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] hover:underline">
                            [View Project]
                          </a>
                        </div>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#0284C7] mt-0.5">
                          Terraform, Azure Container Registry (ACR), Azure Kubernetes Service (AKS), Jenkins, ArgoCD, Nginx
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs sm:text-[12.5px] text-gray-700 list-disc list-outside pl-4 leading-relaxed">
                          <li>Automated cloud infrastructure provisioning on Azure Kubernetes Service (AKS) using modular Terraform configurations.</li>
                          <li>Integrated Jenkins build pipelines with Azure Container Registry (ACR) and ArgoCD GitOps continuous deployment to AKS.</li>
                        </ul>
                      </div>

                      {/* Project 3 */}
                      <div className="print-avoid-break">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h3 className="font-bold text-xs sm:text-[13.5px] text-gray-900">
                            Real-time Chat App on AKS
                          </h3>
                          <a href="https://github.com/Isarthak26/real_time_chat_APP" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] hover:underline">
                            [View Project]
                          </a>
                        </div>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#0284C7] mt-0.5">
                          Docker, Kubernetes (AKS), Azure Container Registry, Jenkins, Prometheus, Grafana
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs sm:text-[12.5px] text-gray-700 list-disc list-outside pl-4 leading-relaxed">
                          <li>Orchestrated containerized application services on Azure Kubernetes Service automated through Jenkins deployment pipelines.</li>
                          <li>Configured Prometheus metrics scrapers and Grafana monitoring dashboards for real-time cluster health and resource tracking.</li>
                        </ul>
                      </div>

                      {/* Project 4 */}
                      <div className="print-avoid-break">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h3 className="font-bold text-xs sm:text-[13.5px] text-gray-900">
                            Automated AWS Infrastructure Deployment
                          </h3>
                          <a href="https://github.com/Isarthak26/Docker_CICD" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] hover:underline">
                            [View Project]
                          </a>
                        </div>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#0284C7] mt-0.5">
                          AWS (VPC, EC2, RDS, ALB, Route 53, ACM), Terraform, Jenkins, Python (Flask)
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs sm:text-[12.5px] text-gray-700 list-disc list-outside pl-4 leading-relaxed">
                          <li>Provisioned secure AWS network topology deploying Python Flask services on EC2 alongside database resources within a custom VPC.</li>
                          <li>Configured Application Load Balancer routing, Route 53 DNS records, ACM SSL certificates, and automated Jenkins pipelines.</li>
                        </ul>
                      </div>

                      {/* Project 5 */}
                      <div className="print-avoid-break">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h3 className="font-bold text-xs sm:text-[13.5px] text-gray-900">
                            Static Website Hosting on AWS
                          </h3>
                          <a href="https://github.com/Isarthak26" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB] hover:underline">
                            [View Project]
                          </a>
                        </div>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#0284C7] mt-0.5">
                          AWS S3, Route 53, ACM, Application Load Balancer, EC2
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs sm:text-[12.5px] text-gray-700 list-disc list-outside pl-4 leading-relaxed">
                          <li>Hosted custom domain static assets on S3 integrated with Route 53 DNS routing and ACM SSL/TLS certificate management.</li>
                          <li>Configured Application Load Balancer path-based routing rules to direct incoming web traffic to target backend instances.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* EDUCATION, CERTIFICATIONS & LANGUAGES */}
                  <div className="mt-4 pt-1 print-avoid-break">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-[#1B365D] uppercase mb-1.5 print-section-header">
                      Education, Certifications &amp; Languages
                    </h2>
                    <div className="space-y-1.5 text-xs sm:text-[13px]">
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <div>
                          <span className="font-bold text-gray-900">Bennett University</span>
                          <span className="text-gray-700"> — B.Tech in CSE (DevOps Specialization) — CGPA: 7.12</span>
                        </div>
                        <span className="font-semibold text-gray-600 text-[11px] sm:text-xs">08/2023 – 08/2027</span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <div>
                          <span className="font-bold text-gray-900">Gurukul School</span>
                          <span className="text-gray-700"> — Senior Secondary Education</span>
                        </div>
                        <span className="font-semibold text-gray-600 text-[11px] sm:text-xs">03/2011 – 03/2023</span>
                      </div>
                      <div className="pt-0.5">
                        <span className="font-bold text-gray-900">Industry Certifications: </span>
                        <span className="text-gray-700 leading-relaxed text-[11.5px] sm:text-[12.5px]">
                          Peer-to-Peer Protocols &amp; LANs (Univ. of Colorado) &nbsp;|&nbsp; Operating Systems: Power User (Google) &nbsp;|&nbsp; Digital Electronics (Infosys) &nbsp;|&nbsp; Machine Learning Fundamentals (IBM)
                        </span>
                      </div>
                      <div className="pt-0.5">
                        <span className="font-bold text-gray-900">Languages: </span>
                        <span className="text-gray-700 leading-relaxed text-[11.5px] sm:text-[12.5px]">
                          English (Professional), Hindi (Native)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Preview Mode */}
                {resumeViewMode === 'pdf' && (
                  <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 no-print">
                    {/* Desktop & Tablet: Embedded Vector PDF via iframe */}
                    <div className="hidden sm:block w-full">
                      <iframe 
                        src={`${RESUME_URL}#toolbar=0&navpanes=0&scrollbar=1`} 
                        title="Sarthak Bordia Resume PDF" 
                        className="w-full h-[72vh] md:h-[78vh] border-0 rounded-2xl bg-white"
                      />
                    </div>

                    {/* Mobile (<640px): Dedicated Open/Download card since mobile browser iframes cannot reliably render PDFs */}
                    <div className="block sm:hidden p-6 text-center space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">PDF Resume Preview</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                          Mobile browsers do not embed interactive PDF files inside web frames reliably. Tap below to view or download the full ATS-friendly document:
                        </p>
                      </div>
                      <div className="flex flex-col gap-2.5 pt-2">
                        <a
                          href={RESUME_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={14} /> Open PDF in New Tab
                        </a>
                        <a
                          href={RESUME_URL}
                          download="Sarthak_Bordia_Resume.pdf"
                          className="w-full py-2.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <Download size={14} /> Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap justify-center items-center gap-2 md:gap-4 text-xs text-gray-500 font-medium modal-chrome no-print">
                  <span>📍 Greater Noida, UP</span>
                  <span>•</span>
                  <a href="tel:+917610305451" className="hover:text-[#6366F1] transition-colors">📞 +91 7610305451</a>
                  <span>•</span>
                  <a href="mailto:sarthakbordia10@gmail.com" className="hover:text-[#6366F1] transition-colors">✉️ sarthakbordia10@gmail.com</a>
                  <span>•</span>
                  <a href="https://github.com/Isarthak26" target="_blank" rel="noopener noreferrer" className="hover:text-[#6366F1] transition-colors">GitHub</a>
                  <span>•</span>
                  <a href="https://www.linkedin.com/in/sarthak-bordia-3b9b891a0/" target="_blank" rel="noopener noreferrer" className="hover:text-[#6366F1] transition-colors">LinkedIn</a>
                  <span>•</span>
                  <a href="https://www.instagram.com/sarthak.bordia/" target="_blank" rel="noopener noreferrer" className="hover:text-[#6366F1] transition-colors">Instagram</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Section Container - Centered to match nav & footer */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12 box-border">
        <section 
          id="contact" 
          className="scroll-mt-24 py-12 sm:py-16 md:py-20 bg-[#0B0F19] text-white rounded-[28px] md:rounded-[48px] lg:rounded-[64px] overflow-hidden relative shadow-2xl border border-white/10 w-full box-border"
        >
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[#6366F1]/15 blur-[80px] md:blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10 box-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center w-full min-w-0">
              {/* Left Column: Text, Email Line & Socials */}
              <div className="text-center md:text-left w-full min-w-0">
                {/* Eyebrow */}
                <motion.span
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.5, delay: 0, ease: EASING_EASE_OUT_EXPO }}
                  className="text-[#8B8FFF] font-bold tracking-wider uppercase text-xs md:text-sm mb-3 block"
                >
                  GET IN TOUCH
                </motion.span>

                {/* Headline */}
                <motion.h2
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.5, delay: 0.08, ease: EASING_EASE_OUT_EXPO }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight [text-wrap:balance] break-words [overflow-wrap:anywhere] text-white"
                >
                  Let's connect &amp; <br className="hidden sm:inline" />
                  <span className="text-[#8B8FFF]">build together.</span>
                </motion.h2>

                {/* Recruiter-focused Paragraph */}
                <motion.p
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.5, delay: 0.16, ease: EASING_EASE_OUT_EXPO }}
                  className="text-[#D1D5DB] text-sm md:text-base mb-6 md:mb-7 max-w-md mx-auto md:mx-0 leading-relaxed [text-wrap:pretty] break-words [overflow-wrap:anywhere]"
                >
                  Open to DevOps, SRE, backend, and product internships, in India or remote. Send a note and I'll reply soon.
                </motion.p>

                {/* Visible Email Line with Copy Button (width: fit-content) */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.5, delay: 0.24, ease: EASING_EASE_OUT_EXPO }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-6 md:mb-7 max-w-full"
                >
                  <div className="w-fit max-w-full flex items-center justify-center sm:justify-start gap-2 bg-white/[0.08] border border-white/15 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-gray-200 min-h-[44px]">
                    <Mail size={16} className="text-[#8B8FFF] shrink-0" />
                    <span className="font-mono text-xs sm:text-sm select-all break-all">sarthakbordia10@gmail.com</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmailToClipboard}
                    className="w-fit inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-[#8B8FFF] transition-all cursor-pointer min-h-[44px] shrink-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8B8FFF] focus:ring-offset-2 focus:ring-offset-[#0B0F19]"
                    aria-label="Copy email address to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check size={15} className="text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} className="text-gray-300" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Social Channels: GitHub & LinkedIn (No duplicate email icon) */}
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.5, delay: 0.32, ease: EASING_EASE_OUT_EXPO }}
                  className="flex flex-wrap justify-center md:justify-start gap-3"
                >
                  {CONTACT_CHANNELS.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      title={social.tooltip}
                      whileHover={shouldReduceMotion ? {} : { y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-xl bg-white/[0.06] hover:bg-[#8B8FFF]/15 border border-white/15 hover:border-[#8B8FFF] flex items-center justify-center text-gray-200 hover:text-[#8B8FFF] transition-colors cursor-pointer group shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B8FFF] focus:ring-offset-2 focus:ring-offset-[#0B0F19]"
                    >
                      <social.icon size={20} className="transition-transform group-hover:scale-105" />
                    </motion.a>
                  ))}
                </motion.div>
              </div>

              {/* Right Column: Contact Form Card */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.5, delay: 0.20, ease: EASING_EASE_OUT_EXPO }}
                className="bg-white/[0.04] backdrop-blur-xl p-5 sm:p-7 md:p-9 rounded-2xl md:rounded-[2rem] border border-white/10 w-full min-w-0 shadow-xl"
              >
                <form className="space-y-4 md:space-y-5" onSubmit={handleContactSubmit} noValidate>
                  {/* Spam honeypot */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />

                  {/* Name & Email Row (1 col on mobile, 2 col on md) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-[#E5E7EB] text-xs font-semibold uppercase tracking-wider block">
                        Your Name <span className="text-[#8B8FFF]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, name: e.target.value }));
                          if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className="w-full bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-3 text-white placeholder-[#9CA3AF] text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#8B8FFF] focus:ring-offset-2 focus:ring-offset-[#0B0F19] transition-all"
                        placeholder="e.g. Alex Sharma"
                        aria-required="true"
                        aria-invalid={!!formErrors.name}
                      />
                      {formErrors.name && (
                        <p className="text-red-400 text-xs mt-1 font-medium" role="alert">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="text-[#E5E7EB] text-xs font-semibold uppercase tracking-wider block">
                        Your Email <span className="text-[#8B8FFF]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className="w-full bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-3 text-white placeholder-[#9CA3AF] text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#8B8FFF] focus:ring-offset-2 focus:ring-offset-[#0B0F19] transition-all"
                        placeholder="alex@example.com"
                        aria-required="true"
                        aria-invalid={!!formErrors.email}
                      />
                      {formErrors.email && (
                        <p className="text-red-400 text-xs mt-1 font-medium" role="alert">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-[#E5E7EB] text-xs font-semibold uppercase tracking-wider block">
                      Message <span className="text-[#8B8FFF]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, message: e.target.value }));
                        if (formErrors.message) setFormErrors(prev => ({ ...prev, message: undefined }));
                      }}
                      className="w-full bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-3 text-white placeholder-[#9CA3AF] text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#8B8FFF] focus:ring-offset-2 focus:ring-offset-[#0B0F19] transition-all resize-none"
                      placeholder="Tell me about your team, role, or project..."
                      aria-required="true"
                      aria-invalid={!!formErrors.message}
                    ></textarea>
                    {formErrors.message && (
                      <p className="text-red-400 text-xs mt-1 font-medium" role="alert">
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Screen-reader Live Region */}
                  <div aria-live="polite" className="sr-only">
                    {formAnnouncement}
                  </div>

                  {/* Inline Success Notice */}
                  {formStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5"
                    >
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                      <span className="font-medium">Thanks! I'll reply soon.</span>
                    </motion.div>
                  )}

                  {/* Inline Error Notice with Retry & Mail Client Backup */}
                  {formStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-red-300">
                            {formErrorMessage || 'Something went wrong. Please try again or email me directly.'}
                          </p>
                          <p className="text-xs text-gray-300">
                            Direct email:{' '}
                            <a href="mailto:sarthakbordia10@gmail.com" className="underline font-semibold text-white">
                              sarthakbordia10@gmail.com
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                        >
                          Retry
                        </button>
                        <a
                          href={`mailto:sarthakbordia10@gmail.com?subject=${encodeURIComponent(
                            'Portfolio Contact from ' + (formData.name || 'Visitor')
                          )}&body=${encodeURIComponent(
                            (formData.message || '') +
                              (formData.name ? '\n\nFrom: ' + formData.name + (formData.email ? ' (' + formData.email + ')' : '') : '')
                          )}`}
                          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors inline-flex items-center gap-1"
                        >
                          Send via Email App ↗
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button - Full Width, 48-52px tall */}
                  <button 
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full h-12 md:h-[50px] min-h-[48px] px-8 py-3.5 rounded-full font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-all shadow-lg shadow-[#6366F1]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8B8FFF] focus:ring-offset-2 focus:ring-offset-[#0B0F19]"
                  >
                    {formStatus === 'sending' ? (
                      <>Sending…</>
                    ) : (
                      <>Send Message <ArrowRight size={17} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Slim Clean Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 border-t border-gray-200/80 text-xs sm:text-sm text-[#4B5563] flex flex-col sm:flex-row items-center justify-between gap-4 box-border">
        <p className="text-[#4B5563] font-medium">© 2026 Sarthak Bordia</p>
        <div className="flex items-center gap-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[#4B5563] hover:text-[#5B5FEF] transition-colors cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FEF] rounded-md px-1"
          >
            Back to top ↑
          </button>
          <a
            href="https://github.com/Isarthak26"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="text-[#4B5563] hover:text-[#5B5FEF] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FEF] rounded-md px-1"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/sarthak-bordia-3b9b891a0/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="text-[#4B5563] hover:text-[#5B5FEF] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5FEF] rounded-md px-1"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </motion.div>
  );
}
