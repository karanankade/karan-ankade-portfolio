import React from 'react';
import { Shield, ArrowUp, Lock } from 'lucide-react';
import { usePortfolioData } from '../../data/portfolioStore';

export default function Footer({ onOpenAdmin }) {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(0, 243, 255, 0.15)',
        background: 'rgba(5, 8, 20, 0.95)',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--cyan)" /> {personalInfo.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            SPPU B.E. Computer Engineering (Honours in Cyber Security) • {new Date().getFullYear()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="#blogs"
            className="cyber-btn cyber-btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Technical Vault
          </a>
          <button
            onClick={scrollToTop}
            className="cyber-btn cyber-btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
