import React from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { Award, ShieldCheck, CheckCircle, ExternalLink } from 'lucide-react';
import HoloCardTilt from './HoloCardTilt';

export default function Certifications() {
  const { data } = usePortfolioData();
  const certifications = data.certifications || [];
  return (
    <section id="certifications" className="section-container">
      <div className="section-title">
        <Award color="var(--amber)" size={32} />
        <h2>Industry Certifications & Credentials</h2>
      </div>
      <p className="section-subtitle">
        Professional credentials from Cisco, IIT Bombay, Microsoft, Oracle, SISA, and SevenMentor.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 2vw, 22px)' }}>
        {certifications.map((cert, idx) => (
          <HoloCardTilt
            key={idx}
            className="glass-panel"
            style={{
              padding: 'clamp(18px, 3vw, 22px)',
              borderLeft: `4px solid ${cert.badgeColor}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: cert.badgeColor + '22',
                    color: cert.badgeColor,
                    border: `1px solid ${cert.badgeColor}`
                  }}
                >
                  {cert.category}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cert.date}</span>
              </div>

              <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', color: '#ffffff', lineHeight: '1.4' }}>
                {cert.title}
              </h3>

              <div style={{ fontSize: '0.86rem', color: 'var(--cyan)', fontWeight: 600, marginBottom: '10px' }}>
                {cert.issuer}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {cert.details}
              </p>
            </div>

            {cert.credentialId && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', wordBreak: 'break-all' }}>
                <span>ID: {cert.credentialId}</span>
                <CheckCircle size={14} color="var(--emerald)" style={{ flexShrink: 0 }} />
              </div>
            )}
          </HoloCardTilt>
        ))}
      </div>
    </section>
  );
}
