import React, { useState, useEffect } from 'react';
import Navbar from './components/ui/Navbar';
import Hero from './components/ui/Hero';
import LinuxTerminal from './components/ui/LinuxTerminal';
import NetworkVisualizer from './components/ui/NetworkVisualizer';
import AnalyticsSandbox from './components/ui/AnalyticsSandbox';
import ProjectsSection from './components/ui/ProjectsSection';
import BlogsSection from './components/ui/BlogsSection';
import SkillsGrid from './components/ui/SkillsGrid';
import Certifications from './components/ui/Certifications';
import ExperienceTimeline from './components/ui/ExperienceTimeline';
import ContactSection from './components/ui/ContactSection';
import Footer from './components/ui/Footer';
import AdminAuth from './components/admin/AdminAuth';
import AdminDashboard from './components/admin/AdminDashboard';
import CyberCursorTrail from './components/ui/CyberCursorTrail';
import ThreatRadarVisualizer from './components/ui/ThreatRadarVisualizer';
import { setSoundEnabledState } from './utils/audioFX';
import { portfolioStore } from './data/portfolioStore';

export default function App() {
  const [activeRole, setActiveRole] = useState('cyber');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setSoundEnabledState(soundEnabled);
  }, [soundEnabled]);

  // Check existing admin session token on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = portfolioStore.getAuthToken();
      if (!token) return;

      try {
        const res = await fetch('/api/auth/verify-session', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.authenticated) {
            setAuthenticated(true);
            portfolioStore.fetchPrivateMessages();
          } else {
            portfolioStore.clearAuthToken();
            setAuthenticated(false);
          }
        } else {
          portfolioStore.clearAuthToken();
          setAuthenticated(false);
        }
      } catch (err) {
        console.warn('Session verification warning:', err.message);
      }
    };

    checkSession();
  }, []);

  // Autoplay ambient sound effects on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (soundEnabled) {
        setSoundEnabledState(true);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [soundEnabled]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  const handleLogoutAdmin = () => {
    portfolioStore.clearAuthToken();
    setAuthenticated(false);
    handleCloseAdmin();
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Interactive Cyber Particle Trail Following Cursor */}
      <CyberCursorTrail />

      {/* Background Matrix & Scanline Overlays */}
      <div className="cyber-grid-overlay" />
      <div className="scanline-effect" />

      {/* Glassmorphic Navbar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />

      {/* Hero Section with 3D WebGL Canvas */}
      <Hero activeRole={activeRole} setActiveRole={setActiveRole} />

      {/* Interactive Linux Bash Terminal */}
      <LinuxTerminal />

      {/* Cisco Network Routing Simulator */}
      <NetworkVisualizer />

      {/* AI & ARIMA/K-Means Predictive Sandbox */}
      <AnalyticsSandbox />

      {/* Featured Projects Grid */}
      <ProjectsSection />

      {/* Technical Blogs & Research Vault */}
      <BlogsSection />

      {/* Skill Matrix */}
      <SkillsGrid />

      {/* Certifications Vault */}
      <Certifications />

      {/* Experience & Education Timeline */}
      <ExperienceTimeline />

      {/* SOC Cyber Defense Radar Visualizer */}
      <section className="section-container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <ThreatRadarVisualizer />
      </section>

      {/* Contact Nexus */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Secure Admin Portal Modals */}
      {adminOpen && !authenticated && (
        <AdminAuth
          onAuthenticated={() => {
            setAuthenticated(true);
            portfolioStore.fetchPrivateMessages();
          }}
          onClose={handleCloseAdmin}
        />
      )}

      {adminOpen && authenticated && (
        <AdminDashboard
          onClose={handleCloseAdmin}
          onLogout={handleLogoutAdmin}
        />
      )}
    </div>
  );
}
