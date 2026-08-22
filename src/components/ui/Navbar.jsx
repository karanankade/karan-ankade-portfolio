import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Network, Code2, BrainCircuit, Download, Menu, X, Lock, BookOpen } from 'lucide-react';
import { usePortfolioData } from '../../data/portfolioStore';
import { playHoverSound, playClickSound } from '../../utils/audioFX';

export default function Navbar({ activeRole, setActiveRole, soundEnabled, setSoundEnabled, onOpenAdmin }) {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when pressing Escape or resizing to desktop, and lock body scroll
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Terminal', href: '#terminal' },
    { name: 'Network Labs', href: '#network-labs' },
    { name: 'AI Sandbox', href: '#ai-sandbox' },
    { name: 'Projects', href: '#projects' },
    { name: 'Blogs', href: '#blogs' },
    { name: 'Skills', href: '#skills' },
    { name: 'Certs', href: '#certifications' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = () => {
    playClickSound();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        role="banner"
        style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(94vw, 1440px)',
          zIndex: 100
        }}
      >
        <nav
          aria-label="Main Navigation"
          style={{
            width: '100%',
            background: scrolled || mobileMenuOpen ? 'rgba(7, 9, 19, 0.94)' : 'rgba(14, 18, 36, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            borderRadius: '16px',
            padding: '10px clamp(12px, 2vw, 20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease',
            boxShadow: scrolled ? '0 12px 35px rgba(0,0,0,0.85), 0 0 15px rgba(0, 243, 255, 0.1)' : '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Brand & Status */}
          <a
            href="#"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(false);
            }}
            onMouseEnter={() => playHoverSound()}
            aria-label="Karan Ankade Portfolio Home"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff', minHeight: '44px' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
                border: '1px solid var(--cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
                fontWeight: 'bold',
                color: 'var(--cyan)',
                flexShrink: 0
              }}
            >
              KA
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                {personalInfo.name ? personalInfo.name.split(' ')[0] + ' Ankade' : 'Karan Ankade'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                <span className="status-dot"></span> Available for Hire
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="desktop-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => playClickSound()}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--cyan)';
                  playHoverSound();
                }}
                onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                  padding: '6px 4px'
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Actions: Resume Download & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={personalInfo.portfolio || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              onMouseEnter={() => playHoverSound()}
              className="cyber-btn"
              style={{ padding: '7px 14px', fontSize: '0.82rem', minHeight: '40px', minWidth: '40px' }}
              aria-label="Download Official PDF Resume"
            >
              <Download size={14} /> Resume
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => {
                playClickSound();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="mobile-menu-toggle"
              style={{
                background: mobileMenuOpen ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                borderRadius: '8px',
                width: '44px',
                height: '44px',
                color: 'var(--cyan)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Slide-Down Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          style={{
            position: 'fixed',
            top: '74px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(94vw, 1440px)',
            zIndex: 99,
            background: 'rgba(7, 9, 19, 0.98)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            borderRadius: '18px',
            padding: '18px 16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 243, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: 'calc(100vh - 90px)',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 600, padding: '0 8px 4px' }}>
            Navigation Sections
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={handleLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  minHeight: '48px'
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '6px', display: 'flex', gap: '10px' }}>
            <a
              href="#admin"
              onClick={handleLinkClick}
              className="cyber-btn cyber-btn-outline"
              style={{ flex: 1, padding: '10px', fontSize: '0.85rem', minHeight: '46px' }}
            >
              <Lock size={14} /> Admin Portal
            </a>
          </div>
        </div>
      )}
    </>
  );
}
