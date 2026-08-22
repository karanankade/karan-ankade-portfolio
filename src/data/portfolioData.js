export const personalInfo = {
  name: "Karan Kishan Ankade",
  tagline: "Computer Engineering Graduate | Cyber Security Honours | Network & Full-Stack Engineer | AI Associate",
  bio: "Computer Engineering graduate (2026) with Honours in Cyber Security from Savitribai Phule Pune University. Proficient in networking, cyber security, full-stack MERN development, Linux administration, and machine learning analytics. Quick learner seeking opportunities in Software Engineering, Cybersecurity, Networking, or AI engineering.",
  location: "Pune, India",
  phone: "+91-7821002613",
  email: "karanankade12@gmail.com",
  linkedin: "https://www.linkedin.com/in/karan-ankade-6150591b3/",
  orcid: "https://orcid.org/0009-0005-1352-465X",
  portfolio: "https://karanankade.github.io/resume-website/",
  github: "https://github.com/karanankade",
  education: {
    degree: "Bachelor of Engineering (B.E.) in Computer Engineering",
    honours: "Honours in Cyber Security",
    college: "Parvatibai Genba Moze College of Engineering, Pune",
    university: "Savitribai Phule Pune University (SPPU)",
    period: "Sep 2022 – Jul 2026",
    cgpa: "6.97 / 10.0 (First Class)",
    finalSgpa: "8.03 (Fourth Year SGPA)"
  }
};

export const roles = [
  {
    id: "cyber",
    title: "Cyber Security Analyst",
    icon: "ShieldAlert",
    color: "#00f3ff",
    accent: "rgba(0, 243, 255, 0.2)",
    badge: "Honours Degree",
    desc: "Vulnerability analysis, threat mitigation, network security policies, security auditing, and digital forensics."
  },
  {
    id: "network",
    title: "Network Engineer",
    icon: "Network",
    color: "#00ff88",
    accent: "rgba(0, 255, 136, 0.2)",
    badge: "CCNA Certified",
    desc: "IPv4/IPv6 subnetting, RIP, OSPF, EIGRP routing, ACLs, NAT, VLANs, Wireshark, and Cisco Packet Tracer labs."
  },
  {
    id: "fullstack",
    title: "MERN / Full-Stack Engineer",
    icon: "Code2",
    color: "#9d4edd",
    accent: "rgba(157, 78, 221, 0.2)",
    badge: "MERN Intern",
    desc: "Building high-performance SPAs & RESTful APIs with React.js, Node.js, Express, MongoDB, and Tailwind CSS."
  },
  {
    id: "ai",
    title: "AI / Data Science Specialist",
    icon: "BrainCircuit",
    color: "#ff007f",
    accent: "rgba(255, 0, 127, 0.2)",
    badge: "Azure AI & Oracle AI",
    desc: "Predictive Analytics (ARIMA), Customer Segmentation (K-Means/PCA), Statsmodels, Scikit-learn, & AI Agent Studio."
  }
];

