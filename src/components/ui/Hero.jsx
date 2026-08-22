import React from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { ShieldAlert, Network, Code2, BrainCircuit, Terminal, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import HeroCanvas from '../3d/HeroCanvas';
import AnimatedCounter from './AnimatedCounter';
import { playClickSound, playHoverSound } from '../../utils/audioFX';

const iconMap = {
  ShieldAlert: ShieldAlert,
  Network: Network,
  Code2: Code2,
  BrainCircuit: BrainCircuit
};

export default function Hero({ activeRole, setActiveRole }) {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};
  const roles = data.roles || [];
  const currentRoleObj = roles.find((r) => r.id === activeRole) || roles[0] || {};

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'clamp(90px, 12vh, 120px)',
        paddingBottom: 'clamp(40px, 8vh, 70px)',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      {/* 3D WebGL Background Scene */}
      <HeroCanvas activeColor={currentRoleObj.color} />

      {/* Main Centered Content Overlay */}
      <div
        className="section-container"
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          pointerEvents: 'none',
          paddingBlock: 0
        }}
      >
        {/* Top Announcement Pill */}
        <div style={{ pointerEvents: 'auto', display: 'inline-block', marginBottom: '18px' }}>
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '30px',
              background: 'rgba(0, 243, 255, 0.08)',
              border: `1px solid ${currentRoleObj.color}`,
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.74rem, 1.8vw, 0.85rem)',
              color: currentRoleObj.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: `0 0 15px ${currentRoleObj.accent}`,
              maxWidth: '100%',
              textAlign: 'left'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentRoleObj.color, flexShrink: 0 }} />
            <span>SPPU B.E. Computer Engineering (2026) SGPA <AnimatedCounter end={8.03} decimals={2} /> • {currentRoleObj.badge}</span>
          </div>
        </div>

        {/* Main Title with Fluid Clamp */}
        <h1
          className="hero-title"
          style={{
            pointerEvents: 'auto'
          }}
        >
          Architecting Secure Networks & <br />
          <span style={{ color: currentRoleObj.color, transition: 'color 0.3s ease' }}>
            {currentRoleObj.title}
          </span>
        </h1>

        {/* Subtitle / Bio */}
        <p
          className="section-subtitle"
          style={{
            marginInline: 'auto',
            pointerEvents: 'auto',
            marginBottom: '32px'
          }}
        >
          {currentRoleObj.desc}
        </p>

        {/* Role Matrix Switcher */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '36px'
          }}
        >
          {roles.map((role) => {
            const Icon = iconMap[role.icon] || ShieldAlert;
            const isActive = role.id === activeRole;
            return (
              <button
                key={role.id}
                onClick={() => {
                  playClickSound();
                  setActiveRole(role.id);
                }}
                onMouseEnter={() => playHoverSound()}
                style={{
                  background: isActive ? role.accent : 'rgba(14, 18, 36, 0.72)',
                  border: `1px solid ${isActive ? role.color : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.86rem',
                  fontFamily: 'var(--font-main)',
                  fontWeight: 600,
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 0 20px ${role.accent}` : 'none',
                  minHeight: '44px'
                }}
              >
                <Icon size={16} color={isActive ? role.color : 'var(--text-muted)'} />
                {role.title}
              </button>
            );
          })}
        </div>

        {/* CTA Action Buttons */}
        <div style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <a href="#terminal" onClick={() => playClickSound()} className="cyber-btn" style={{ borderColor: currentRoleObj.color, minHeight: '48px', padding: '12px 24px' }}>
            <Terminal size={17} /> Launch Terminal Simulator
          </a>
          <a href="#projects" onClick={() => playClickSound()} className="cyber-btn cyber-btn-outline" style={{ minHeight: '48px', padding: '12px 24px' }}>
            View Projects <ArrowRight size={17} />
          </a>
        </div>

        {/* Quick Social Badges */}
        <div
          style={{
            pointerEvents: 'auto',
            marginTop: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {personalInfo.linkedin && (
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              style={{ color: 'var(--text-muted)', transition: 'color 0.2s', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Linkedin size={20} />
            </a>
          )}
          {personalInfo.github && (
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              style={{ color: 'var(--text-muted)', transition: 'color 0.2s', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Github size={20} />
            </a>
          )}
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              aria-label="Email Karan"
              style={{ color: 'var(--text-muted)', transition: 'color 0.2s', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Mail size={20} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
