import React, { useState } from 'react';
import { usePortfolioData, portfolioStore } from '../../data/portfolioStore';
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Linkedin, ShieldCheck, AlertCircle } from 'lucide-react';
import { playClickSound, playHoverSound } from '../../utils/audioFX';

export default function ContactSection() {
  const { data } = usePortfolioData();
  const personalInfo = data.personalInfo || {};

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();
    setSubmitting(true);
    setStatus({ type: 'info', text: 'Encrypting and sending message to Karan...' });

    try {
      const res = await portfolioStore.addMessage(form);
      setSubmitting(false);
      if (res && res.success) {
        setStatus({ type: 'success', text: 'Message delivered successfully! I will respond to you shortly.' });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', text: res?.error || 'Failed to deliver message. Please reach out directly via email.' });
      }
    } catch (err) {
      setSubmitting(false);
      setStatus({ type: 'error', text: 'Network connection issue. Please send email directly to ' + (personalInfo.email || 'karanankade12@gmail.com') });
    }
  };

  return (
    <section id="contact" className="section-container">
      <div className="section-title">
        <Mail color="var(--cyan)" size={32} />
        <h2>Get In Touch & Security Inquiries</h2>
      </div>
      <p className="section-subtitle">
        Have a technical opportunity, security audit inquiry, or networking project? Send an encrypted message below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(20px, 4vw, 36px)' }}>
        {/* Left: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-panel" style={{ padding: 'clamp(20px, 3vw, 26px)', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--emerald)" /> Direct Contact Channels
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 243, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', border: '1px solid var(--cyan)', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                  <a href={`mailto:${personalInfo.email}`} style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', wordBreak: 'break-all' }}>
                    {personalInfo.email}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 255, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)', border: '1px solid var(--emerald)', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone / WhatsApp</div>
                  <a href={`tel:${personalInfo.phone}`} style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem' }}>
                    {personalInfo.phone}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(157, 78, 221, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple)', border: '1px solid var(--purple)', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.92rem' }}>
                    {personalInfo.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="glass-panel" style={{ padding: 'clamp(18px, 3vw, 24px)', borderRadius: '18px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#ffffff' }}>Professional Profiles</h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-btn cyber-btn-outline"
                  style={{ flex: 1, padding: '10px', fontSize: '0.84rem', justifyContent: 'center', minHeight: '44px' }}
                >
                  <Linkedin size={16} /> LinkedIn
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-btn cyber-btn-outline"
                  style={{ flex: 1, padding: '10px', fontSize: '0.84rem', justifyContent: 'center', minHeight: '44px' }}
                >
                  <Github size={16} /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="glass-panel" style={{ padding: 'clamp(20px, 3.5vw, 30px)', borderRadius: '18px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Your Name *</label>
              <input
                id="contact-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Your Email Address *</label>
              <input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@company.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label htmlFor="contact-subject" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Subject</label>
              <input
                id="contact-subject"
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Security Engineer Role / Collaboration"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Your Message *</label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your project, role details, or inquiry..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', resize: 'vertical' }}
              />
            </div>

            {status.text && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: status.type === 'success' ? 'rgba(0,255,136,0.12)' : status.type === 'error' ? 'rgba(255,77,77,0.15)' : 'rgba(0,243,255,0.1)',
                  border: status.type === 'success' ? '1px solid var(--emerald)' : status.type === 'error' ? '1px solid #ff4d4d' : '1px solid var(--cyan)',
                  color: status.type === 'success' ? 'var(--emerald)' : status.type === 'error' ? '#ff6b6b' : 'var(--cyan)'
                }}
              >
                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{status.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              onMouseEnter={() => playHoverSound()}
              className="cyber-btn"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', minHeight: '48px' }}
            >
              <Send size={16} /> {submitting ? 'Sending...' : 'Transmit Encrypted Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
