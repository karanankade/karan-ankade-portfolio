import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, CornerDownLeft, Circle, Sparkles } from 'lucide-react';
import { personalInfo, projects, skills, certifications } from '../../data/portfolioData';
import { playTerminalKeySound, playClickSound } from '../../utils/audioFX';
import MatrixRain from './MatrixRain';

export default function LinuxTerminal() {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { text: 'Linux Interactive Shell v2.4 (RHEL 10 Simulator)', type: 'system' },
    { text: 'Type "help" to see available commands or tap quick commands below.', type: 'info' },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommandString = (cmdStr) => {
    playClickSound();
    const cmd = cmdStr.trim().toLowerCase();
    const newHistory = [...history, { text: `karan@rhel-host:~$ ${cmdStr}`, type: 'input' }];

    if (!cmd) {
      setHistory(newHistory);
      setInputVal('');
      return;
    }

    switch (cmd) {
      case 'help':
        newHistory.push({
          text: `AVAILABLE BASH COMMANDS:
- help       : Show this menu
- whoami     : Display developer summary
- ls         : List virtual directory contents
- cat skills : Output technical skill matrix
- projects   : List live portfolio projects
- certs      : Show CCNA & IIT Bombay credentials
- ping       : Ping developer network latency
- sudo get-resume : Download official PDF resume
- clear      : Clear terminal screen`,
          type: 'output'
        });
        break;

      case 'whoami':
        newHistory.push({
          text: `${personalInfo.name}
${personalInfo.tagline}
Location: ${personalInfo.location} | Education: SPPU B.E. Computer Engineering (Cyber Security Honours)`,
          type: 'output'
        });
        break;

      case 'ls':
        newHistory.push({
          text: `drwxr-xr-x 2 karan security 4096 Jul 30 12:00 projects/
drwxr-xr-x 2 karan security 4096 Jul 30 12:00 blogs/
drwxr-xr-x 2 karan security 4096 Jul 30 12:00 certs/
-rw-r--r-- 1 karan security 1024 Jul 30 12:00 skills.txt
-rwxr-xr-x 1 karan security  512 Jul 30 12:00 resume.pdf`,
          type: 'output'
        });
        break;

      case 'cat skills':
      case 'skills':
        newHistory.push({
          text: `TECHNICAL CAPABILITIES:
- Networking: CCNA, OSPF, EIGRP, BGP, Subnetting (VLSM/CIDR), Wireshark
- Cyber Security: Linux Hardening, SELinux, Firewalld, Nmap, Cryptography
- Development: React, Node.js, Express, MongoDB, REST APIs, Python
- Systems: Red Hat Enterprise Linux (RHEL 10), Bash Scripting, Git`,
          type: 'output'
        });
        break;

      case 'projects':
        newHistory.push({
          text: `FEATURED PROJECTS:
1. AI Threat Detection Dashboard (MERN + ML Analytics)
2. Enterprise Multi-Area OSPF & EIGRP Campus Simulation (Packet Tracer)
3. RHEL 10 SELinux & Firewalld Automated Hardening Script
4. Real-time Predictive Sales Analytics Engine (ARIMA / Python)`,
          type: 'output'
        });
        break;

      case 'certs':
        newHistory.push({
          text: `CERTIFICATIONS & CREDENTIALS:
- Cisco CCNA: Introduction to Networks (Dec 2025)
- Cisco CCNA: Switching, Routing & Wireless (Jul 2025)
- IIT Bombay: Python 3.4.3 Training & Test (Jan 2025)
- Microsoft Technology Associate: Security Fundamentals (Aug 2023)`,
          type: 'output'
        });
        break;

      case 'ping':
        newHistory.push({
          text: `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms
--- 127.0.0.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms`,
          type: 'output'
        });
        break;

      case 'sudo get-resume':
      case 'resume':
        if (personalInfo.portfolio) {
          window.open(personalInfo.portfolio, '_blank');
        }
        newHistory.push({
          text: `[AUTH] Downloading Karan Ankade Resume...`,
          type: 'system'
        });
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        newHistory.push({
          text: `bash: ${cmd}: command not found. Type "help" for a list of valid commands.`,
          type: 'error'
        });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommandString(inputVal);
    }
  };

  const quickCommands = ['help', 'whoami', 'ls', 'cat skills', 'projects', 'certs', 'ping', 'clear'];

  return (
    <section id="terminal" className="section-container" style={{ position: 'relative', zIndex: 10 }}>
      <div className="section-title">
        <Terminal color="var(--cyan)" size={32} />
        <h2>Interactive RHEL Bash Terminal</h2>
      </div>
      <p className="section-subtitle">
        Direct command-line interface to inspect Karan Ankade's system architecture, technical skill matrix, and project repositories.
      </p>

      {/* Terminal Window Container */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          width: '100%'
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header */}
        <div
          style={{
            background: 'rgba(5, 8, 20, 0.95)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Circle size={11} fill="#ff5f56" color="#ff5f56" />
            <Circle size={11} fill="#ffbd2e" color="#ffbd2e" />
            <Circle size={11} fill="#27c93f" color="#27c93f" />
            <span
              style={{
                marginLeft: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              karan@rhel10-sandbox:~ (bash)
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>
            ● ONLINE 100Mbps
          </div>
        </div>

        {/* Terminal Body */}
        <div
          style={{
            position: 'relative',
            padding: '18px 20px',
            minHeight: '280px',
            maxHeight: '380px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.8rem, 2.2vw, 0.92rem)',
            lineHeight: 1.6,
            background: 'rgba(7, 9, 19, 0.96)'
          }}
        >
          <MatrixRain />
          {history.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color:
                  item.type === 'input'
                    ? 'var(--cyan)'
                    : item.type === 'error'
                    ? '#ff4d4d'
                    : item.type === 'system'
                    ? 'var(--emerald)'
                    : 'var(--text-main)'
              }}
            >
              {item.text}
            </div>
          ))}

          {/* Active Input Line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <span style={{ color: 'var(--emerald)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>karan@rhel-host:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => {
                playTerminalKeySound();
                setInputVal(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: 'inherit',
                flex: 1,
                minWidth: '60px'
              }}
              placeholder="type a command..."
            />
            <CornerDownLeft size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Mobile Quick-Command Bar */}
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(10, 14, 28, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', marginRight: '4px' }}>
            Quick:
          </span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommandString(cmd)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                color: 'var(--cyan)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--cyan)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 243, 255, 0.08)';
                e.currentTarget.style.color = 'var(--cyan)';
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
