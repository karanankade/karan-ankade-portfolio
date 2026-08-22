# 🚀 Karan Ankade — 3D Cyber Command Center Portfolio

An interactive, high-performance 3D WebGL developer portfolio and security command center built with **React**, **Three.js / React Three Fiber**, **Framer Motion**, and custom interactive simulators.

---

## ✨ Features & Interactive Modules

### 🌌 1. 3D WebGL Command Center Hero
* Built with `@react-three/fiber` & `@react-three/drei`.
* Interactive multi-dimensional scene with dynamic lighting, floating HUD targets, particle galaxies, and custom geometric shaders.
* Role-switching views tailored for **Cybersecurity & SOC**, **Network Engineering**, **Full-Stack MERN**, and **AI & Predictive Analytics**.

### 💻 2. Interactive Linux Bash Terminal
* Fully functional browser-based terminal with real-time command execution.
* Custom commands: `help`, `whoami`, `skills`, `projects`, `certifications`, `cat`, `ls`, `ping`, `matrix`, `clear`, `sudo`.
* Supports auto-complete, command history navigation (Up/Down arrow keys), and interactive sub-programs.

### 🌐 3. Cisco Network Routing & Packet Simulator
* Visual topology diagram showcasing packet flow between Edge Routers, Firewalls, Core Switches, SOC Servers, and IoT Gateways.
* Protocol filters: **BGP**, **OSPF**, **TCP/UDP**, **ICMP**.
* Real-time packet transmission simulation with latency metrics, hop logs, and packet status indicators.

### 🤖 4. AI & Machine Learning Analytics Sandbox
* Live ML simulation canvas featuring **K-Means Clustering** & **ARIMA Time Series Forecasting**.
* Interactive controls for cluster count, noise ratio, anomaly threshold, and window size.
* Dynamic performance metric calculations: **MAE**, **RMSE**, and **R² Score**.

### 🛠️ 5. Skill Matrix & Certifications Vault
* Interactive skill cards organized by technical domain.
* Verified certification badges with credential IDs, issuing bodies, and issue dates.

### 📜 6. Experience Timeline & Contact Nexus
* Interactive career roadmap detailing industry experience, projects, and achievements.
* Glassmorphic contact form with direct message dispatch to the admin dashboard inbox.

### 🔐 7. Multi-Factor Email OTP Protected Admin Dashboard
* Built-in secure admin portal accessible via the **Admin Portal** button in the footer or URL hash (`#admin`).
* **Zero Static Password Vulnerability**: Permanent passwords are eliminated. Access is strictly authenticated through dynamically generated 6-digit cryptographic passkeys dispatched directly to the admin's email (`karanankade12@gmail.com`) via Google SMTP.
* **Cryptographic & Transport Security**:
  * 6-digit OTPs generated with `crypto.randomInt` and hashed with salted HMAC-SHA256 in MongoDB.
  * Automatic MongoDB TTL expiration (5 minutes) and single-use auto-purge upon verification.
  * Brute-force rate limiting (45s resend cooldown, maximum 5 verification attempts).
  * 12-hour HMAC-SHA256 signed session token for protected backend endpoints (`PUT /api/portfolio`, `GET /api/messages`, message deletion).
* **Profile & Personal Data Editor**: Live update Name, Bio, Tagline, Phone, Email, Location, and Social links.
* **Projects Manager**: Add new projects, edit existing projects, delete, toggle featured status, and manage tech stack tags.
* **Skills Matrix**: Add skills with 0-100% proficiency sliders, edit/remove skills across domain categories.
* **Certifications & Experience**: Add/edit/delete industry certs and career milestones.
* **Visitor Messages Inbox**: Real-time receipt of contact form messages, read/unread status management, email reply shortcuts, and message deletion/clear functions.
* **Data Backup & Restore**: Export full portfolio backup JSON, import data, or reset to default state.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
* **3D Graphics & WebGL**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
* **Animations**: [Framer Motion 11](https://www.framer.com/motion/)
* **Icons & UI Components**: [Lucide React](https://lucide.dev/)
* **Styling**: Vanilla CSS (Custom Design System with Cyberpunk & Neon Glassmorphism Aesthetic)

---

## 🚦 Getting Started

### Prerequisites
Make sure you have Node.js (v18.x or higher) and npm installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/karanankade/karan-3d-portfolio.git
   cd karan-3d-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` to view the live interactive portfolio.

---

## 📦 Build & Deployment

To generate a production-ready bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
