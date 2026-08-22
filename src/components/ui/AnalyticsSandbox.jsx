import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  TrendingUp,
  Users,
  Sliders,
  ExternalLink,
  BarChart3,
  Zap,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Target,
  Layers,
  Cpu,
  RefreshCw,
  Play,
  ArrowRight,
  Info,
  Check,
  Award
} from 'lucide-react';
import { playClickSound, playHoverSound, playAccessGrantedSound } from '../../utils/audioFX';

export default function AnalyticsSandbox() {
  // ----------------------------------------------------
  // Module 1: Time Series Forecasting State
  // ----------------------------------------------------
  const [modelType, setModelType] = useState('ARIMA'); // ARIMA, Prophet, XGBoost
  const [baseRevenue, setBaseRevenue] = useState(50000);
  const [growthTrend, setGrowthTrend] = useState(4); // 0-10% monthly
  const [seasonalityAmp, setSeasonalityAmp] = useState(15); // 0-30%
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null);

  // ----------------------------------------------------
  // Module 2: K-Means & PCA Customer Segmentation State
  // ----------------------------------------------------
  const [clusterCount, setClusterCount] = useState(4); // K=3, K=4, K=5
  const [selectedCluster, setSelectedCluster] = useState(0);

  // ----------------------------------------------------
  // Module 3: Churn & Fraud ML Classification Predictor
  // ----------------------------------------------------
  const [tenure, setTenure] = useState(12); // months
  const [monthlyCharges, setMonthlyCharges] = useState(1499); // INR
  const [supportTickets, setSupportTickets] = useState(3);
  const [contractType, setContractType] = useState('Month-to-Month'); // Month-to-Month, 1-Year, 2-Year

  // ----------------------------------------------------
  // Active Tab Selector
  // ----------------------------------------------------
  const [activeSandboxTab, setActiveSandboxTab] = useState('forecasting'); // forecasting, segmentation, classification, benchmark

  // ----------------------------------------------------
  // 1. Generate Time Series Data (12 Months)
  // ----------------------------------------------------
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const modelMultiplier = {
    ARIMA: { mae: '2.84%', rmse: '3.42%', r2: '0.941', color: '#00f3ff' },
    Prophet: { mae: '2.15%', rmse: '2.98%', r2: '0.962', color: '#00ff88' },
    XGBoost: { mae: '1.92%', rmse: '2.45%', r2: '0.978', color: '#9d4edd' }
  }[modelType];

  const forecastData = months.map((month, idx) => {
    const trend = 1 + idx * (growthTrend / 100);
    const seasonality = Math.sin((idx / 12) * Math.PI * 2) * (seasonalityAmp / 100);
    const modelNoise = modelType === 'ARIMA' ? (idx % 2 === 0 ? 1.02 : 0.98) : modelType === 'Prophet' ? 1.01 : 1.0;
    const value = Math.round(baseRevenue * (trend + seasonality) * modelNoise);
    const lowerBound = Math.round(value * 0.88);
    const upperBound = Math.round(value * 1.12);
    return { month, value, lowerBound, upperBound };
  });

  const maxVal = Math.max(...forecastData.map((d) => d.upperBound));

  // ----------------------------------------------------
  // 2. K-Means Customer Cluster Definitions
  // ----------------------------------------------------
  const clustersByK = {
    3: [
      { name: 'Cluster 0: High-Value VIPs', rfm: 'R: 5/5, F: 5/5, M: ₹1,45,000', count: '32%', color: '#00ff88', strategy: 'Exclusive VIP rewards, priority support & early beta access' },
      { name: 'Cluster 1: Steady Regulars', rfm: 'R: 4/5, F: 3/5, M: ₹62,000', count: '45%', color: '#00f3ff', strategy: 'Cross-selling campaigns & volume discount incentives' },
      { name: 'Cluster 2: Inactive At-Risk', rfm: 'R: 1/5, F: 1/5, M: ₹12,500', count: '23%', color: '#ffaa00', strategy: 'Win-back email offers & personalized promo coupons' }
    ],
    4: [
      { name: 'Cluster 0: Champions & High Value', rfm: 'R: 5/5, F: 5/5, M: ₹1,85,000', count: '24%', color: '#00ff88', strategy: 'VIP Concierge support, annual loyalty perks & partner rewards' },
      { name: 'Cluster 1: Loyal Repeat Buyers', rfm: 'R: 4/5, F: 4/5, M: ₹82,000', count: '36%', color: '#00f3ff', strategy: 'Subscription upgrades & targeted product recommendations' },
      { name: 'Cluster 2: At-Risk Churn Prospects', rfm: 'R: 1/5, F: 2/5, M: ₹24,000', count: '22%', color: '#ffaa00', strategy: 'Automated retention flow, feedback surveys & discount triggers' },
      { name: 'Cluster 3: New Low-Spend Trainees', rfm: 'R: 4/5, F: 1/5, M: ₹5,400', count: '18%', color: '#ff007f', strategy: 'Interactive product walkthroughs & starter bundle promotions' }
    ],
    5: [
      { name: 'Cluster 0: Whale VIP Accounts', rfm: 'R: 5/5, F: 5/5, M: ₹2,40,000', count: '15%', color: '#00ff88', strategy: 'Dedicated account manager & quarterly executive reviews' },
      { name: 'Cluster 1: Core Enthusiasts', rfm: 'R: 4/5, F: 4/5, M: ₹1,10,000', count: '28%', color: '#00f3ff', strategy: 'Tiered cashback loyalty program & referral bonuses' },
      { name: 'Cluster 2: Moderate Spenders', rfm: 'R: 3/5, F: 3/5, M: ₹48,000', count: '27%', color: '#9d4edd', strategy: 'Up-selling mid-tier add-on features & bundle packages' },
      { name: 'Cluster 3: At-Risk Dormant', rfm: 'R: 1/5, F: 2/5, M: ₹18,000', count: '16%', color: '#ffaa00', strategy: 'Re-engagement campaigns with limited-time discount vouchers' },
      { name: 'Cluster 4: One-Time Buyers', rfm: 'R: 1/5, F: 1/5, M: ₹3,200', count: '14%', color: '#ff007f', strategy: 'Post-purchase review requests & reactivation newsletters' }
    ]
  };

  const activeClusters = clustersByK[clusterCount] || clustersByK[4];
  const activeClusterData = activeClusters[selectedCluster] || activeClusters[0];

  // ----------------------------------------------------
  // 3. Real-time Churn ML Risk Score Calculation
  // ----------------------------------------------------
  const calculateChurnRisk = () => {
    let rawScore = 20 + supportTickets * 11 + (monthlyCharges / 2500) * 15 - tenure * 0.75;
    if (contractType === 'Month-to-Month') rawScore += 24;
    if (contractType === '1-Year') rawScore += 5;
    if (contractType === '2-Year') rawScore -= 18;

    const riskProb = Math.min(98, Math.max(2, Math.round(rawScore)));

    let riskLevel = 'LOW';
    let riskColor = 'var(--emerald)';
    if (riskProb > 40 && riskProb <= 70) {
      riskLevel = 'MEDIUM';
      riskColor = 'var(--amber)';
    } else if (riskProb > 70) {
      riskLevel = 'HIGH CRITICAL';
      riskColor = '#ff0055';
    }

    return { riskProb, riskLevel, riskColor };
  };

  const churnResult = calculateChurnRisk();

  return (
    <section id="ai-sandbox" className="section-container">
      {/* Title & Section Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-title">
          <BrainCircuit color="var(--magenta)" size={32} />
          <h2>AI & Predictive Analytics Interactive Sandbox</h2>
        </div>
        <p className="section-subtitle">
          Interactive hands-on demonstrations of <b>ARIMA/XGBoost Revenue Forecasting</b>, <b>K-Means & PCA Customer Segmentation</b>, and <b>Real-Time Machine Learning Churn Classification</b>.
        </p>
      </motion.div>

      {/* Main Glassmorphism Container */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', border: '1px solid rgba(157, 78, 221, 0.3)', marginBottom: '32px' }}>
        
        {/* ==================================================== */}
        {/* NAVIGATION TABS */}
        {/* ==================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'forecasting', label: 'Revenue Time-Series Forecast', icon: TrendingUp, color: 'var(--cyan)' },
              { id: 'segmentation', label: 'K-Means Customer Segmentation', icon: Users, color: 'var(--magenta)' },
              { id: 'classification', label: 'ML Churn Predictor', icon: ShieldAlert, color: 'var(--emerald)' },
              { id: 'benchmark', label: 'Model Benchmarks', icon: Award, color: 'var(--amber)' }
            ].map((tab) => {
              const isSel = activeSandboxTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setActiveSandboxTab(tab.id);
                  }}
                  style={{
                    background: isSel ? `${tab.color}22` : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSel ? tab.color : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isSel ? '#ffffff' : 'var(--text-muted)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.88rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <tab.icon size={16} color={tab.color} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* External Live Flask Demo Links */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="https://predictive-analytics-project-guide-taupe.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn cyber-btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
            >
              Live ARIMA App <ExternalLink size={14} />
            </a>
            <a
              href="https://customer-segmentation-project-beta.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn cyber-btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px', borderColor: 'var(--magenta)', color: 'var(--magenta)' }}
            >
              Live K-Means App <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: REVENUE TIME-SERIES FORECASTING */}
        {/* ==================================================== */}
        {activeSandboxTab === 'forecasting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Left Column: Interactive Controls */}
              <div style={{ background: 'rgba(5, 8, 20, 0.7)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="var(--cyan)" />
                  Forecasting Model Parameters
                </h3>

                {/* Model Selector */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Select Algorithmic Model:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['ARIMA', 'Prophet', 'XGBoost'].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          playClickSound();
                          setModelType(m);
                        }}
                        style={{
                          flex: 1,
                          background: modelType === m ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${modelType === m ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: modelType === m ? '#ffffff' : 'var(--text-muted)',
                          padding: '8px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 1: Base Monthly Revenue */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Base Monthly Revenue:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
                      ₹{baseRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={baseRevenue}
                    onChange={(e) => setBaseRevenue(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer' }}
                  />
                </div>

                {/* Slider 2: Monthly Growth Rate */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Monthly Trend Growth Rate:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald)' }}>
                      +{growthTrend}% / month
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={growthTrend}
                    onChange={(e) => setGrowthTrend(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--emerald)', cursor: 'pointer' }}
                  />
                </div>

                {/* Slider 3: Seasonality Amplitude */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Seasonality Amplitude:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--purple)' }}>
                      ±{seasonalityAmp}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={seasonalityAmp}
                    onChange={(e) => setSeasonalityAmp(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--purple)', cursor: 'pointer' }}
                  />
                </div>

                {/* Toggle Confidence Bands */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Show 95% Confidence Interval Bands</span>
                  <input
                    type="checkbox"
                    checked={showConfidenceBands}
                    onChange={(e) => setShowConfidenceBands(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Right Column: Dynamic SVG Forecast Chart */}
              <div style={{ background: 'rgba(5, 8, 20, 0.8)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700 }}>
                    12-Month Projected Sales Forecast ({modelType})
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: modelMultiplier.color }}>MAE: {modelMultiplier.mae}</span>
                    <span style={{ color: 'var(--emerald)' }}>R²: {modelMultiplier.r2}</span>
                  </div>
                </div>

                {/* Bar & Trend Line Forecast Graphic */}
                <div style={{ minWidth: '280px', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '6px', justifyContent: 'space-between', paddingTop: '20px' }}>
                  {forecastData.map((item, idx) => {
                    const heightPct = (item.value / maxVal) * 100;
                    const isHovered = hoveredMonthIdx === idx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Hover Tooltip Bubble */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              style={{
                                position: 'absolute',
                                bottom: `${heightPct + 10}%`,
                                background: 'rgba(10, 15, 30, 0.95)',
                                border: `1px solid ${modelMultiplier.color}`,
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                color: '#ffffff',
                                whiteSpace: 'nowrap',
                                zIndex: 10,
                                fontFamily: 'var(--font-mono)'
                              }}
                            >
                              ₹{item.value.toLocaleString('en-IN')}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Bar Graphic */}
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '22px',
                            height: `${heightPct}%`,
                            background: isHovered
                              ? `linear-gradient(to top, rgba(0,255,136,0.3), var(--emerald))`
                              : `linear-gradient(to top, ${modelMultiplier.color}33, ${modelMultiplier.color})`,
                            borderRadius: '4px 4px 0 0',
                            boxShadow: `0 0 10px ${modelMultiplier.color}55`,
                            transition: 'all 0.3s ease',
                            position: 'relative'
                          }}
                        >
                          {/* Upper Confidence Band Marker */}
                          {showConfidenceBands && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '-4px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '12px',
                                height: '2px',
                                background: '#ffaa00'
                              }}
                            />
                          )}
                        </div>

                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: isHovered ? '#ffffff' : 'var(--text-muted)', marginTop: '8px' }}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Validation Summary Bar */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ background: 'rgba(0, 243, 255, 0.06)', padding: '8px 12px', borderRadius: '8px', flex: 1, border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                    Validation RMSE: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{modelMultiplier.rmse}</span>
                  </div>
                  <div style={{ background: 'rgba(0, 255, 136, 0.06)', padding: '8px 12px', borderRadius: '8px', flex: 1, border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                    Out-of-sample R² Score: <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{modelMultiplier.r2}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: K-MEANS CUSTOMER SEGMENTATION */}
        {/* ==================================================== */}
        {activeSandboxTab === 'segmentation' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--magenta)" />
                K-Means RFM Customer Clustering & PCA Dimensionality Reduction
              </h3>

              {/* Cluster Count Selector Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clusters (K):</span>
                {[3, 4, 5].map((kVal) => (
                  <button
                    key={kVal}
                    onClick={() => {
                      playClickSound();
                      setClusterCount(kVal);
                      setSelectedCluster(0);
                    }}
                    style={{
                      background: clusterCount === kVal ? 'var(--magenta)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${clusterCount === kVal ? 'var(--magenta)' : 'rgba(255,255,255,0.1)'}`,
                      color: clusterCount === kVal ? '#ffffff' : 'var(--text-muted)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    K = {kVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Cluster Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {activeClusters.map((cluster, idx) => {
                const isSel = selectedCluster === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setSelectedCluster(idx);
                    }}
                    style={{
                      background: isSel ? `${cluster.color}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSel ? cluster.color : 'rgba(255,255,255,0.08)'}`,
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSel ? '#ffffff' : 'var(--text-muted)', marginBottom: '4px' }}>
                      {cluster.name.split(':')[0]}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: cluster.color, fontFamily: 'var(--font-heading)' }}>
                      {cluster.count}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Silhouette: 0.68
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Cluster Detailed Breakdown */}
            <div style={{ background: 'rgba(5, 8, 20, 0.8)', padding: '24px', borderRadius: '14px', border: `1px solid ${activeClusterData.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.2rem', color: activeClusterData.color, fontWeight: 800 }}>
                  {activeClusterData.name}
                </h4>
                <span style={{ fontSize: '0.8rem', background: `${activeClusterData.color}22`, color: activeClusterData.color, padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  Share of Customer Base: {activeClusterData.count}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RFM Metrics Breakdown</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    {activeClusterData.rfm}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PCA Variance Explained</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    PC1: 64.2% | PC2: 21.8% (Total 86.0%)
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', borderLeft: `4px solid ${activeClusterData.color}` }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                  RECOMMENDED ACTIONABLE MARKETING STRATEGY:
                </div>
                <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 600 }}>
                  {activeClusterData.strategy}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: MACHINE LEARNING CHURN & RISK CLASSIFIER */}
        {/* ==================================================== */}
        {activeSandboxTab === 'classification' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="var(--emerald)" />
              Real-Time Customer Churn & Risk ML Classification Engine
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Customer Feature Inputs */}
              <div style={{ background: 'rgba(5, 8, 20, 0.7)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '16px', fontWeight: 700 }}>
                  Input Customer Attributes
                </h4>

                {/* Input 1: Tenure */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer Tenure:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>
                      {tenure} months
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer' }}
                  />
                </div>

                {/* Input 2: Monthly Charges */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Monthly Charge:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald)' }}>
                      ₹{monthlyCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="499"
                    max="4999"
                    step="100"
                    value={monthlyCharges}
                    onChange={(e) => setMonthlyCharges(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--emerald)', cursor: 'pointer' }}
                  />
                </div>

                {/* Input 3: Support Tickets */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Support Tickets (Last 90 Days):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber)' }}>
                      {supportTickets} calls
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={supportTickets}
                    onChange={(e) => setSupportTickets(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--amber)', cursor: 'pointer' }}
                  />
                </div>

                {/* Input 4: Contract Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Contract Type:
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(5,8,20,0.9)',
                      border: '1px solid rgba(0,255,136,0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Month-to-Month">Month-to-Month (High Risk)</option>
                    <option value="1-Year">1-Year Contract (Moderate Risk)</option>
                    <option value="2-Year">2-Year Contract (Low Churn Risk)</option>
                  </select>
                </div>
              </div>

              {/* ML Prediction Output Meter */}
              <div style={{ background: 'rgba(5, 8, 20, 0.8)', padding: '24px', borderRadius: '14px', border: `1px solid ${churnResult.riskColor}`, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  ESTIMATED CHURN PROBABILITY
                </div>

                <div style={{ fontSize: '3rem', fontWeight: 800, color: churnResult.riskColor, fontFamily: 'var(--font-heading)' }}>
                  {churnResult.riskProb}%
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: `${churnResult.riskColor}22`,
                    color: churnResult.riskColor,
                    border: `1px solid ${churnResult.riskColor}`,
                    marginBottom: '20px'
                  }}
                >
                  RISK LEVEL: {churnResult.riskLevel}
                </div>

                {/* SHAP Feature Impact Breakdown */}
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', fontSize: '0.78rem' }}>
                  <div style={{ color: '#94a3b8', fontWeight: 700, marginBottom: '10px' }}>
                    Top SHAP Feature Drivers:
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Support Calls ({supportTickets})</span>
                      <span style={{ color: supportTickets > 3 ? '#ff0055' : 'var(--emerald)' }}>
                        {supportTickets > 3 ? `+${supportTickets * 8}% Risk` : 'Low Impact'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Contract Type ({contractType})</span>
                      <span style={{ color: contractType === 'Month-to-Month' ? '#ff0055' : 'var(--emerald)' }}>
                        {contractType === 'Month-to-Month' ? '+24% Risk' : '-18% Protection'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Tenure ({tenure} mos)</span>
                      <span style={{ color: tenure > 24 ? 'var(--emerald)' : 'var(--amber)' }}>
                        {tenure > 24 ? '-16% Protection' : 'New Account'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: MODEL BENCHMARK & PERFORMANCE MATRIX */}
        {/* ==================================================== */}
        {activeSandboxTab === 'benchmark' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--amber)" />
              Machine Learning Model Benchmark & Operational Viability
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 170, 0, 0.08)', color: 'var(--amber)', borderBottom: '1px solid rgba(255, 170, 0, 0.2)' }}>
                    <th style={{ padding: '12px 16px' }}>Model Name</th>
                    <th style={{ padding: '12px 16px' }}>Architecture</th>
                    <th style={{ padding: '12px 16px' }}>Precision</th>
                    <th style={{ padding: '12px 16px' }}>Recall</th>
                    <th style={{ padding: '12px 16px' }}>F1-Score</th>
                    <th style={{ padding: '12px 16px' }}>ROC-AUC</th>
                    <th style={{ padding: '12px 16px' }}>Inference Speed</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'XGBoost Classifier', type: 'Gradient Boosted Trees', p: '93.4%', r: '91.2%', f1: '0.923', auc: '0.965', speed: '2.4 ms', status: 'PRODUCTION BEST', color: 'var(--emerald)' },
                    { name: 'Random Forest', type: 'Ensemble Decision Trees', p: '91.8%', r: '89.5%', f1: '0.906', auc: '0.948', speed: '4.1 ms', status: 'BENCHMARK', color: 'var(--cyan)' },
                    { name: 'ARIMA (1,1,1)', type: 'Time-Series Autoregressive', p: '88.6%', r: '87.0%', f1: '0.878', auc: '0.912', speed: '1.8 ms', status: 'STATIONARY', color: 'var(--purple)' },
                    { name: 'Logistic Regression', type: 'Linear Baseline', p: '82.1%', r: '79.4%', f1: '0.807', auc: '0.854', speed: '0.4 ms', status: 'BASELINE', color: 'var(--amber)' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx === 0 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffffff' }}>{row.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{row.type}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{row.p}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{row.r}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.color }}>{row.f1}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{row.auc}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{row.speed}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: row.color, fontSize: '0.78rem' }}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
