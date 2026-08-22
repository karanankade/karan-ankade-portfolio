import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  Zap,
  Lock,
  AlertOctagon,
  Terminal,
  Radio,
  Eye,
  RefreshCw,
  Play,
  Filter,
  Server,
  Crosshair,
  Award
} from 'lucide-react';
import { playClickSound, playErrorSound, playAccessGrantedSound, playTerminalKeySound } from '../../utils/audioFX';

export default function ThreatRadarVisualizer() {
  // ----------------------------------------------------
  // Radar Sweep & Active Simulation State
  // ----------------------------------------------------
  const [rotation, setRotation] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackType, setAttackType] = useState(null); // 'DDoS' | 'BruteForce' | 'SQLi' | 'ZeroDay'
  const [selectedBlip, setSelectedBlip] = useState(null);
  const [logFilter, setLogFilter] = useState('ALL'); // ALL, CRITICAL, BLOCKED

  // Live Threat Log Feed
  const [logs, setLogs] = useState([
    { id: 1, time: 'JUST NOW', event: 'DDoS SYN-Flood Packet Storm (45,000 rps)', src: '185.220.101.4', status: 'MITIGATED', severity: 'CRITICAL', color: '#00ff88' },
    { id: 2, time: '3s ago', event: 'SSH Brute-Force Authentication Attempt', src: '194.26.29.112', status: 'IP BANNED', severity: 'HIGH', color: '#ffaa00' },
    { id: 3, time: '7s ago', event: 'WAF SQL Injection Payload Defeated', src: '45.142.214.8', status: 'BLOCKED', severity: 'HIGH', color: '#00f3ff' },
    { id: 4, time: '14s ago', event: 'RHEL 10 SELinux Policy Integrity Audit', src: 'Localhost', status: 'ENFORCED', severity: 'INFO', color: '#9d4edd' },
    { id: 5, time: '22s ago', event: 'Cisco Router OSPF LSA Cryptographic Handshake', src: '10.0.0.1', status: 'VERIFIED', severity: 'INFO', color: '#00ff88' }
  ]);

  // Radar Target Blips Coordinates on Circle
  const [blips, setBlips] = useState([
    { id: 'b1', name: 'DDoS Flood Origin', ip: '185.220.101.4', top: '28%', left: '72%', status: 'MITIGATED', severity: 'CRITICAL', color: '#00ff88', protocol: 'TCP/SYN' },
    { id: 'b2', name: 'SSH Scanner', ip: '194.26.29.112', top: '75%', left: '32%', status: 'BLOCKED', severity: 'HIGH', color: '#ffaa00', protocol: 'SSH/Port22' },
    { id: 'b3', name: 'WAF Exploit Attack', ip: '45.142.214.8', top: '48%', left: '84%', status: 'NEUTRALIZED', severity: 'HIGH', color: '#00f3ff', protocol: 'HTTP/WAF' },
    { id: 'b4', name: 'Canary Honeypot Probe', ip: '103.15.28.4', top: '65%', left: '60%', status: 'MONITORED', severity: 'MEDIUM', color: '#9d4edd', protocol: 'ICMP' }
  ]);

  // ----------------------------------------------------
  // Radar Sweeping Animation Interval
  // ----------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + (isAttacking ? 8 : 4)) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAttacking]);

  // ----------------------------------------------------
  // Trigger Simulated Attack
  // ----------------------------------------------------
  const handleSimulateAttack = (type) => {
    playClickSound();
    playErrorSound();
    setIsAttacking(true);
    setAttackType(type);

    const attackNames = {
      DDoS: 'DDoS Amplification Volumetric Attack (100 Gbps)',
      BruteForce: 'Credential Stuffing & SSH Brute-Force Botnet',
      SQLi: 'Advanced Blind SQL Injection Payload',
      ZeroDay: 'Zero-Day Buffer Overflow Exploit Vector'
    };

    const newLog = {
      id: Date.now(),
      time: 'JUST NOW',
      event: attackNames[type],
      src: `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      status: 'ATTACK IN PROGRESS',
      severity: 'CRITICAL',
      color: '#ff0055'
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 7)]);
  };

  // ----------------------------------------------------
  // Trigger Automated SOC Defense Mitigation
  // ----------------------------------------------------
  const handleMitigateThreat = () => {
    playAccessGrantedSound();
    setIsAttacking(false);
    setAttackType(null);

    setLogs((prev) =>
      prev.map((log, idx) =>
        idx === 0 && log.status === 'ATTACK IN PROGRESS'
          ? { ...log, status: 'AUTOMATED SOC DEFENSE ENFORCED', color: '#00ff88' }
          : log
      )
    );
  };

  // Filter logs based on category
  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'CRITICAL') return l.severity === 'CRITICAL';
    if (logFilter === 'BLOCKED') return l.status.includes('BLOCKED') || l.status.includes('MITIGATED') || l.status.includes('BANNED');
    return true;
  });

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        borderRadius: '20px',
        border: `1px solid ${isAttacking ? '#ff0055' : 'rgba(0, 243, 255, 0.3)'}`,
        boxShadow: isAttacking ? '0 0 35px rgba(255, 0, 85, 0.3)' : '0 10px 30px rgba(0, 243, 255, 0.1)',
        transition: 'all 0.5s ease'
      }}
    >
      {/* ==================================================== */}
      {/* 1. HEADER TITLE BAR */}
      {/* ==================================================== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radar color={isAttacking ? '#ff0055' : 'var(--cyan)'} size={28} className="spin-slow" />
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontFamily: 'var(--font-heading)' }}>
              SOC Cyber Defense Threat Radar & SIEM Engine
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Real-time Threat Intelligence • Automated Mitigation Playbooks • MITRE ATT&CK Coverage
            </span>
          </div>
        </div>

        {/* DEFCON / Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '5px 12px',
              borderRadius: '20px',
              background: isAttacking ? 'rgba(255, 0, 85, 0.2)' : 'rgba(0, 255, 136, 0.15)',
              color: isAttacking ? '#ff0055' : 'var(--emerald)',
              border: `1px solid ${isAttacking ? '#ff0055' : 'var(--emerald)'}`,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isAttacking ? '#ff0055' : 'var(--emerald)',
                boxShadow: `0 0 10px ${isAttacking ? '#ff0055' : 'var(--emerald)'}`
              }}
            />
            {isAttacking ? 'DEFCON 2 - ATTACK IN PROGRESS' : 'SYSTEM NOMINAL (SECURE)'}
          </span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. REAL-TIME STATS COUNTERS */}
      {/* ==================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Threats Neutralized', val: '1,428', sub: 'Last 24 Hours', color: 'var(--emerald)' },
          { label: 'Firewall Enforcements', val: '99.98%', sub: 'iptables / WAF', color: 'var(--cyan)' },
          { label: 'SIEM Response Time', val: '< 110ms', sub: 'Automated Trigger', color: 'var(--purple)' },
          { label: 'Honeypot Triggers', val: '42 Hits', sub: 'Decoy Active', color: '#ffaa00' },
          { label: 'Security Score', val: '98 / 100', sub: 'Hardened RHEL 10', color: 'var(--emerald)' }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'rgba(5, 8, 20, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{stat.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              {stat.val}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ==================================================== */}
      {/* 3. MAIN RADAR CANVAS & LIVE THREAT FEED GRID */}
      {/* ==================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left Box: Graphic Cyber Radar Visualizer */}
        <div
          style={{
            background: 'rgba(5, 8, 24, 0.95)',
            border: `1px solid ${isAttacking ? '#ff0055' : 'rgba(0, 243, 255, 0.2)'}`,
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Radar Circle */}
          <div
            style={{
              position: 'relative',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,243,255,0.06) 0%, rgba(5,8,20,0.95) 100%)',
              border: `2px solid ${isAttacking ? '#ff0055' : 'rgba(0, 243, 255, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 25px ${isAttacking ? '#ff005533' : 'rgba(0, 243, 255, 0.15)'}`
            }}
          >
            {/* Concentric Radar Rings */}
            <div style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '1px dashed rgba(0, 243, 255, 0.25)' }} />
            <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(0, 243, 255, 0.2)' }} />
            <div style={{ position: 'absolute', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(0, 243, 255, 0.3)' }} />

            {/* Crosshair Lines */}
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(0,243,255,0.25)' }} />
            <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(0,243,255,0.25)' }} />

            {/* Rotating Radar Sweeping Cone */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `conic-gradient(from ${rotation}deg at 50% 50%, ${isAttacking ? 'rgba(255,0,85,0.5)' : 'rgba(0,243,255,0.4)'} 0deg, rgba(0,243,255,0) 60deg)`
              }}
            />

            {/* Radar Target Blips */}
            {blips.map((blip) => {
              const isSelected = selectedBlip?.id === blip.id;
              return (
                <div
                  key={blip.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedBlip(blip);
                  }}
                  style={{
                    position: 'absolute',
                    top: blip.top,
                    left: blip.left,
                    width: isSelected ? '14px' : '10px',
                    height: isSelected ? '14px' : '10px',
                    borderRadius: '50%',
                    background: blip.color,
                    boxShadow: `0 0 ${isSelected ? '15px' : '8px'} ${blip.color}`,
                    cursor: 'pointer',
                    transform: 'translate(-50%, -50%)',
                    transition: 'all 0.3s ease',
                    zIndex: 10
                  }}
                  title={`${blip.name} (${blip.ip})`}
                />
              );
            })}
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => handleSimulateAttack('DDoS')}
              disabled={isAttacking}
              className="cyber-btn"
              style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: '#ff0055', background: 'rgba(255,0,85,0.1)', color: '#ff0055' }}
            >
              Simulate DDoS Surge
            </button>
            <button
              onClick={() => handleSimulateAttack('BruteForce')}
              disabled={isAttacking}
              className="cyber-btn"
              style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: 'var(--amber)', background: 'rgba(255,170,0,0.1)', color: 'var(--amber)' }}
            >
              SSH Brute-Force Test
            </button>
            {isAttacking && (
              <button
                onClick={handleMitigateThreat}
                className="cyber-btn"
                style={{ padding: '6px 14px', fontSize: '0.78rem', borderColor: 'var(--emerald)', background: 'rgba(0,255,136,0.2)', color: '#ffffff' }}
              >
                <ShieldCheck size={14} color="var(--emerald)" /> Trigger SOC Auto-Mitigation
              </button>
            )}
          </div>
        </div>

        {/* Right Box: Live SIEM Incident Log Feed */}
        <div style={{ background: 'rgba(5, 8, 20, 0.7)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--cyan)" />
              SIEM Security Telemetry Feed
            </h4>

            {/* Log Filter Selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'CRITICAL', 'BLOCKED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  style={{
                    background: logFilter === f ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
                    color: logFilter === f ? '#000000' : '#94a3b8',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Log Items Feed Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(5, 8, 24, 0.8)',
                  borderLeft: `3px solid ${log.color}`,
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>{log.event}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {log.time} • IP: {log.src}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: log.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* 4. MITRE ATT&CK FRAMEWORK COVERAGE MATRIX */}
      {/* ==================================================== */}
      <div style={{ background: 'rgba(5, 8, 20, 0.6)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h4 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} color="var(--purple)" />
          MITRE ATT&CK Defense Matrix Coverage & Automated Detection
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {[
            { tactic: 'Initial Access', tech: 'Spearphishing & WAF Exploit', coverage: '100% WAF Shielded', color: 'var(--emerald)' },
            { tactic: 'Execution', tech: 'Command & Script Interpreter', coverage: 'SELinux Enforced', color: 'var(--cyan)' },
            { tactic: 'Persistence', tech: 'Account & Service Creation', coverage: 'Auditd Monitored', color: 'var(--purple)' },
            { tactic: 'Privilege Escalation', tech: 'Sudo Abuse & Exploitation', coverage: 'Zero-Trust RBAC', color: 'var(--emerald)' },
            { tactic: 'Lateral Movement', tech: 'Remote SSH/RDP Spreading', coverage: 'OSPF Segmented', color: 'var(--amber)' }
          ].map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.tactic}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', margin: '2px 0' }}>{item.tech}</div>
              <div style={{ fontSize: '0.7rem', color: item.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{item.coverage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