export const projects = [
  {
    id: "predictive-analytics",
    title: "Retail Sales Forecasting & Predictive Analytics",
    category: "AI / ML Analytics",
    tech: ["Python", "Statsmodels (ARIMA)", "Pandas", "Matplotlib", "Flask", "Vercel"],
    live: "https://predictive-analytics-project-guide-taupe.vercel.app/",
    github: "https://github.com/karanankade/Predictive-Analytics-Project-Guide",
    featured: true,
    highlights: [
      "Time-series forecasting application using ARIMA (1,1,1) model to predict 12 months of future sales revenue.",
      "Data preprocessing, trend analysis, and performance validation using RMSE and MAE metrics.",
      "Interactive Flask web dashboard featuring historical vs. forecasted sales charts and RESTful JSON APIs."
    ]
  },
  {
    id: "customer-segmentation",
    title: "Customer Segmentation & Behavioral Analytics",
    category: "AI / ML Analytics",
    tech: ["Python", "Scikit-learn (K-Means, PCA)", "Pandas", "Flask", "Vercel"],
    live: "https://customer-segmentation-project-beta.vercel.app/",
    github: "https://github.com/karanankade/Customer-Segmentation-Project",
    featured: true,
    highlights: [
      "End-to-end customer segmentation system using K-Means clustering and PCA to classify customers into 4 behavioral segments.",
      "RFM (Recency, Frequency, Monetary) analysis, feature scaling, and optimal cluster finding via Elbow Method & Silhouette Score.",
      "Interactive Flask application with PCA scatter plots, cluster profile analytics, and public Vercel deployment."
    ]
  },
  {
    id: "linux-web-book",
    title: "Linux Web Book – Interactive RHEL 10 Study Guide",
    category: "Systems & Linux",
    tech: ["HTML5", "CSS3", "JavaScript (Vanilla)", "Local Storage", "Single Page App"],
    live: "https://karanankade.github.io/Linux-Web-Book/",
    github: "https://github.com/karanankade/Linux-Web-Book",
    featured: true,
    highlights: [
      "Interactive Linux terminal simulator supporting 50+ bash commands with a virtual filesystem.",
      "Visualizers for Firewall zones, SELinux contexts, network configuration (nmcli), and SSH/SCP transfers.",
      "Simulated LVM storage management (PV, VG, LV creation) and block device operations in browser.",
      "Interactive quizzes with scoring, bookmarking, progress tracking, and full-text search across 20+ RHCSA topics."
    ]
  },
  {
    id: "cisco-routing-labs",
    title: "Cisco Routing Labs – Networking Lab Projects",
    category: "Networking",
    tech: ["Cisco Packet Tracer", "OSPF", "RIP", "EIGRP", "VLANs", "DHCP", "Subnetting"],
    github: "https://github.com/karanankade/Cisco-Routing-Labs.git",
    featured: true,
    highlights: [
      "Comprehensive Packet Tracer labs covering Static and Dynamic Routing protocols aligned with CCNA concepts.",
      "Implemented real network topologies, IPv4/IPv6 addressing, inter-VLAN routing, and security ACLs.",
      "Connectivity troubleshooting using ping, traceroute, and simulation mode path analysis."
    ]
  },
  {
    id: "ip-navigator",
    title: "IP Navigator – Subnetting & Network Utility Tool",
    category: "MERN Stack",
    tech: ["MongoDB", "Express.js", "React.js", "Node.js", "Vercel"],
    live: "https://ip-navigator-six.vercel.app/",
    highlights: [
      "Network utility tool for IP address analysis, class identification, and subnet mask exploration.",
      "Custom subnetting engine calculation and network parameter validation."
    ]
  },
  {
    id: "email-header-analyzer",
    title: "Email Header Analyzer & Hop Visualizer",
    category: "Cyber Security",
    tech: ["Python", "HTML", "CSS", "JavaScript", "Render"],
    live: "https://email-header-analyzer-wh49.onrender.com/",
    highlights: [
      "Interactive tool to parse raw email headers, extract key auth headers (SPF, DKIM, DMARC), and trace IP hops.",
      "Route visualization on interactive map, hop timeline, dashboard analysis, and CSV report export."
    ]
  },
  {
    id: "alandi-chikoo",
    title: "Alandi Chikoo Growers – Agricultural Platform",
    category: "Full-Stack Web",
    tech: ["React", "Vite", "shadcn/ui", "Tailwind CSS"],
    live: "https://alandi-chikoo-growers.vercel.app/",
    highlights: [
      "High-performance agricultural platform built with modular React components and responsive UI.",
      "Optimized frontend performance, accessible design, and clean architecture."
    ]
  },
  {
    id: "typing-practice",
    title: "Typing Practice – Real-Time Speed Test App",
    category: "Frontend Web",
    tech: ["JavaScript", "HTML5", "CSS3", "Local Storage"],
    live: "https://karanankade.github.io/typing-practice/",
    highlights: [
      "Real-time typing speed and accuracy metrics tracker.",
      "Includes client-side security mechanisms to prevent copy-paste manipulation."
    ]
  }
];

export const skills = {
  networking: [
    { name: "IPv4 / IPv6 Subnetting", level: 92 },
    { name: "Routing Protocols (OSPF, RIP, EIGRP)", level: 90 },
    { name: "Cisco Packet Tracer & Labs", level: 95 },
    { name: "VLANs & Inter-VLAN Routing", level: 88 },
    { name: "ACLs, NAT & Firewalls", level: 85 },
    { name: "Wireshark Packet Analysis & Nmap", level: 86 }
  ],
  cybersecurity: [
    { name: "Network & Cyber Security Fundamentals", level: 88 },
    { name: "Penetration Testing Basics", level: 80 },
    { name: "Digital Forensics & Incident Response", level: 78 },
    { name: "Email Security (SPF/DKIM/DMARC)", level: 84 },
    { name: "Security Auditing & Compliance", level: 82 }
  ],
  development: [
    { name: "React.js & SPA Architecture", level: 88 },
    { name: "Node.js & Express.js REST APIs", level: 85 },
    { name: "MongoDB & MySQL Databases", level: 82 },
    { name: "JavaScript (ES6+) & HTML5/CSS3", level: 92 },
    { name: "Python Programming (IIT Certified)", level: 88 },
    { name: "Git & Version Control", level: 90 }
  ],
  analyticsAndAi: [
    { name: "Predictive Analytics (ARIMA)", level: 85 },
    { name: "K-Means Clustering & PCA", level: 84 },
    { name: "Pandas & Statsmodels", level: 88 },
    { name: "Oracle Fusion AI Agent Studio", level: 80 },
    { name: "Microsoft Azure AI Essentials", level: 82 }
  ],
  operatingSystems: [
    { name: "Red Hat Enterprise Linux (RHEL)", level: 90 },
    { name: "Ubuntu Linux & Kali Linux", level: 88 },
    { name: "System Hardware & Troubleshooting", level: 92 },
    { name: "Windows Server / 10 / 11 Admin", level: 90 }
  ]
};

