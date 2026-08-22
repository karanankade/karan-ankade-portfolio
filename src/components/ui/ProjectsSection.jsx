import React, { useState } from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { FolderGit2, ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';
import HoloCardTilt from './HoloCardTilt';
import { playClickSound, playHoverSound } from '../../utils/audioFX';

export default function ProjectsSection() {
  const { data } = usePortfolioData();
  const projects = data.projects || [];
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'AI / ML Analytics', 'Systems & Linux', 'Networking', 'MERN Stack', 'Cyber Security', 'Frontend Web'];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category?.toLowerCase().includes(activeFilter.toLowerCase()) || (activeFilter === 'MERN Stack' && p.category?.includes('MERN')));

  return (
    <section id="projects" className="section-container">
      <div className="section-title">
        <FolderGit2 color="var(--cyan)" size={32} />
        <h2>Featured Technical Projects</h2>
      </div>
      <p className="section-subtitle">
        Hands-on systems, networking labs, full-stack web applications, and AI analytics projects.
      </p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playClickSound();
              setActiveFilter(cat);
            }}
            onMouseEnter={() => playHoverSound()}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeFilter === cat ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
              color: activeFilter === cat ? '#000000' : 'var(--text-muted)',
              border: activeFilter === cat ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              minHeight: '40px'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid with 3D HoloCardTilt */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(1rem, 2vw, 1.75rem)'
        }}
      >
        {filteredProjects.map((project) => (
          <HoloCardTilt
            key={project.id}
            className="glass-panel"
            style={{
              padding: 'clamp(18px, 3vw, 24px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '18px'
            }}
          >
            {/* Top Row: Category Tag & Links */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="tech-tag">{project.category}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} GitHub Repository`}
                      style={{ color: 'var(--text-muted)', transition: 'color 0.2s', padding: '6px', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="GitHub Repository"
                    >
                      <Github size={19} />
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} Live Demo`}
                      style={{ color: 'var(--text-muted)', transition: 'color 0.2s', padding: '6px', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Live Demo"
                    >
                      <ExternalLink size={19} />
                    </a>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#ffffff', lineHeight: '1.4' }}>
                {project.title}
              </h3>

              {/* Highlights */}
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '18px' }}>
                {project.highlights?.map((hl, i) => (
                  <li key={i} style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.5' }}>
                    <CheckCircle2 size={14} color="var(--cyan)" style={{ marginTop: '4px', flexShrink: 0 }} />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
              {project.tech?.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0, 243, 255, 0.05)',
                    color: 'var(--cyan)',
                    border: '1px solid rgba(0, 243, 255, 0.15)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </HoloCardTilt>
        ))}
      </div>
    </section>
  );
}
