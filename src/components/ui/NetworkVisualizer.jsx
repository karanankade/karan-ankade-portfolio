import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Server,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Terminal,
  Activity,
  Zap,
  Globe,
  Radio,
  Sliders,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Wifi,
  Search,
  BookOpen,
  Award,
  Database
} from 'lucide-react';
import { playHoverSound, playClickSound, playTerminalKeySound, playAccessGrantedSound, playErrorSound } from '../../utils/audioFX';

export default function NetworkVisualizer() {
  // ----------------------------------------------------
  // Core State
  // ----------------------------------------------------
  const [activeProtocol, setActiveProtocol] = useState('OSPF');
  const [isLinkBroken, setIsLinkBroken] = useState(false);
  const [packetHop, setPacketHop] = useState(0); // 0: idle, 1: PC->SW, 2: SW->R1, 3: R1->R2 (or R1->R4), 4: R2->Server (or R4->R2), 5: R2->Server (if backup), 6: Delivered
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeTab, setActiveTab] = useState('topology'); // topology, routing-table, interfaces, cli, subnetting, comparison

  // Step-by-step Protocol Stepper
  const [protocolStep, setProtocolStep] = useState(0);

  // Subnetting Calculator State
  const [subnetIP, setSubnetIP] = useState('192.168.1.100');
  const [subnetPrefix, setSubnetPrefix] = useState(26);

  // Ping Simulator State
  const [pingTarget, setPingTarget] = useState('172.16.1.100');
  const [pingLogs, setPingLogs] = useState([]);
  const [isPinging, setIsPinging] = useState(false);

  // Cisco CLI Terminal Simulator State
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState([
    { type: 'system', content: 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.4(3)M3, RELEASE SOFTWARE (fc2)' },
    { type: 'system', content: 'Technical Support: http://www.cisco.com/techsupport' },
    { type: 'system', content: 'Copyright (c) 1986-2026 by Cisco Systems, Inc.' },
    { type: 'prompt', content: 'NOC-Router-R1# show ip route' }
  ]);

  // Live Packet Counters for Interfaces
  const [interfaceCounters, setInterfaceCounters] = useState({
    'Gi0/0': { rx: 14280, tx: 13920, errors: 0, drops: 0 },
    'Gi0/1': { rx: 28910, tx: 27400, errors: 0, drops: 0 },
    'Gi0/2': { rx: 8420, tx: 8100, errors: 0, drops: 0 },
    'Gi0/3': { rx: 5120, tx: 4900, errors: 0, drops: 0 },
    'Fa0/1': { rx: 42100, tx: 41800, errors: 0, drops: 0 }
  });

  const canvasRef = useRef(null);
  const simulationTimerRef = useRef(null);

  // ----------------------------------------------------
  // Protocol Specifications Data
  // ----------------------------------------------------
  const protocols = {
    OSPF: {
      name: 'OSPF (Open Shortest Path First)',
      type: 'Link-State Protocol',
      algorithm: 'Dijkstra Shortest Path First (SPF)',
      metricName: 'Cost (10^8 / Bandwidth)',
      ad: 110,
      badgeColor: '#00ff88',
      accentBg: 'rgba(0, 255, 136, 0.15)',
      primaryCost: 10,
      backupCost: 20,
      steps: [
        { title: '1. Hello Packets', desc: 'Discovers neighbors via multicast 224.0.0.5 every 10 seconds.' },
        { title: '2. Neighbor Adjacency', desc: 'Transitions through Init -> 2-Way -> ExStart -> Exchange -> Full.' },
        { title: '3. LSA Flooding', desc: 'Floods Link-State Advertisements (Type 1 & 2) across Area 0.' },
        { title: '4. SPF Calculation', desc: 'Executes Dijkstra algorithm to construct shortest path tree.' },
        { title: '5. Routing Table Update', desc: 'Installs optimal metric routes into the IPv4 RIB.' }
      ]
    },
    RIP: {
      name: 'RIP v2 (Routing Information Protocol)',
      type: 'Distance-Vector Protocol',
      algorithm: 'Bellman-Ford Algorithm',
      metricName: 'Hop Count (Max 15 hops)',
      ad: 120,
      badgeColor: '#00f3ff',
      accentBg: 'rgba(0, 243, 255, 0.15)',
      primaryCost: 2,
      backupCost: 3,
      steps: [
        { title: '1. Periodic Updates', desc: 'Broadcasts entire routing table every 30s via UDP port 520.' },
        { title: '2. Distance Vector Exchange', desc: 'Receives hop vectors from adjacent directly connected peers.' },
        { title: '3. Hop Increment', desc: 'Adds +1 hop count for each intermediate router traversed.' },
        { title: '4. Bellman-Ford Evaluation', desc: 'Selects path with minimum hop count (Max 15; 16 = Unreachable).' },
        { title: '5. Routing Table Update', desc: 'Updates RIB entries and triggers poison reverse if link fails.' }
      ]
    },
    EIGRP: {
      name: 'EIGRP (Enhanced Interior Gateway Routing Protocol)',
      type: 'Advanced Distance-Vector / Hybrid',
      algorithm: 'DUAL (Diffusing Update Algorithm)',
      metricName: 'Composite Metric (Bandwidth & Delay)',
      ad: 90,
      badgeColor: '#9d4edd',
      accentBg: 'rgba(157, 78, 221, 0.15)',
      primaryCost: 156160,
      backupCost: 217240,
      steps: [
        { title: '1. Hello & Reliable Transport', desc: 'Establishes neighbor relationship using Reliable Transport Protocol (RTP).' },
        { title: '2. Partial Bounded Updates', desc: 'Sends partial topology updates only when metric or topology changes.' },
        { title: '3. DUAL Evaluation', desc: 'Calculates Feasible Distance (FD) and Reported Distance (RD).' },
        { title: '4. Successor Selection', desc: 'Identifies Primary Route (Successor) and Backup Route (Feasible Successor).' },
        { title: '5. Zero-Convergence Failover', desc: 'Instantly switches to Feasible Successor if primary link drops.' }
      ]
    }
  };

  const currentProto = protocols[activeProtocol];

  // ----------------------------------------------------
  // Background Cyber Grid & Particle Canvas Effect
  // ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle nodes
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#00f3ff' : '#00ff88'
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw particle mesh
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.12 - dist / 1000})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ----------------------------------------------------
  // Interface Counter Auto-Increment Simulator
  // ----------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setInterfaceCounters((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((iface) => {
          if (iface === 'Gi0/1' && isLinkBroken) {
            next[iface].drops += 1;
          } else {
            next[iface].rx += Math.floor(Math.random() * 12) + 2;
            next[iface].tx += Math.floor(Math.random() * 10) + 2;
          }
        });
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLinkBroken]);

  // ----------------------------------------------------
  // Packet Transit Controller & Failover Logic
  // ----------------------------------------------------
  const totalHops = isLinkBroken ? 6 : 4; // Backup route has 6 hop steps vs 4 primary

  const triggerPacketSimulation = () => {
    playClickSound();
    setIsSimulating(true);
    setIsPlaying(true);
    setPacketHop(1);

    runHopAnimation(1);
  };

  const runHopAnimation = (currentHop) => {
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);

    const maxHops = isLinkBroken ? 5 : 4;
    const baseDelay = 1200 / playbackSpeed;

    if (currentHop <= maxHops) {
      simulationTimerRef.current = setTimeout(() => {
        setPacketHop(currentHop + 1);
        if (currentHop + 1 <= maxHops) {
          runHopAnimation(currentHop + 1);
        } else {
          // Delivered
          playAccessGrantedSound();
          setIsSimulating(false);
          setIsPlaying(false);
        }
      }, baseDelay);
    }
  };

  const handleResetSimulation = () => {
    playClickSound();
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    setIsSimulating(false);
    setIsPlaying(false);
    setPacketHop(0);
  };

  const togglePlayPause = () => {
    playClickSound();
    if (isPlaying) {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      setIsPlaying(false);
    } else {
      if (packetHop === 0 || packetHop >= (isLinkBroken ? 5 : 4)) {
        triggerPacketSimulation();
      } else {
        setIsPlaying(true);
        runHopAnimation(packetHop);
      }
    }
  };

  const handleToggleLinkBreak = () => {
    playClickSound();
    const nextState = !isLinkBroken;
    setIsLinkBroken(nextState);
    if (nextState) {
      playErrorSound();
    } else {
      playAccessGrantedSound();
    }
    // Reset simulation
    handleResetSimulation();
  };

  // ----------------------------------------------------
  // Subnet Calculator Logic
  // ----------------------------------------------------
  const calculateSubnet = () => {
    try {
      const octets = subnetIP.split('.').map(Number);
      if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
        return null;
      }
      const prefix = Number(subnetPrefix);
      const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
      const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      const netInt = (ipInt & maskInt) >>> 0;
      const bcastInt = (netInt | (~maskInt >>> 0)) >>> 0;

      const intToIp = (val) => [val >>> 24, (val >>> 16) & 255, (val >>> 8) & 255, val & 255].join('.');

      const firstHostInt = prefix >= 31 ? netInt : netInt + 1;
      const lastHostInt = prefix >= 31 ? bcastInt : bcastInt - 1;
      const totalHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, Math.pow(2, 32 - prefix) - 2);

      const toBinStr = (val) => (val >>> 0).toString(2).padStart(32, '0');

      return {
        ip: subnetIP,
        prefix,
        subnetMask: intToIp(maskInt),
        networkAddr: intToIp(netInt),
        broadcastAddr: intToIp(bcastInt),
        firstHost: intToIp(firstHostInt),
        lastHost: intToIp(lastHostInt),
        totalHosts: totalHosts.toLocaleString(),
        wildcardMask: intToIp((~maskInt) >>> 0),
        ipBinary: toBinStr(ipInt),
        maskBinary: toBinStr(maskInt),
        netBinary: toBinStr(netInt)
      };
    } catch (e) {
      return null;
    }
  };

  const subnetResult = calculateSubnet();

  // ----------------------------------------------------
  // Interactive Terminal / CLI Logic
  // ----------------------------------------------------
  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    playTerminalKeySound();

    const cmd = cliInput.trim().toLowerCase();
    const newLogs = [...cliLogs, { type: 'prompt', content: `NOC-Router-R1# ${cliInput}` }];

    if (cmd === 'clear') {
      setCliLogs([]);
      setCliInput('');
      return;
    }

    if (cmd === 'help') {
      newLogs.push({
        type: 'output',
        content: `Available Cisco Commands:
  show ip route             - Display active IPv4 Routing Table
  show ip interface brief   - Display summary of interface status
  show ip ospf neighbor     - Display OSPF neighbor adjacencies
  show ip protocols         - Display active dynamic routing protocols
  show running-config       - Display router active configuration
  ping 172.16.1.100         - Test end-to-end ICMP reachability
  clear                     - Clear terminal buffer screen`
      });
    } else if (cmd === 'show ip route') {
      newLogs.push({
        type: 'output',
        content: `Codes: C - connected, S - static, R - RIP, D - EIGRP, O - OSPF

Gateway of last resort is not set

      10.0.0.0/30 is subnetted, 1 subnets
${isLinkBroken ? 'O        172.20.0.0/30 [110/20] via 172.20.0.2, 00:00:14, GigabitEthernet0/2' : 'O        10.0.0.0 [110/10] via 10.0.0.2, 00:14:22, GigabitEthernet0/1'}
      172.16.0.0/24 is subnetted, 1 subnets
${isLinkBroken ? 'O        172.16.1.0 [110/21] via 172.20.0.2, 00:00:12, GigabitEthernet0/2' : 'O        172.16.1.0 [110/11] via 10.0.0.2, 00:14:22, GigabitEthernet0/1'}
C     192.168.1.0/24 is directly connected, GigabitEthernet0/0
L     192.168.1.1/32 is directly connected, GigabitEthernet0/0`
      });
    } else if (cmd === 'show ip interface brief') {
      newLogs.push({
        type: 'output',
        content: `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up      
GigabitEthernet0/1     10.0.0.1        YES NVRAM  ${isLinkBroken ? 'down                  down' : 'up                    up'}    
GigabitEthernet0/2     172.20.0.1      YES NVRAM  up                    up      
FastEthernet0/1        192.168.1.2     YES NVRAM  up                    up`
      });
    } else if (cmd === 'show ip ospf neighbor') {
      newLogs.push({
        type: 'output',
        content: `Neighbor ID     Pri   State           Dead Time   Address         Interface
${isLinkBroken ? '172.20.0.2        1   FULL/BDR        00:00:34    172.20.0.2      GigabitEthernet0/2' : '10.0.0.2          1   FULL/DR         00:00:36    10.0.0.2        GigabitEthernet0/1'}`
      });
    } else if (cmd === 'show ip protocols') {
      newLogs.push({
        type: 'output',
        content: `Routing Protocol is "${activeProtocol.toLowerCase()} 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 192.168.1.1
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.0.0.2             ${currentProto.ad}      00:02:18
  Distance: (default is ${currentProto.ad})`
      });
    } else if (cmd === 'show running-config') {
      newLogs.push({
        type: 'output',
        content: `Building configuration...
Current configuration : 1240 bytes
!
hostname NOC-Router-R1
!
interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.0
 duplex auto
 speed auto
!
interface GigabitEthernet0/1
 ip address 10.0.0.1 255.255.255.252
 shutdown: ${isLinkBroken ? 'yes' : 'no'}
!
router ${activeProtocol.toLowerCase()} 1
 network 192.168.1.0 0.0.0.255 area 0
 network 10.0.0.0 0.0.0.3 area 0
!`
      });
    } else if (cmd.startsWith('ping')) {
      newLogs.push({
        type: 'output',
        content: `Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${cmd.split(' ')[1] || '172.16.1.100'}, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/3/6 ms`
      });
    } else {
      newLogs.push({
        type: 'output',
        content: `% Invalid input detected at '^' marker. Type 'help' for available commands.`
      });
    }

    setCliLogs(newLogs);
    setCliInput('');
  };

  // ----------------------------------------------------
  // Ping Simulator Action
  // ----------------------------------------------------
  const handleRunPingTest = () => {
    playClickSound();
    setIsPinging(true);
    setPingLogs([`Pinging ${pingTarget} with 32 bytes of data:`]);

    setTimeout(() => {
      setPingLogs((prev) => [...prev, `Reply from ${pingTarget}: bytes=32 time=4ms TTL=62`]);
    }, 400);

    setTimeout(() => {
      setPingLogs((prev) => [...prev, `Reply from ${pingTarget}: bytes=32 time=3ms TTL=62`]);
    }, 800);

    setTimeout(() => {
      setPingLogs((prev) => [...prev, `Reply from ${pingTarget}: bytes=32 time=5ms TTL=62`]);
    }, 1200);

    setTimeout(() => {
      setPingLogs((prev) => [
        ...prev,
        `Reply from ${pingTarget}: bytes=32 time=4ms TTL=62`,
        ``,
        `Ping statistics for ${pingTarget}:`,
        `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),`,
        `Approximate round trip times in milli-seconds:`,
        `    Minimum = 3ms, Maximum = 5ms, Average = 4ms`
      ]);
      setIsPinging(false);
      playAccessGrantedSound();
    }, 1600);
  };

  // Device Node Inventory
  const topologyNodes = {
    pc: {
      id: 'pc',
      name: 'Client PC1',
      type: 'End Device',
      ip: '192.168.1.100/24',
      status: 'ONLINE',
      cpu: '4%',
      mem: '28%',
      iface: 'Eth0',
      icon: LaptopIcon
    },
    sw: {
      id: 'sw',
      name: 'Access SW1',
      type: 'Layer 2 Switch',
      ip: '192.168.1.2/24 (VLAN 10)',
      status: 'ONLINE',
      cpu: '11%',
      mem: '32%',
      iface: 'Fa0/1 - Fa0/24',
      icon: Network
    },
    r1: {
      id: 'r1',
      name: 'Router R1 (Edge)',
      type: 'Cisco 2911 ISR',
      ip: '192.168.1.1 / 10.0.0.1',
      status: 'ONLINE',
      cpu: '18%',
      mem: '42%',
      iface: 'Gi0/0, Gi0/1, Gi0/2',
      icon: Server
    },
    r2: {
      id: 'r2',
      name: 'Router R2 (Core)',
      type: 'Cisco 3945 Core Router',
      ip: '10.0.0.2 / 172.16.1.1',
      status: 'ONLINE',
      cpu: '24%',
      mem: '54%',
      iface: 'Gi0/0, Gi0/1, Gi0/2',
      icon: Cpu
    },
    r4: {
      id: 'r4',
      name: 'Router R4 (Backup Gateway)',
      type: 'Cisco 2901 ISR Failover',
      ip: '172.20.0.1 / 172.20.0.2',
      status: isLinkBroken ? 'ACTIVE FAILOVER' : 'STANDBY',
      cpu: isLinkBroken ? '32%' : '8%',
      mem: '36%',
      iface: 'Gi0/0, Gi0/1',
      icon: Radio
    },
    server: {
      id: 'server',
      name: 'Web Server 1',
      type: 'Enterprise Web Host',
      ip: '172.16.1.100/24',
      status: 'ONLINE',
      cpu: '15%',
      mem: '61%',
      iface: 'Eth0 (10Gbps)',
      icon: HardDrive
    }
  };

  return (
    <section id="network-labs" style={{ background: '#0B1020', minHeight: '100vh', padding: '60px 0', color: '#f0f4f8', position: 'relative', overflow: 'hidden' }}>
      {/* Background Interactive Particle Mesh Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />

      <div className="section-container" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* ==================================================== */}
        {/* 1. HERO HEADER SECTION */}
        {/* ==================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 48px auto' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(0, 243, 255, 0.08)', border: '1px solid rgba(0, 243, 255, 0.25)', color: 'var(--cyan)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
            <Zap size={14} className="spin" /> Cisco CCNA Enterprise Routing Simulator
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px 0', background: 'linear-gradient(135deg, #ffffff 0%, #00f3ff 50%, #00ff88 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cisco Packet Routing Visualizer
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Interactive demonstration of CCNA routing concepts including OSPF, RIP, EIGRP, subnetting, routing metrics, packet forwarding, and failover recovery.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                playClickSound();
                document.getElementById('topology-canvas-area')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="cyber-btn"
            >
              <Network size={18} /> Explore Network
            </button>

            <button
              onClick={triggerPacketSimulation}
              disabled={isSimulating}
              className="cyber-btn"
              style={{ borderColor: 'var(--emerald)', background: 'rgba(0, 255, 136, 0.1)', color: '#ffffff' }}
            >
              <Play size={18} color="var(--emerald)" /> Send Packet
            </button>

            <button
              onClick={handleToggleLinkBreak}
              className="cyber-btn"
              style={{
                borderColor: isLinkBroken ? '#ff0055' : 'var(--amber)',
                background: isLinkBroken ? 'rgba(255, 0, 85, 0.2)' : 'rgba(255, 170, 0, 0.1)',
                color: isLinkBroken ? '#ff0055' : 'var(--amber)'
              }}
            >
              <AlertTriangle size={18} /> {isLinkBroken ? 'Repair Cable Link' : 'Simulate Link Failure'}
            </button>
          </div>
        </motion.div>

        {/* ==================================================== */}
        {/* 2. REAL-TIME STATS DASHBOARD COUNTERS */}
        {/* ==================================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          {[
            { label: 'Active Routers', value: '4', sub: 'R1, R2, R4, SW1', icon: Server, color: '#00f3ff' },
            { label: 'Connected Devices', value: '12', sub: 'PCs, Switch, Servers', icon: LaptopIcon, color: '#00ff88' },
            { label: 'Packet Delivery', value: isLinkBroken ? '99.2%' : '100%', sub: isLinkBroken ? 'Rerouted via R4' : 'Zero Loss', icon: CheckCircle2, color: '#00ff88' },
            { label: 'Average Latency', value: isLinkBroken ? '6.8 ms' : '4.2 ms', sub: isLinkBroken ? '+2.6ms Reroute' : 'Optimal Path', icon: Activity, color: '#9d4edd' },
            { label: 'Packet Loss', value: '0.00%', sub: 'Zero Drops', icon: ShieldAlert, color: '#00f3ff' },
            { label: 'Throughput', value: '1.2 Gbps', sub: 'Gi0/0 & Gi0/1', icon: Zap, color: '#ffaa00' },
            { label: 'CPU Utilization', value: isLinkBroken ? '32%' : '18%', sub: 'Normal Load', icon: Cpu, color: '#00f3ff' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="glass-panel"
              style={{ padding: '16px', textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{stat.label}</span>
                <stat.icon size={16} color={stat.color} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: stat.color, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard Card Wrapper */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', border: '1px solid rgba(0, 243, 255, 0.25)', marginBottom: '40px' }}>

          {/* ==================================================== */}
          {/* PROTOCOL SELECTOR TABS & NAVIGATION */}
          {/* ==================================================== */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.keys(protocols).map((pKey) => {
                const isSel = activeProtocol === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => {
                      playClickSound();
                      setActiveProtocol(pKey);
                      setProtocolStep(0);
                    }}
                    style={{
                      background: isSel ? protocols[pKey].accentBg : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSel ? protocols[pKey].badgeColor : 'rgba(255, 255, 255, 0.1)'}`,
                      color: isSel ? '#ffffff' : '#94a3b8',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Layers size={16} color={protocols[pKey].badgeColor} />
                    {pKey} Protocol
                  </button>
                );
              })}
            </div>

            {/* Sub-view Navigation Bar */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'topology', label: 'Network Topology', icon: Network },
                { id: 'routing-table', label: 'Routing Table', icon: Database },
                { id: 'interfaces', label: 'Interfaces', icon: Activity },
                { id: 'cli', label: 'Cisco CLI Terminal', icon: Terminal },
                { id: 'subnetting', label: 'Subnet Calculator', icon: Sliders },
                { id: 'comparison', label: 'Protocol Comparison', icon: BookOpen }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(tab.id);
                  }}
                  style={{
                    background: activeTab === tab.id ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                    border: `1px solid ${activeTab === tab.id ? 'var(--cyan)' : 'transparent'}`,
                    color: activeTab === tab.id ? 'var(--cyan)' : '#94a3b8',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: INTERACTIVE TOPOLOGY & ANIMATION CANVAS */}
          {/* ==================================================== */}
          {activeTab === 'topology' && (
            <div id="topology-canvas-area">
              {/* Alert Notification Banner */}
              <AnimatePresence>
                {isLinkBroken && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: 'rgba(255, 0, 85, 0.15)',
                      border: '1px solid #ff0055',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#ff3377',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={20} color="#ff0055" />
                      <span>
                        <b>LINK FAILURE DETECTED:</b> Cable between Router R1 (Gi0/1) and Router R2 (Gi0/0) is DOWN. Dynamic routing convergence triggered recalculation via Backup Gateway R4!
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#ff0055', color: '#fff', padding: '3px 8px', borderRadius: '4px' }}>
                      REROUTED VIA R4
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Topology Canvas Graphic Box */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '24px', borderRadius: '16px' }}>
                <div
                  style={{
                    background: 'rgba(5, 8, 24, 0.95)',
                    border: '1px solid rgba(0, 243, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '40px 20px 30px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: '600px'
                  }}
                >
                {/* Visual Connection Cables SVG Lines */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  {/* Primary Path Lines: PC -> SW -> R1 -> R2 -> Server */}
                  <line x1="12%" y1="65%" x2="28%" y2="65%" stroke="var(--cyan)" strokeWidth="3" strokeDasharray="4 2" />
                  <line x1="28%" y1="65%" x2="44%" y2="65%" stroke="var(--cyan)" strokeWidth="3" />

                  {/* R1 -> R2 Primary Link */}
                  <line
                    x1="44%"
                    y1="65%"
                    x2="72%"
                    y2="65%"
                    stroke={isLinkBroken ? '#ff0055' : currentProto.badgeColor}
                    strokeWidth={isLinkBroken ? '3' : '4'}
                    strokeDasharray={isLinkBroken ? '6 6' : 'none'}
                    style={{ transition: 'all 0.5s ease' }}
                  />

                  {/* Alternate Backup Route Lines: R1 -> R4 -> R2 */}
                  <line
                    x1="44%"
                    y1="65%"
                    x2="58%"
                    y2="25%"
                    stroke={isLinkBroken ? 'var(--emerald)' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isLinkBroken ? '3' : '2'}
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="58%"
                    y1="25%"
                    x2="72%"
                    y2="65%"
                    stroke={isLinkBroken ? 'var(--emerald)' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isLinkBroken ? '3' : '2'}
                    strokeDasharray="4 4"
                  />

                  {/* R2 -> Server */}
                  <line x1="72%" y1="65%" x2="88%" y2="65%" stroke="var(--cyan)" strokeWidth="3" />
                </svg>

                {/* Nodes Container */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '260px',
                    padding: '0 20px'
                  }}
                >
                  {/* Node 1: Client PC1 */}
                  <TopologyNode
                    node={topologyNodes.pc}
                    isActive={packetHop === 1}
                    isHovered={hoveredNode === 'pc'}
                    onHover={(id) => setHoveredNode(id)}
                    left="10%"
                    top="65%"
                  />

                  {/* Node 2: Access SW1 */}
                  <TopologyNode
                    node={topologyNodes.sw}
                    isActive={packetHop === 2}
                    isHovered={hoveredNode === 'sw'}
                    onHover={(id) => setHoveredNode(id)}
                    left="28%"
                    top="65%"
                  />

                  {/* Node 3: Router R1 (Edge) */}
                  <TopologyNode
                    node={topologyNodes.r1}
                    isActive={packetHop === 3}
                    isHovered={hoveredNode === 'r1'}
                    onHover={(id) => setHoveredNode(id)}
                    left="44%"
                    top="65%"
                  />

                  {/* Node 4: Backup Router R4 (Positioned Top Center) */}
                  <TopologyNode
                    node={topologyNodes.r4}
                    isActive={isLinkBroken && packetHop === 4}
                    isHovered={hoveredNode === 'r4'}
                    onHover={(id) => setHoveredNode(id)}
                    left="58%"
                    top="25%"
                    isBackup={true}
                  />

                  {/* Node 5: Router R2 (Core) */}
                  <TopologyNode
                    node={topologyNodes.r2}
                    isActive={(!isLinkBroken && packetHop === 4) || (isLinkBroken && packetHop === 5)}
                    isHovered={hoveredNode === 'r2'}
                    onHover={(id) => setHoveredNode(id)}
                    left="72%"
                    top="65%"
                  />

                  {/* Node 6: Web Server */}
                  <TopologyNode
                    node={topologyNodes.server}
                    isActive={(!isLinkBroken && packetHop === 5) || (isLinkBroken && packetHop === 6)}
                    isHovered={hoveredNode === 'server'}
                    onHover={(id) => setHoveredNode(id)}
                    left="88%"
                    top="65%"
                  />

                  {/* Floating Hop Tooltip Card */}
                  <AnimatePresence>
                    {isSimulating && packetHop > 0 && packetHop < (isLinkBroken ? 6 : 5) && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        style={{
                          position: 'absolute',
                          bottom: '15px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(10, 15, 35, 0.95)',
                          border: `1px solid ${currentProto.badgeColor}`,
                          borderRadius: '12px',
                          padding: '10px 20px',
                          boxShadow: `0 0 20px ${currentProto.badgeColor}44`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          zIndex: 20
                        }}
                      >
                        <Radio size={20} color={currentProto.badgeColor} className="spin" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                            Packet Hop #{packetHop}: {getHopDeviceName(packetHop, isLinkBroken)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', gap: '12px' }}>
                            <span>Src: 192.168.1.100</span>
                            <span>Dst: 172.16.1.100</span>
                            <span>TTL: {64 - packetHop}</span>
                            <span style={{ color: currentProto.badgeColor, fontWeight: 700 }}>Protocol: {activeProtocol}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

              {/* TIMELINE ANIMATION CONTROLS BAR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={togglePlayPause}
                    style={{
                      background: isPlaying ? 'rgba(255, 170, 0, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                      border: `1px solid ${isPlaying ? 'var(--amber)' : 'var(--emerald)'}`,
                      color: '#ffffff',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isPlaying ? <Pause size={18} color="var(--amber)" /> : <Play size={18} color="var(--emerald)" style={{ marginLeft: '2px' }} />}
                  </button>

                  <button
                    onClick={handleResetSimulation}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <RotateCcw size={18} />
                  </button>

                  <div style={{ marginLeft: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                      {packetHop === 0
                        ? 'Simulation Ready'
                        : packetHop >= (isLinkBroken ? 5 : 4)
                        ? 'Transmission Complete'
                        : `Transmitting Hop ${packetHop} of ${isLinkBroken ? 5 : 4}...`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {isLinkBroken ? 'Active Path: PC1 -> SW1 -> R1 -> R4 (Backup) -> R2 -> Server' : 'Active Path: PC1 -> SW1 -> R1 -> R2 (Core) -> Server'}
                    </div>
                  </div>
                </div>

                {/* Speed Toggle Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Speed:</span>
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        playClickSound();
                        setPlaybackSpeed(spd);
                      }}
                      style={{
                        background: playbackSpeed === spd ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${playbackSpeed === spd ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: playbackSpeed === spd ? '#000000' : '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* PROTOCOL STEPPER EXPLANATION */}
              <div style={{ background: 'rgba(5, 8, 20, 0.6)', padding: '24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color={currentProto.badgeColor} />
                    {currentProto.name} Convergence Execution Stepper
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: currentProto.badgeColor, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    AD Metric: {currentProto.ad}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {currentProto.steps.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        playClickSound();
                        setProtocolStep(idx);
                      }}
                      style={{
                        background: protocolStep === idx ? currentProto.accentBg : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${protocolStep === idx ? currentProto.badgeColor : 'rgba(255, 255, 255, 0.06)'}`,
                        padding: '14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: protocolStep === idx ? '#ffffff' : '#94a3b8', marginBottom: '6px' }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: LIVE UPDATING ROUTING TABLE */}
          {/* ==================================================== */}
          {activeTab === 'routing-table' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={20} color="var(--cyan)" />
                  Master IPv4 Routing Table (RIB) - Router R1
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Active Protocol: <b style={{ color: currentProto.badgeColor }}>{activeProtocol}</b>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0, 243, 255, 0.08)', color: 'var(--cyan)', borderBottom: '1px solid rgba(0, 243, 255, 0.2)' }}>
                      <th style={{ padding: '12px 16px' }}>Protocol</th>
                      <th style={{ padding: '12px 16px' }}>Destination Network</th>
                      <th style={{ padding: '12px 16px' }}>Next Hop IP</th>
                      <th style={{ padding: '12px 16px' }}>Admin Distance (AD)</th>
                      <th style={{ padding: '12px 16px' }}>Metric</th>
                      <th style={{ padding: '12px 16px' }}>Interface</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Directly Connected Routes */}
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--emerald)' }}>C</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>192.168.1.0/24</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Directly Connected</td>
                      <td style={{ padding: '12px 16px' }}>0</td>
                      <td style={{ padding: '12px 16px' }}>0</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>Gi0/0</td>
                      <td style={{ padding: '12px 16px', color: 'var(--emerald)', fontWeight: 600 }}>Active</td>
                    </tr>

                    {/* Dynamic Path - Primary or Backup depending on link status */}
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isLinkBroken ? 'rgba(255, 0, 85, 0.08)' : 'rgba(0, 255, 136, 0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: currentProto.badgeColor }}>
                        {activeProtocol === 'OSPF' ? 'O' : activeProtocol === 'RIP' ? 'R' : 'D'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>172.16.1.0/24</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: isLinkBroken ? 'var(--emerald)' : 'var(--cyan)' }}>
                        {isLinkBroken ? '172.20.0.2 (R4)' : '10.0.0.2 (R2)'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{currentProto.ad}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        {isLinkBroken ? currentProto.backupCost : currentProto.primaryCost}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                        {isLinkBroken ? 'Gi0/2 (Backup)' : 'Gi0/1 (Primary)'}
                      </td>
                      <td style={{ padding: '12px 16px', color: isLinkBroken ? 'var(--emerald)' : 'var(--cyan)', fontWeight: 600 }}>
                        {isLinkBroken ? 'Converged (R4)' : 'Optimal Path'}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--emerald)' }}>C</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>10.0.0.0/30</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Directly Connected</td>
                      <td style={{ padding: '12px 16px' }}>0</td>
                      <td style={{ padding: '12px 16px' }}>0</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>Gi0/1</td>
                      <td style={{ padding: '12px 16px', color: isLinkBroken ? '#ff0055' : 'var(--emerald)', fontWeight: 600 }}>
                        {isLinkBroken ? 'LINK DOWN' : 'Active'}
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--emerald)' }}>C</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>172.20.0.0/30</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Directly Connected</td>
                      <td style={{ padding: '12px 16px' }}>0</td>
                      <td style={{ padding: '12px 16px' }}>0</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>Gi0/2</td>
                      <td style={{ padding: '12px 16px', color: 'var(--emerald)', fontWeight: 600 }}>Active (Standby)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: INTERFACE STATUS DASHBOARD */}
          {/* ==================================================== */}
          {activeTab === 'interfaces' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--emerald)" />
                Router R1 Physical Interface Telemetry
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {Object.entries(interfaceCounters).map(([ifaceName, data]) => {
                  const isDown = ifaceName === 'Gi0/1' && isLinkBroken;
                  return (
                    <div
                      key={ifaceName}
                      style={{
                        background: 'rgba(5, 8, 20, 0.7)',
                        border: `1px solid ${isDown ? '#ff0055' : 'rgba(0, 243, 255, 0.2)'}`,
                        borderRadius: '12px',
                        padding: '18px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                          {ifaceName}
                        </div>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isDown ? 'rgba(255,0,85,0.2)' : 'rgba(0,255,136,0.2)',
                            color: isDown ? '#ff0055' : 'var(--emerald)',
                            border: `1px solid ${isDown ? '#ff0055' : 'var(--emerald)'}`
                          }}
                        >
                          {isDown ? 'DOWN' : 'UP (1 Gbps)'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
                        {ifaceName === 'Gi0/0' && 'LAN Gateway (192.168.1.1/24)'}
                        {ifaceName === 'Gi0/1' && 'Primary Core Trunk (10.0.0.1/30)'}
                        {ifaceName === 'Gi0/2' && 'Backup Failover Trunk (172.20.0.1/30)'}
                        {ifaceName === 'Gi0/3' && 'Management Port (10.254.0.1/24)'}
                        {ifaceName === 'Fa0/1' && 'Switch Access Link (192.168.1.2/24)'}
                      </div>

                      {/* Live Packet Counter Telemetry */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Rx Packets:</span>
                          <div style={{ color: 'var(--cyan)', fontWeight: 700 }}>{data.rx.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ color: '#94a3b8' }}>Tx Packets:</span>
                          <div style={{ color: 'var(--emerald)', fontWeight: 700 }}>{data.tx.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Traffic Load Animation Bar */}
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                          <span>Bandwidth Utilization</span>
                          <span>{isDown ? '0%' : '38%'}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: isDown ? '0%' : '38%',
                              background: isDown ? '#ff0055' : 'var(--cyan)',
                              boxShadow: isDown ? 'none' : '0 0 10px var(--cyan)',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: CISCO MINI CLI TERMINAL SIMULATOR */}
          {/* ==================================================== */}
          {activeTab === 'cli' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={20} color="var(--emerald)" />
                  Cisco IOS Command Line Interface (CLI) Simulator
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Type 'help' for command manual
                </span>
              </div>

              {/* Terminal Box */}
              <div
                style={{
                  background: '#05070f',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  color: '#00ff88',
                  minHeight: '340px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                }}
              >
                {cliLogs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {log.type === 'system' && <span style={{ color: '#94a3b8' }}>{log.content}</span>}
                    {log.type === 'prompt' && <span style={{ color: '#ffffff', fontWeight: 700 }}>{log.content}</span>}
                    {log.type === 'output' && <span style={{ color: '#00ff88' }}>{log.content}</span>}
                  </div>
                ))}

                {/* Interactive CLI Command Prompt Input Form */}
                <form onSubmit={handleCliSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>NOC-Router-R1#</span>
                  <input
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Enter Cisco command (e.g. show ip route, show ip interface brief)..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#00f3ff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.88rem'
                    }}
                  />
                </form>
              </div>

              {/* Quick CLI Preset Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                {['show ip route', 'show ip interface brief', 'show ip ospf neighbor', 'show ip protocols', 'show running-config'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setCliInput(cmd);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer'
                    }}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: SUBNETTING CALCULATOR & BINARY VISUALIZER */}
          {/* ==================================================== */}
          {activeTab === 'subnetting' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="var(--cyan)" />
                IPv4 Subnetting & Bitwise Binary Visualizer
              </h3>

              {/* Subnet Input Bar */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={subnetIP}
                    onChange={(e) => setSubnetIP(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(5, 8, 20, 0.8)',
                      border: '1px solid rgba(0, 243, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ width: '160px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                    Prefix (CIDR / Mask)
                  </label>
                  <select
                    value={subnetPrefix}
                    onChange={(e) => setSubnetPrefix(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(5, 8, 20, 0.8)',
                      border: '1px solid rgba(0, 243, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((prefixVal) => (
                      <option key={prefixVal} value={prefixVal}>
                        /{prefixVal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subnet Calculation Summary Cards */}
              {subnetResult ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { label: 'Network Address', val: subnetResult.networkAddr, color: 'var(--cyan)' },
                      { label: 'Broadcast Address', val: subnetResult.broadcastAddr, color: '#ffaa00' },
                      { label: 'First Host IP', val: subnetResult.firstHost, color: 'var(--emerald)' },
                      { label: 'Last Host IP', val: subnetResult.lastHost, color: 'var(--emerald)' },
                      { label: 'Total Usable Hosts', val: subnetResult.totalHosts, color: '#ffffff' },
                      { label: 'Subnet Mask', val: subnetResult.subnetMask, color: 'var(--purple)' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bitwise Binary Breakdown Box */}
                  <div style={{ background: 'rgba(5, 8, 20, 0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 243, 255, 0.2)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
                      32-Bit Binary Conversion & Network/Host Bit Division
                    </div>

                    <div style={{ marginBottom: '10px', display: 'flex', gap: '16px' }}>
                      <span style={{ width: '130px', color: '#94a3b8' }}>IP Address:</span>
                      <span style={{ color: 'var(--cyan)' }}>{formatBinaryWithPrefix(subnetResult.ipBinary, subnetResult.prefix)}</span>
                    </div>

                    <div style={{ marginBottom: '10px', display: 'flex', gap: '16px' }}>
                      <span style={{ width: '130px', color: '#94a3b8' }}>Subnet Mask:</span>
                      <span style={{ color: 'var(--purple)' }}>{formatBinaryWithPrefix(subnetResult.maskBinary, subnetResult.prefix)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                      <span style={{ width: '130px', color: '#94a3b8' }}>Bitwise AND Net:</span>
                      <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{formatBinaryWithPrefix(subnetResult.netBinary, subnetResult.prefix)}</span>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '20px', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
                        <span style={{ width: '10px', height: '10px', background: 'var(--cyan)', borderRadius: '2px' }}></span> Network Bits ({subnetResult.prefix})
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald)' }}>
                        <span style={{ width: '10px', height: '10px', background: 'var(--emerald)', borderRadius: '2px' }}></span> Host Bits ({32 - subnetResult.prefix})
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#ff0055' }}>Invalid IP Address format. Please check input.</div>
              )}
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: PROTOCOL COMPARISON MATRIX */}
          {/* ==================================================== */}
          {activeTab === 'comparison' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--purple)" />
                CCNA Dynamic Routing Protocol Comparison Matrix
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[
                  {
                    name: 'OSPF',
                    type: 'Link-State',
                    algo: 'Dijkstra Shortest Path First',
                    metric: 'Cost (Reference BW / Interface BW)',
                    speed: 'Fast (< 1s)',
                    scalability: 'Very High (Hierarchical Areas)',
                    ad: '110',
                    useCase: 'Enterprise Backbones & Large Multi-Vendor Networks',
                    color: '#00ff88'
                  },
                  {
                    name: 'RIP v2',
                    type: 'Distance-Vector',
                    algo: 'Bellman-Ford Algorithm',
                    metric: 'Hop Count (Max 15 Hops)',
                    speed: 'Slow (30s Periodic Timers)',
                    scalability: 'Low (< 15 Hops Max)',
                    ad: '120',
                    useCase: 'Small Simple Legacy Networks',
                    color: '#00f3ff'
                  },
                  {
                    name: 'EIGRP',
                    type: 'Advanced Distance-Vector',
                    algo: 'DUAL (Diffusing Update Algorithm)',
                    metric: 'Composite (Bandwidth + Delay)',
                    speed: 'Very Fast (< 500ms Instant Feasible Successor)',
                    scalability: 'High (Cisco Enterprise Networks)',
                    ad: '90',
                    useCase: 'Cisco Campus Networks & High Availability Environments',
                    color: '#9d4edd'
                  }
                ].map((proto, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(5, 8, 20, 0.7)',
                      border: `1px solid ${proto.color}44`,
                      borderRadius: '14px',
                      padding: '24px',
                      boxShadow: `0 8px 30px ${proto.color}15`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '1.4rem', color: proto.color, fontWeight: 800 }}>{proto.name}</h4>
                      <span style={{ fontSize: '0.75rem', background: `${proto.color}22`, color: proto.color, padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                        AD: {proto.ad}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Protocol Architecture</span>
                        <strong style={{ color: '#ffffff' }}>{proto.type}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Calculation Algorithm</span>
                        <strong style={{ color: '#ffffff' }}>{proto.algo}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Routing Metric</span>
                        <strong style={{ color: proto.color }}>{proto.metric}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Convergence Speed</span>
                        <strong style={{ color: '#ffffff' }}>{proto.speed}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Recommended Best Use Case</span>
                        <strong style={{ color: '#ffffff', lineHeight: 1.4 }}>{proto.useCase}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ==================================================== */}
        {/* PING SIMULATOR PANEL */}
        {/* ==================================================== */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(0, 243, 255, 0.2)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="var(--emerald)" /> ICMP Echo Ping Tester
            </h3>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                placeholder="172.16.1.100"
                style={{
                  background: 'rgba(5,8,20,0.8)',
                  border: '1px solid rgba(0,243,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              />
              <button
                onClick={handleRunPingTest}
                disabled={isPinging}
                className="cyber-btn"
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                {isPinging ? <RefreshCw size={14} className="spin" /> : <Play size={14} />} Ping Server
              </button>
            </div>
          </div>

          <div
            style={{
              background: '#04060e',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--emerald)',
              minHeight: '140px'
            }}
          >
            {pingLogs.length === 0 ? (
              <span style={{ color: '#94a3b8' }}>Click 'Ping Server' to execute ICMP echo test...</span>
            ) : (
              pingLogs.map((line, idx) => <div key={idx}>{line}</div>)
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* SKILLS & TECHNOLOGY BADGES SECTION */}
        {/* ==================================================== */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Technologies & Networking Concepts Demonstrated
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {[
              'Cisco CCNA',
              'OSPF',
              'RIP v2',
              'EIGRP',
              'IPv4 Subnetting',
              'Routing Metrics',
              'Cisco Packet Tracer',
              'Networking Protocols',
              'React',
              'TypeScript',
              'Tailwind CSS',
              'Framer Motion'
            ].map((badge, idx) => (
              <span key={idx} className="tech-tag" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                {badge}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ----------------------------------------------------
// Auxiliary Sub-Component: Topology Node Element
// ----------------------------------------------------
function TopologyNode({ node, isActive, isHovered, onHover, left, top, isBackup }) {
  const IconComponent = node.icon;

  return (
    <div
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 5
      }}
    >
      {/* Outer Glowing Node Circle */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.15, 1] : 1,
          boxShadow: isActive
            ? '0 0 30px #00ff88'
            : isBackup
            ? '0 0 15px rgba(255, 170, 0, 0.3)'
            : '0 0 15px rgba(0, 243, 255, 0.2)'
        }}
        transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
        style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 10px auto',
          borderRadius: '50%',
          background: isActive
            ? 'rgba(0, 255, 136, 0.25)'
            : isBackup
            ? 'rgba(255, 170, 0, 0.15)'
            : 'rgba(10, 15, 35, 0.95)',
          border: `2px solid ${isActive ? 'var(--emerald)' : isBackup ? 'var(--amber)' : 'var(--cyan)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <IconComponent size={30} color={isActive ? 'var(--emerald)' : isBackup ? 'var(--amber)' : 'var(--cyan)'} />

        {/* LED Status Pulse Dot */}
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isActive ? '#00ff88' : isBackup ? '#ffaa00' : '#00f3ff',
            boxShadow: `0 0 8px ${isActive ? '#00ff88' : isBackup ? '#ffaa00' : '#00f3ff'}`
          }}
        />
      </motion.div>

      {/* Hostname Label */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{node.name}</div>
      <div style={{ fontSize: '0.73rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
        {node.ip.split(' ')[0]}
      </div>

      {/* Hover Info Tooltip Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              bottom: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '210px',
              background: 'rgba(5, 8, 24, 0.95)',
              border: '1px solid var(--cyan)',
              borderRadius: '10px',
              padding: '12px',
              boxShadow: '0 8px 25px rgba(0, 243, 255, 0.3)',
              textAlign: 'left',
              zIndex: 30,
              fontSize: '0.78rem',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--cyan)', marginBottom: '4px', fontSize: '0.85rem' }}>{node.name}</div>
            <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Type: {node.type}</div>
            <div style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>IP: {node.ip}</div>
            <div style={{ color: 'var(--emerald)', marginBottom: '2px' }}>Status: {node.status}</div>
            <div style={{ color: '#94a3b8' }}>Interfaces: {node.iface}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--cyan)' }}>CPU: {node.cpu}</span>
              <span style={{ color: 'var(--purple)' }}>RAM: {node.mem}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Laptop Icon Helper
function LaptopIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

// Format Binary string with CIDR prefix divider
function formatBinaryWithPrefix(binStr, prefix) {
  const formatted = binStr.match(/.{1,8}/g).join('.');
  const netBits = binStr.slice(0, prefix);
  const hostBits = binStr.slice(prefix);

  return (
    <span>
      <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
        {netBits.match(/.{1,8}/g)?.join('.') || netBits}
      </span>
      <span style={{ color: 'var(--emerald)' }}>
        {hostBits.match(/.{1,8}/g)?.join('.') || hostBits}
      </span>
    </span>
  );
}

// Get Hop Device Name Helper
function getHopDeviceName(hop, isFailover) {
  if (!isFailover) {
    switch (hop) {
      case 1: return 'Client PC1 (192.168.1.100)';
      case 2: return 'Access Switch SW1 (192.168.1.2)';
      case 3: return 'Edge Router R1 (192.168.1.1)';
      case 4: return 'Core Router R2 (10.0.0.2)';
      case 5: return 'Web Server 1 (172.16.1.100)';
      default: return 'Network Node';
    }
  } else {
    switch (hop) {
      case 1: return 'Client PC1 (192.168.1.100)';
      case 2: return 'Access Switch SW1 (192.168.1.2)';
      case 3: return 'Edge Router R1 (192.168.1.1)';
      case 4: return 'Backup Router R4 (172.20.0.2)';
      case 5: return 'Core Router R2 (10.0.0.2)';
      case 6: return 'Web Server 1 (172.16.1.100)';
      default: return 'Network Node';
    }
  }
}
