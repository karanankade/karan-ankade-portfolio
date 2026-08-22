import React from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { Briefcase, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';

export default function ExperienceTimeline() {
  const { data } = usePortfolioData();
  const experience = data.experience || [];
  const activeCourses = data.activeCourses || [];
  const personalInfo = data.personalInfo || {};
  return (
    <section id="experience" className="section-container">
      <div className="section-title">
        <Briefcase color="var(--cyan)" size={32} />
        <h2>Work Experience & Education</h2>
      </div>
      <p className="section-subtitle">
        Internships, academic milestones, and ongoing professional development programs.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(18px, 3vw, 30px)' }}>
        {/* Left Column: Work Experience */}
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--cyan)' }}>
            <Briefcase size={18} /> Professional Experience
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {experience.map((exp, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: 'clamp(16px, 2.5vw, 22px)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.08rem', color: '#ffffff', lineHeight: '1.3' }}>{exp.role}</h4>
                    <div style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '0.86rem' }}>{exp.company}</div>
                  </div>
                  <span className="tech-tag" style={{ fontSize: '0.72rem' }}>{exp.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px' }}>
                  {exp.points.map((pt, i) => (
                    <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.5' }}>
                      <CheckCircle2 size={14} color="var(--emerald)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Education & Course in Progress */}
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--purple)' }}>
            <GraduationCap size={18} /> Education & Specializations
          </h3>

          {/* Education Card */}
          {personalInfo.education && (
            <div className="glass-panel" style={{ padding: 'clamp(16px, 2.5vw, 22px)', marginBottom: '20px', borderRadius: '16px' }}>
              <span className="tech-tag" style={{ marginBottom: '10px', background: 'rgba(157, 78, 221, 0.15)', color: 'var(--purple)', borderColor: 'var(--purple)', fontSize: '0.72rem' }}>
                {personalInfo.education.period || 'Sep 2022 – Jul 2026'}
              </span>
              <h4 style={{ fontSize: '1.08rem', color: '#ffffff', marginBottom: '6px', lineHeight: '1.3' }}>
                {personalInfo.education.degree || 'Bachelor of Engineering in Computer Engineering'}
              </h4>
              <div style={{ color: 'var(--purple)', fontWeight: 600, fontSize: '0.86rem', marginBottom: '8px' }}>
                {personalInfo.education.institution || "Savitribai Phule Pune University (SPPU)"}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {personalInfo.education.details || "Specializing in Cyber Security & Network Systems. Academic Performance: 8.03 SGPA. Relevant Coursework: Computer Networks, Network Security, Operating Systems, Database Management Systems, Object-Oriented Programming, and Data Structures."}
              </p>
            </div>
          )}

          {/* Active Training & Certifications In Progress */}
          {activeCourses.length > 0 && (
            <div className="glass-panel" style={{ padding: 'clamp(16px, 2.5vw, 22px)', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--amber)" /> Professional Training Programs
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeCourses.map((course, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{course.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--amber)', background: 'rgba(255,170,0,0.15)', padding: '2px 8px', borderRadius: '10px' }}>{course.status}</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>{course.institution} • {course.period}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
