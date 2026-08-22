import React, { useState } from 'react';
import { usePortfolioData } from '../../data/portfolioStore';
import { Cpu, Network, ShieldCheck, Code, BrainCircuit, TerminalSquare } from 'lucide-react';
import HoloSkillSphere from '../3d/HoloSkillSphere';
import { playClickSound, playHoverSound } from '../../utils/audioFX';

export default function SkillsGrid() {
  const { data } = usePortfolioData();
  const skills = data.skills || {};
  const [activeTab, setActiveTab] = useState('networking');

  const tabOptions = [
    { id: 'networking', name: 'Networking & Protocols', icon: Network, color: '#00ff88' },
    { id: 'cybersecurity', name: 'Cyber Security', icon: ShieldCheck, color: '#00f3ff' },
    { id: 'development', name: 'MERN Stack & Dev', icon: Code, color: '#9d4edd' },
    { id: 'analyticsAndAi', name: 'AI & Data Science', icon: BrainCircuit, color: '#ff007f' },
    { id: 'operatingSystems', name: 'RHEL & Linux Admin', icon: TerminalSquare, color: '#ffaa00' },
  ];

  const currentSkills = skills[activeTab] || [];
  const currentTabObj = tabOptions.find(t => t.id === activeTab) || tabOptions[0];

  return (
    <section id="skills" className="section-container">
      <div className="section-title">
        <Cpu color="var(--purple)" size={32} />
        <h2>Technical Expertise & Skill Matrix</h2>
      </div>
      <p className="section-subtitle">
        Validated technical capabilities spanning computer networking, cybersecurity, full-stack software development, and AI engineering.
      </p>

      {/* 3D Holographic Interactive Skill Tag Sphere */}
      <div style={{ marginBottom: '32px', overflow: 'hidden' }}>
        <HoloSkillSphere />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {tabOptions.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
              }}
              onMouseEnter={() => playHoverSound()}
              style={{
                background: isSelected ? tab.color + '22' : 'rgba(14, 18, 36, 0.7)',
                border: `1px solid ${isSelected ? tab.color : 'rgba(255, 255, 255, 0.1)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                padding: '10px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.25s ease',
                minHeight: '42px'
              }}
            >
              <Icon size={16} color={tab.color} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(12px, 2vw, 18px)' }}>
        {currentSkills.map((skill, index) => (
          <div
            key={index}
            className="glass-panel"
            style={{
              padding: 'clamp(16px, 2.5vw, 20px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              borderLeft: `3px solid ${currentTabObj.color}`,
              borderRadius: '14px'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff', marginBottom: '4px' }}>
                {skill.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {skill.desc}
              </div>
            </div>

            {/* Proficiency Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Proficiency</span>
                <span style={{ color: currentTabObj.color, fontWeight: 700 }}>{skill.level}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${skill.level}%`,
                    height: '100%',
                    background: currentTabObj.color,
                    borderRadius: '3px',
                    boxShadow: `0 0 8px ${currentTabObj.color}`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
