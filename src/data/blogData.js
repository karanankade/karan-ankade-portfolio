export const initialBlogs = [
  {
    id: "blog-1",
    slug: "hardening-linux-rhel-selinux-firewalld",
    title: "Hardening Enterprise Linux: SELinux Policies & Firewalld Zone Defenses",
    category: "Linux & Security",
    excerpt: "A practical guide to securing Red Hat Enterprise Linux (RHEL) using custom SELinux contexts, booleans, and multi-zone Firewalld network filters.",
    coverGradient: "linear-gradient(135deg, #00f3ff 0%, #0066ff 100%)",
    readTime: "6 min read",
    tags: ["RHEL 10", "SELinux", "Firewalld", "Cyber Security", "Linux Admin"],
    views: 420,
    likes: 56,
    published: true,
    featured: true,
    createdAt: "2026-08-15T10:00:00.000Z",
    content: `
### Introduction: Enterprise Linux Defense-in-Depth

Securing enterprise operating systems requires a proactive defense-in-depth approach. Default Linux installations often leave non-essential ports listening and default file permissions permissive. In this guide, we dive deep into **Security-Enhanced Linux (SELinux)** and **Firewalld** hardening techniques on Red Hat Enterprise Linux (RHEL).

---

### 1. Enforcing SELinux & Context Management

SELinux implements Mandatory Access Control (MAC), confining applications to least privilege:

\`\`\`bash
# Check current SELinux status
sestatus

# Verify enforcing mode in /etc/selinux/config
SELINUX=enforcing
SELINUXTYPE=targeted
\`\`\`

#### Restoring and Customizing File Contexts
When deploying custom web directories or API services, context mismatches cause permission denials:

\`\`\`bash
# Assign the correct httpd content context
semanage fcontext -a -t httpd_sys_content_t "/var/www/custom(/.*)?"
restorecon -Rv /var/www/custom
\`\`\`

#### Toggling Essential SELinux Booleans
\`\`\`bash
# Allow web servers to connect to network databases (e.g. MongoDB/MySQL)
setsebool -P httpd_can_network_connect_db 1

# Allow web server to send email via SMTP
setsebool -P httpd_can_sendmail 1
\`\`\`

---

### 2. Micro-Segmentation with Firewalld Zones

Firewalld dynamically divides network interfaces into security zones:

\`\`\`bash
# List active zones and rules
firewall-cmd --get-active-zones

# Bind internal interface to internal zone with strict rules
firewall-cmd --zone=internal --add-interface=eth1 --permanent
firewall-cmd --zone=public --remove-service=ssh --permanent

# Create custom rich rules for management subnet access only
firewall-cmd --permanent --zone=public --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'

# Reload to apply runtime configuration
firewall-cmd --reload
\`\`\`

---

### 3. Security Hardening Configuration Matrix

| Layer | Configuration Target | Hardening Tool | Expected Security Baseline |
| :--- | :--- | :--- | :--- |
| **Access Control** | Process Isolation | SELinux (MAC) | Enforcing Mode (Targeted Policy) |
| **Network Boundary** | Port Filtering | Firewalld Rich Rules | Default Drop with Subnet Whitelisting |
| **Integrity** | Binary Tampering | AIDE (Advanced Intrusion) | Daily Cron Hash Database Audit |
| **Audit Logs** | Syscall Interceptions | Auditd & ausearch | AVC Denials Aggregation in SIEM |

---

### 4. Automated Auditing with ausearch & auditd

Analyze SELinux denials using audit logs:
\`\`\`bash
# Search for AVC denials in the last 24 hours
ausearch -m avc -ts today

# Generate policy recommendations with audit2why
ausearch -m avc -ts today | audit2why

# Create custom TE policy module if authorized
ausearch -c 'node' --raw | audit2allow -M custom_node_policy
semodule -i custom_node_policy.pp
\`\`\`

### Summary & Takeaways
By combining SELinux type enforcement with strict Firewalld rich rules and auditd monitoring, you transform standard RHEL servers into resilient, breach-resistant systems.
    `
  },
  {
    id: "blog-2",
    slug: "ospf-vs-eigrp-dynamic-routing-ccna",
    title: "OSPF vs EIGRP: Architectural Deep Dive & Cisco Routing Labs",
    category: "Networking",
    excerpt: "Comparing Link-State (OSPF) vs Advanced Distance Vector (EIGRP) protocols: convergence metrics, metric calculations, and Packet Tracer verification.",
    coverGradient: "linear-gradient(135deg, #00ff88 0%, #00aa55 100%)",
    readTime: "7 min read",
    tags: ["Cisco CCNA", "OSPF", "EIGRP", "Packet Tracer", "Routing"],
    views: 580,
    likes: 82,
    published: true,
    featured: true,
    createdAt: "2026-08-10T14:30:00.000Z",
    content: `
### Understanding Dynamic Routing Protocols in Modern Networks

In dynamic routing, choosing between **Open Shortest Path First (OSPF)** and **Enhanced Interior Gateway Routing Protocol (EIGRP)** is a fundamental architecture decision for network engineers.

---

### 1. Protocol Comparison Matrix

| Feature | OSPF (Open Standard / RFC 2328) | EIGRP (Cisco Advanced Distance Vector) |
| :--- | :--- | :--- |
| **Algorithm** | Dijkstra Shortest Path First (SPF) | DUAL (Diffusing Update Algorithm) |
| **Metric** | Cost (Reference Bandwidth / Interface Bandwidth) | Composite: Bandwidth + Delay (MTU/Reliability) |
| **Convergence** | Fast (Hierarchical Area Model) | Ultra-Fast (Feasible Successors in Topology Table) |
| **Hierarchy** | Backbone (Area 0) Required | Flat or Autonomous System Hierarchies |
| **Multicast IP** | 224.0.0.5 & 224.0.0.6 (DR/BDR) | 224.0.0.10 |
| **Administrative Dist** | 110 (Internal & External) | 90 (Internal), 170 (External) |

---

### 2. Configuring Multi-Area OSPF on Cisco IOS

\`\`\`ios
Router(config)# router ospf 1
Router(config-router)# router-id 1.1.1.1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# network 192.168.10.0 0.0.0.255 area 1
Router(config-router)# auto-cost reference-bandwidth 1000
Router(config-router)# exit
\`\`\`

#### Verifying OSPF Neighbors & Link State Database
\`\`\`ios
Router# show ip ospf neighbor
Router# show ip ospf database
Router# show ip route ospf
\`\`\`

---

### 3. Configuring EIGRP with Named Mode

\`\`\`ios
Router(config)# router eigrp CORPORATE_NET
Router(config-router)# address-family ipv4 unicast autonomous-system 100
Router(config-router-af)# network 10.0.0.0 0.0.0.255
Router(config-router-af)# network 172.16.0.0 0.0.255.255
Router(config-router-af)# metric weights 0 1 0 1 0 0
Router(config-router-af)# exit
\`\`\`

#### Verifying EIGRP Feasibility Condition
\`\`\`ios
Router# show ip eigrp neighbors
Router# show ip eigrp topology
Router# show ip route eigrp
\`\`\`

---

### 4. Convergence & Failover Analysis

* **OSPF Convergence**: When an adjacency drops, an LSA (Link-State Advertisement) is flooded across the area. Every router recalculates the SPF tree using Dijkstra's algorithm.
* **EIGRP Feasible Successors**: If a primary route (Successor) fails, EIGRP immediately switches to the backup route (Feasible Successor) with zero delay because the Feasibility Condition ($RD < FD_{successor}$) was pre-verified.

### Summary & Best Practices
* **Use OSPF** for multi-vendor enterprise environments and large campus architectures requiring strict area containment.
* **Use EIGRP** for pure Cisco networks where instantaneous failover via precalculated feasible successors is critical.
    `
  },
  {
    id: "blog-3",
    slug: "defending-cloud-ingress-with-suricata-snort-ids",
    title: "Defending Cloud Ingress with Suricata & Snort 3 Network IDS/IPS",
    category: "Cyber Security",
    excerpt: "Comprehensive guide to configuring network intrusion detection systems, signature rule writing, and analyzing PCAP telemetry for real-time threat neutralization.",
    coverGradient: "linear-gradient(135deg, #00f3ff 0%, #9d4edd 100%)",
    readTime: "8 min read",
    tags: ["Suricata", "Snort 3", "IDS/IPS", "Network Security", "Threat Hunting"],
    views: 495,
    likes: 67,
    published: true,
    featured: true,
    createdAt: "2026-08-08T11:20:00.000Z",
    content: `
### Introduction: Deep Packet Inspection & Anomaly Detection

Modern network security architectures require proactive ingress monitoring. Network Intrusion Detection & Prevention Systems (**NIDS/NIPS**) analyze raw Ethernet packets in real-time, detecting malicious exploits, port scans, and command-and-control (C2) beacons.

---

### 1. Suricata vs. Snort 3 Architectural Comparison

| Feature | Suricata 7 | Snort 3 |
| :--- | :--- | :--- |
| **Threading Model** | Native Multi-Threaded (Pipelined / AutoFP) | Multi-Threaded Engine via DAQ Modules |
| **Output Logging** | EVE JSON (Elasticsearch/SIEM ready) | Unified2, JSON, syslog |
| **Hardware Acceleration** | AF_PACKET, DPDK, PF_RING | DPDK, AF_PACKET, DAQ 3.0 |
| **Protocol Parsing** | Rust-based HTTP/2, TLS, DNS, SMB | C++ Inspector Plugins |

---

### 2. Installing and Tuning Suricata with AF_PACKET

\`\`\`bash
# Install Suricata on RHEL/Rocky Linux
sudo dnf install epel-release -y
sudo dnf install suricata -y

# Configure High-Speed AF_PACKET capture in /etc/suricata/suricata.yaml
af-packet:
  - interface: eth0
    threads: auto
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes
    use-mmap: yes
    mmap-locked: yes
\`\`\`

---

### 3. Writing Custom Detection Signatures

Crafting targeted rules allows detection of zero-day exploits and brute-force scans:

#### Detecting Ingress TCP SYN Port Scans
\`\`\`snort
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"SCAN Potential Nmap Stealth SYN Scan"; flags:S,12; threshold:type both, track by_src, count 20, seconds 5; classtype:attempted-recon; sid:1000001; rev:1;)
\`\`\`

#### Detecting SQL Injection in HTTP GET Parameters
\`\`\`snort
alert http $EXTERNAL_NET any -> $HTTP_SERVERS any (msg:"EXPLOIT Potential SQLi via UNION SELECT"; flow:to_server,established; content:"UNION",nocase; http_uri; content:"SELECT",nocase; http_uri; classtype:web-application-attack; sid:1000002; rev:1;)
\`\`\`

---

### 4. Analyzing Alert Telemetry in EVE JSON

Suricata outputs rich JSON events to \`/var/log/suricata/eve.json\`:

\`\`\`bash
# Real-time monitoring of triggered alerts with jq
tail -f /var/log/suricata/eve.json | jq 'select(.event_type=="alert") | {timestamp, src_ip: .src_ip, dest_ip: .dest_ip, alert: .alert.signature, severity: .alert.severity}'
\`\`\`

### Summary
By deploying multi-threaded Suricata sensors at your network perimeter and feeding structured EVE JSON events into your SIEM, you achieve immediate situational awareness across all ingress traffic.
    `
  },
  {
    id: "blog-4",
    slug: "time-series-forecasting-arima-sales-predictive-analytics",
    title: "Time-Series Forecasting: Building ARIMA Predictive Models with Python",
    category: "AI & Data Science",
    excerpt: "End-to-end guide on building statistical ARIMA models for forecasting enterprise sales trends with stationarity testing and RMSE validation.",
    coverGradient: "linear-gradient(135deg, #ff007f 0%, #9d4edd 100%)",
    readTime: "8 min read",
    tags: ["Python", "ARIMA", "Statsmodels", "Pandas", "Predictive Analytics"],
    views: 512,
    likes: 71,
    published: true,
    featured: false,
    createdAt: "2026-08-04T09:15:00.000Z",
    content: `
### Predictive Analytics with Time-Series Modeling

Time-series forecasting is essential for inventory planning, financial modeling, and demand prediction. The **AutoRegressive Integrated Moving Average (ARIMA)** model provides an interpretable statistical foundation for stationary data sequences.

---

### 1. The ARIMA(p, d, q) Architecture

* **p (AutoRegressive order)**: Lags of the dependent variable included in the regression equation.
* **d (Degree of Differencing)**: Number of non-seasonal differences needed to achieve weak stationarity.
* **q (Moving Average order)**: Lagged forecast errors and residuals in the model.

---

### 2. Checking Stationarity with Augmented Dickey-Fuller (ADF)

\`\`\`python
import pandas as pd
from statsmodels.tsa.stattools import adfuller

def check_stationarity(series):
    result = adfuller(series.dropna())
    print(f"ADF Statistic: {result[0]:.4f}")
    print(f"p-value: {result[1]:.4f}")
    if result[1] <= 0.05:
        print("=> The series is stationary (Reject H0).")
    else:
        print("=> The series is non-stationary (Differencing required).")
\`\`\`

---

### 3. Model Training & Evaluation in Python

\`\`\`python
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error, mean_absolute_error
import numpy as np

# Fit ARIMA(1, 1, 1) model
model = ARIMA(train_data, order=(1, 1, 1))
fitted_model = model.fit()

# Out-of-sample forecast for 12 months
predictions = fitted_model.forecast(steps=len(test_data))

# Validation metrics
rmse = np.sqrt(mean_squared_error(test_data, predictions))
mae = mean_absolute_error(test_data, predictions)

print(f"Test RMSE: {rmse:.2f} | MAE: {mae:.2f}")
\`\`\`

---

### 4. Forecasting Model Evaluation Matrix

| Model | Parameters (p,d,q) | Test RMSE | Mean Absolute Error (MAE) | AIC Score |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline AR** | (1, 0, 0) | 14.82 | 11.20 | 542.1 |
| **ARIMA(1, 1, 1)** | (1, 1, 1) | **6.45** | **4.80** | **418.3** |
| **SARIMA(1,1,1)(1,1,0)** | Seasonal (12) | **5.12** | **3.95** | **392.7** |

### Key Takeaways
Proper differencing ($d=1$) removes linear seasonality trends, enabling stable long-term predictions with minimum variance.
    `
  },
  {
    id: "blog-5",
    slug: "securing-mern-rest-apis-jwt-helmet-cors",
    title: "Securing MERN Stack RESTful APIs: JWT, Rate Limiting & Helmet Guardrails",
    category: "Full-Stack & MERN",
    excerpt: "Best practices for hardening Express.js & MongoDB APIs against injection, CSRF, DDoS attacks, and token tampering.",
    coverGradient: "linear-gradient(135deg, #9d4edd 0%, #00f3ff 100%)",
    readTime: "5 min read",
    tags: ["MERN", "Express.js", "Node.js", "MongoDB", "Web Security"],
    views: 635,
    likes: 94,
    published: true,
    featured: true,
    createdAt: "2026-07-28T16:00:00.000Z",
    content: `
### Building Production-Grade REST APIs with Defensive Engineering

When deploying modern Node.js and Express backend microservices, defensive coding is critical to safeguard user sessions and prevent database exposure.

---

### 1. HTTP Security Headers with Helmet

\`\`\`javascript
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Apply secure HTTP headers
app.use(helmet());

// Apply global rate limiting (e.g. 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);
\`\`\`

---

### 2. Tamper-Proof HMAC-SHA256 Token Verification

\`\`\`javascript
import crypto from 'crypto';

export const verifyAdminSession = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.substring(7).trim();
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    return res.status(401).json({ error: 'Malformed token structure' });
  }

  const expectedSig = crypto
    .createHmac('sha256', process.env.ADMIN_JWT_SECRET)
    .update(\`\${header}.\${payload}\`)
    .digest('base64url');

  // Constant-time signature comparison to prevent timing attacks
  const bufExpected = Buffer.from(expectedSig);
  const bufSig = Buffer.from(signature);

  if (bufExpected.length !== bufSig.length || !crypto.timingSafeEqual(bufExpected, bufSig)) {
    return res.status(403).json({ error: 'Invalid or forged token signature' });
  }

  req.admin = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  next();
};
\`\`\`

---

### 3. API Hardening Checklist

| Defense Layer | Threat Model | Implementation Strategy |
| :--- | :--- | :--- |
| **Authentication** | Session Hijacking | Signed HMAC-SHA256 Bearer Token (12h TTL) |
| **Rate Limiting** | Brute-force / DoS | Express Rate Limiter with 45s OTP Cooldown |
| **Headers** | XSS / Clickjacking | Helmet Content Security Policy & X-Frame Options |
| **Database** | NoSQL Injection | Strict Mongoose Schema Sanitization & Query Whitelisting |

### Conclusion
Combining cryptographic signature verification with rate limiters and strict Mongoose schemas creates a secure backend foundation.
    `
  },
  {
    id: "blog-6",
    slug: "cyber-defense-soc-packet-analysis-wireshark",
    title: "SOC Operations: Deep Packet Analysis & Threat Hunting with Wireshark",
    category: "Cyber Security",
    excerpt: "Hands-on guide to analyzing PCAP packet captures, identifying ARP spoofing, TCP reset attacks, and extracting malware payloads.",
    coverGradient: "linear-gradient(135deg, #00f3ff 0%, #ff007f 100%)",
    readTime: "7 min read",
    tags: ["Wireshark", "PCAP Analysis", "SOC", "Threat Hunting", "Cyber Security"],
    views: 450,
    likes: 64,
    published: true,
    featured: false,
    createdAt: "2026-07-20T12:00:00.000Z",
    content: `
### The Role of Packet Capture in Security Operations Centers

In a Security Operations Center (SOC), log telemetry shows **what** happened, but network packet captures (**PCAP**) show **how** it happened at the wire level.

---

### 1. Essential Wireshark Display Filters

| Filter Syntax | Investigation Purpose |
| :--- | :--- |
| \`ip.addr == 192.168.1.50 && tcp.flags.syn == 1\` | Isolate SYN scan initiation packets |
| \`http.request.method == "POST" || http.response.code >= 400\` | Filter HTTP upload payloads & error anomalies |
| \`dns.flags.response == 0 && dns.qry.name contains "c2"\` | Identify DNS tunneling and C2 domain lookups |
| \`arp.duplicate-address-frame\` | Detect active ARP Cache Poisoning / Man-In-The-Middle |

---

### 2. Detecting ARP Poisoning Attacks

When an adversary executes an ARP spoofing attack, unsolicited ARP replies map the gateway IP to the attacker's MAC address:

\`\`\`bash
# Filter Wireshark capture for gratuitous ARP anomalies
arp.opcode == 2 && arp.duplicate-address-frame
\`\`\`

---

### 3. Extracting Malicious Payloads from TCP Streams

\`\`\`bash
# Extract files directly using tshark CLI
tshark -r incident_capture.pcap --export-objects http,./extracted_files/

# Compute SHA-256 hash of extracted payload for VirusTotal cross-referencing
sha256sum ./extracted_files/payload.bin
\`\`\`

### Summary
Mastering Wireshark display filters and TCP stream reassembly empowers security analysts to rapidly isolate anomalous packet streams and reconstruct security incidents.
    `
  }
];