export const certifications = [
  {
    title: "CCNA (Cisco Certified Network Associate) Course",
    issuer: "SevenMentor Pvt. Ltd.",
    date: "April 2026",
    category: "Networking",
    badgeColor: "#00ff88",
    details: "Static & Dynamic Routing, Switching, Subnetting, ACL, NAT, VPN, and CCNA Network Fundamentals."
  },
  {
    title: "Cybersecurity Awareness Program (CyberSmart Bharat)",
    issuer: "SISA & SGBS Unnati Foundation",
    date: "Feb 2026 – Apr 2026",
    category: "Security",
    badgeColor: "#00f3ff",
    details: "Cyber hygiene, threat detection, phishing defense, data protection, and enterprise security."
  },
  {
    title: "Microsoft Azure AI Essentials Professional Certificate",
    issuer: "Microsoft & LinkedIn Learning",
    date: "Jul 2025",
    category: "AI / Cloud",
    badgeColor: "#ff007f",
    details: "Azure AI services, Machine Learning concepts, Computer Vision, and Generative AI fundamentals."
  },
  {
    title: "Oracle Fusion AI Agent Studio Certified Foundations Associate",
    issuer: "LinkedIn Learning",
    date: "Sep 2025",
    category: "AI / Cloud",
    badgeColor: "#9d4edd",
    details: "AI Agent architecture, enterprise AI workflows, LLM orchestration, and Oracle AI platform."
  },
  {
    title: "Data Analytics Certification",
    issuer: "NNIT Foundation",
    date: "26 Mar 2026",
    category: "Analytics",
    badgeColor: "#ffaa00",
    details: "Data processing, statistical analysis, dashboard creation, and data-driven decision making."
  },
  {
    title: "Python 3.4.3 Training Certification",
    issuer: "Spoken Tutorial Project, IIT Bombay",
    date: "Oct 2023",
    category: "Programming",
    badgeColor: "#3572A5",
    details: "Core Python algorithms, data structures, file handling, and scripting."
  },
  {
    title: "C & C++ Programming Certifications",
    issuer: "Spoken Tutorial Project, IIT Bombay",
    date: "Feb 2024",
    category: "Programming",
    badgeColor: "#f34b7d",
    details: "Object-oriented programming, memory management, pointers, and data structures."
  },
  {
    title: "PHP and MySQL Certification",
    issuer: "Spoken Tutorial Project, IIT Bombay",
    date: "Aug 2024",
    category: "Web Dev",
    badgeColor: "#4F5D95",
    details: "Backend web development, relational database design, and SQL query optimization."
  }
];

export const experience = [
  {
    role: "MERN Stack Developer (Intern)",
    company: "TechGeekConnect Technologies LLP",
    period: "Jan 2025 – Feb 2025",
    type: "Internship",
    points: [
      "Developed full-stack modules using the MERN stack, ensuring data validation and secure API endpoints.",
      "Collaborated in version-controlled environments (Git/GitHub) to support codebase integrity.",
      "Designed REST APIs and integrated MongoDB collections with React frontend views."
    ]
  },
  {
    role: "Networking / IT Intern",
    company: "IT & Network Infrastructure Lab",
    period: "Academic Internship",
    type: "Internship",
    points: [
      "Configured and tested network topologies using Cisco Packet Tracer.",
      "Implemented dynamic routing protocols (RIP, OSPF) for optimized subnet communication.",
      "Performed network connectivity verification, ping tests, and security ACL policy deployment."
    ]
  }
];

export const activeCourses = [
  {
    title: "CCNA + LINUX + CEH + WAPT + SOC + PYTHON",
    duration: "10 Months Intensive Program",
    topics: [
      "Advanced Cisco Networking & Security (ACL, NAT, VPN, Firewalls)",
      "Linux System Administration & Security Hardening",
      "Certified Ethical Hacking (CEH) & Web Application Penetration Testing (WAPT)",
      "Security Operations Center (SOC) Operations & Threat Monitoring",
      "Python Scripting for Security Automation"
    ]
  }
];
