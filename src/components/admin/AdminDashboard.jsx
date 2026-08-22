import React, { useState } from 'react';
import {
  Shield, User, FolderGit2, Wrench, Award, Briefcase, Mail, Settings,
  LogOut, Plus, Trash2, Edit3, Check, X, RefreshCw, Download, Upload,
  Search, Eye, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, Lock,
  Copy, Send, Database, ShieldCheck, FileJson, CheckCheck, CloudRain, Server, Key,
  BookOpen, FileText, Heart, Tag, RotateCcw
} from 'lucide-react';
import { portfolioStore, usePortfolioData } from '../../data/portfolioStore';

export default function AdminDashboard({ onClose, onLogout }) {
  const { data, messages, blogs } = usePortfolioData();
  const [activeTab, setActiveTab] = useState('overview');

  // Form states for inline editing
  const [profileForm, setProfileForm] = useState(data.personalInfo);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Blog Manager State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCatFilter, setBlogCatFilter] = useState('all');
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Cyber Security',
    readTime: '5 min read',
    excerpt: '',
    tags: '',
    content: '',
    published: true,
    featured: false
  });
  const [blogStatusMsg, setBlogStatusMsg] = useState('');

  // Project Modal / Edit State
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: false
  });

  // Skill Form State
  const [skillCategory, setSkillCategory] = useState('networking');
  const [skillForm, setSkillForm] = useState({ name: '', level: 85 });
  const [newCatName, setNewCatName] = useState('');

  // Cert Form State
  const [certForm, setCertForm] = useState({
    title: '', issuer: '', date: '', category: 'Networking', badgeColor: '#00f3ff', details: ''
  });

  // Exp Form State
  const [expForm, setExpForm] = useState({
    role: '', company: '', period: '', type: 'Internship', points: ''
  });

  // Filter messages
  const [messageFilter, setMessageFilter] = useState('all');
  const unreadCount = messages.filter((m) => !m.read).length;

  // Security & Backup Tab Interactive States
  const [backupStatus, setBackupStatus] = useState({ type: '', text: '' });
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    portfolioStore.updatePersonalInfo(profileForm);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Blog Management Handlers
  const handleOpenNewBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      category: 'Cyber Security',
      readTime: '5 min read',
      excerpt: '',
      tags: '',
      content: '',
      published: true,
      featured: false
    });
    setBlogModalOpen(true);
  };

  const handleOpenEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || '',
      category: blog.category || 'Cyber Security',
      readTime: blog.readTime || '5 min read',
      excerpt: blog.excerpt || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
      content: blog.content || '',
      published: blog.published !== false,
      featured: blog.featured || false
    });
    setBlogModalOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.excerpt || !blogForm.content) {
      setBlogStatusMsg('Title, excerpt, and content are required.');
      return;
    }

    const payload = {
      ...blogForm,
      tags: blogForm.tags ? blogForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    };

    if (editingBlog) {
      const blogId = editingBlog._id || editingBlog.id;
      const res = await portfolioStore.updateBlog(blogId, payload);
      if (res.success) {
        setBlogStatusMsg('Blog article updated successfully in MongoDB!');
      }
    } else {
      const res = await portfolioStore.addBlog(payload);
      if (res.success) {
        setBlogStatusMsg('New blog article published to MongoDB!');
      }
    }

    setBlogModalOpen(false);
    setTimeout(() => setBlogStatusMsg(''), 4000);
  };

  const handleTogglePublish = async (blog) => {
    const blogId = blog._id || blog.id;
    await portfolioStore.updateBlog(blogId, { published: !blog.published });
    setBlogStatusMsg(`Article status updated for "${blog.title.slice(0, 25)}...".`);
    setTimeout(() => setBlogStatusMsg(''), 4000);
  };

  const handleDeleteBlog = async (blog) => {
    if (window.confirm(`Are you sure you want to delete "${blog.title}" from MongoDB?`)) {
      const blogId = blog._id || blog.id;
      await portfolioStore.deleteBlog(blogId);
      setBlogStatusMsg('Blog article deleted from MongoDB.');
      setTimeout(() => setBlogStatusMsg(''), 4000);
    }
  };

  const handleAddOrUpdateProject = (e) => {
    e.preventDefault();
    const techArray = typeof projectForm.tech === 'string'
      ? projectForm.tech.split(',').map((t) => t.trim()).filter(Boolean)
      : projectForm.tech;
    const highlightsArray = typeof projectForm.highlights === 'string'
      ? projectForm.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      : projectForm.highlights;

    const payload = {
      ...projectForm,
      tech: techArray,
      highlights: highlightsArray
    };

    if (editingProject) {
      portfolioStore.updateProject(editingProject.id, payload);
    } else {
      portfolioStore.addProject(payload);
    }

    setEditingProject(null);
    setProjectForm({ title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: false });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillForm.name) return;
    portfolioStore.addSkill(skillCategory, skillForm.name, skillForm.level);
    setSkillForm({ name: '', level: 85 });
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!certForm.title) return;
    portfolioStore.addCertification(certForm);
    setCertForm({ title: '', issuer: '', date: '', category: 'Networking', badgeColor: '#00f3ff', details: '' });
  };

  const handleAddExp = (e) => {
    e.preventDefault();
    if (!expForm.role) return;
    const pointsArr = typeof expForm.points === 'string'
      ? expForm.points.split('\n').map((p) => p.trim()).filter(Boolean)
      : expForm.points;
    portfolioStore.addExperience({ ...expForm, points: pointsArr });
    setExpForm({ role: '', company: '', period: '', type: 'Internship', points: '' });
  };

  const handleExportJSON = () => {
    const jsonString = portfolioStore.exportJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `karan-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus({ type: 'success', text: 'Backup downloaded successfully!' });
    setTimeout(() => setBackupStatus({ type: '', text: '' }), 4000);
  };

  const handleCopyBackupJSON = async () => {
    try {
      const jsonString = portfolioStore.exportJSON();
      await navigator.clipboard.writeText(jsonString);
      setCopiedBackup(true);
      setBackupStatus({ type: 'success', text: '📋 Portfolio JSON copied to clipboard!' });
      setTimeout(() => {
        setCopiedBackup(false);
        setBackupStatus({ type: '', text: '' });
      }, 3500);
    } catch (err) {
      setBackupStatus({ type: 'error', text: 'Failed to copy to clipboard: ' + err.message });
    }
  };

  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackupStatus({ type: 'info', text: 'Parsing and syncing backup data to MongoDB...' });
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const res = await portfolioStore.importJSON(event.target.result);
        if (res.success) {
          setBackupStatus({ type: 'success', text: '✅ ' + (res.message || 'Data imported and synced successfully!') });
        } else {
          setBackupStatus({ type: 'error', text: '❌ Import failed: ' + (res.error || 'Invalid file format') });
        }
      } catch (err) {
        setBackupStatus({ type: 'error', text: '❌ Failed to process JSON: ' + err.message });
      }
      setTimeout(() => setBackupStatus({ type: '', text: '' }), 6000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setBackupStatus({ type: 'info', text: 'Initiating Google SMTP handshake & sending diagnostic email...' });
    try {
      const token = portfolioStore.getAuthToken();
      const res = await fetch('/api/auth/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setTestingSmtp(false);
      if (data.success) {
        setBackupStatus({
          type: 'success',
          text: `📧 Live SMTP Verified! Diagnostic email delivered to karanankade12@gmail.com at ${data.timestamp}.`
        });
      } else {
        setBackupStatus({
          type: 'error',
          text: `❌ SMTP test failed: ${data.error || 'Could not send email.'}`
        });
      }
    } catch (err) {
      setTestingSmtp(false);
      setBackupStatus({ type: 'error', text: '❌ Backend connection error during SMTP test.' });
    }
    setTimeout(() => setBackupStatus({ type: '', text: '' }), 8000);
  };

  const handleSyncCloud = async () => {
    setSyncingCloud(true);
    setBackupStatus({ type: 'info', text: 'Fetching latest snapshot from MongoDB database...' });
    try {
      const res = await portfolioStore.refreshFromCloud();
      setSyncingCloud(false);
      if (res.success) {
        setBackupStatus({ type: 'success', text: '☁️ Live portfolio synced from MongoDB!' });
      } else {
        setBackupStatus({ type: 'error', text: res.error || 'Failed to sync with cloud.' });
      }
    } catch (err) {
      setSyncingCloud(false);
      setBackupStatus({ type: 'error', text: 'Cloud sync error: ' + err.message });
    }
    setTimeout(() => setBackupStatus({ type: '', text: '' }), 5000);
  };

  const handleResetDefaults = async () => {
    try {
      await portfolioStore.resetToDefaults();
      setResetConfirmOpen(false);
      setBackupStatus({ type: 'success', text: '🔄 Portfolio reset to original default state and updated in MongoDB!' });
      setTimeout(() => setBackupStatus({ type: '', text: '' }), 6000);
    } catch (err) {
      setBackupStatus({ type: 'error', text: 'Reset error: ' + err.message });
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (messageFilter === 'unread') return !m.read;
    if (messageFilter === 'read') return m.read;
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: '#070913',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Dashboard Top Navbar */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,243,255,0.2) 0%, rgba(157,78,221,0.2) 100%)',
              border: '1px solid var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Shield color="var(--cyan)" size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>
                Portfolio Admin Center
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1px solid var(--emerald)',
                  color: 'var(--emerald)',
                  fontWeight: 600
                }}
              >
                LIVE MONGODB SYNC
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Authorized Admin: <strong style={{ color: '#fff' }}>karanankade12@gmail.com</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportJSON}
            className="cyber-btn cyber-btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.82rem', minHeight: '38px' }}
            title="Download JSON Data Backup"
          >
            <Download size={15} /> Backup Data
          </button>

          <button
            onClick={onLogout ? onLogout : onClose}
            className="cyber-btn"
            style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'rgba(255, 77, 77, 0.2)', border: '1px solid #ff4d4d', minHeight: '38px' }}
          >
            <LogOut size={15} /> Lock / Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="admin-layout-container">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-heading">
            Control Modules
          </div>

          {[
            { id: 'overview', label: 'System Overview', icon: Shield },
            { id: 'profile', label: 'Profile & Data', icon: User },
            { id: 'blogs', label: 'Blogs & Articles', icon: BookOpen, count: blogs?.length },
            { id: 'projects', label: 'Projects Manager', icon: FolderGit2, count: data.projects?.length },
            { id: 'skills', label: 'Skills Matrix', icon: Wrench },
            { id: 'certs_exp', label: 'Certs & Experience', icon: Award },
            { id: 'messages', label: 'Messages Inbox', icon: Mail, badge: unreadCount },
            { id: 'settings', label: 'Security & Backup', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="admin-sidebar-btn"
                style={{
                  border: isActive ? '1px solid var(--cyan)' : '1px solid transparent',
                  background: isActive ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                  color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(255, 77, 77, 0.2)',
                      border: '1px solid #ff4d4d',
                      color: '#ff6b6b',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && item.badge === undefined && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="admin-sidebar-footer">
            <button
              onClick={onClose}
              className="cyber-btn cyber-btn-outline"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
            >
              Exit to Live Site
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-content-area">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  System Health & Metrics
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                  Real-time synchronization status and content telemetry.
                </p>
              </div>

              {/* Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px' }}>
                <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Projects</span>
                    <FolderGit2 color="var(--cyan)" size={20} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{data.projects?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '4px' }}>Active in Portfolio</div>
                </div>

                <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Published Blogs</span>
                    <BookOpen color="var(--cyan)" size={20} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{blogs?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '4px' }}>Articles in MongoDB</div>
                </div>

                <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certifications</span>
                    <Award color="var(--neon-purple)" size={20} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{data.certifications?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', marginTop: '4px' }}>Cisco, RedHat & SPPU</div>
                </div>

                <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Inquiries</span>
                    <Mail color="#ff007f" size={20} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{messages?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: unreadCount > 0 ? '#ff4d4d' : 'var(--emerald)', marginTop: '4px' }}>
                    {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '14px' }}>Admin Quick Links</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button onClick={handleOpenNewBlog} className="cyber-btn" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Write New Blog Post
                  </button>
                  <button onClick={() => setActiveTab('blogs')} className="cyber-btn cyber-btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                    <BookOpen size={16} /> Manage Blogs ({blogs?.length || 0})
                  </button>
                  <button onClick={() => setActiveTab('projects')} className="cyber-btn cyber-btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                    <FolderGit2 size={16} /> Add / Edit Project
                  </button>
                  <button onClick={() => setActiveTab('messages')} className="cyber-btn cyber-btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                    <Mail size={16} /> Read Messages ({unreadCount})
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="cyber-btn cyber-btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                    <Settings size={16} /> Security & Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  Personal Profile & Coordinates
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Update your contact details, bio, and social profile links.
                </p>
              </div>

              {saveSuccessMsg && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', color: 'var(--emerald)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> {saveSuccessMsg}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="glass-panel" style={{ padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Location</label>
                    <input
                      type="text"
                      value={profileForm.location || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Professional Tagline</label>
                  <input
                    type="text"
                    value={profileForm.tagline || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Bio / Summary</label>
                  <textarea
                    rows={4}
                    value={profileForm.bio || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>LinkedIn URL</label>
                    <input
                      type="url"
                      value={profileForm.linkedin || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ORCID Link</label>
                    <input
                      type="url"
                      value={profileForm.orcid || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, orcid: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '12px 24px', fontSize: '0.9rem' }}>
                  <Check size={16} /> Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: BLOGS & ARTICLES MANAGER */}
          {activeTab === 'blogs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    Technical Blogs & Articles Vault
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    Publish, edit, and manage your cyber security, networking, and engineering articles.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewBlog}
                  className="cyber-btn"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  <Plus size={16} /> Write New Article
                </button>
              </div>

              {blogStatusMsg && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    color: 'var(--emerald)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{blogStatusMsg}</span>
                </div>
              )}

              {/* Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Total Articles
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--cyan)' }}>
                    {blogs?.length || 0}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Published Live
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--emerald)' }}>
                    {blogs?.filter((b) => b.published !== false).length || 0}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Total Reads / Views
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ff007f' }}>
                    {blogs?.reduce((acc, b) => acc + (b.views || 0), 0) || 0}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Reader Likes
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#9d4edd' }}>
                    {blogs?.reduce((acc, b) => acc + (b.likes || 0), 0) || 0}
                  </div>
                </div>
              </div>

              {/* Search and Category Filter Bar */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyan)' }} />
                  <input
                    type="text"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Search articles by title or tag..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      background: 'rgba(5, 8, 20, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <select
                  value={blogCatFilter}
                  onChange={(e) => setBlogCatFilter(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(5, 8, 20, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Networking">Networking</option>
                  <option value="Linux & Security">Linux & Security</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Full-Stack & MERN">Full-Stack & MERN</option>
                </select>
              </div>

              {/* Blog Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(blogs || [])
                  .filter((b) => {
                    const matchSearch =
                      !blogSearch ||
                      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                      (b.tags && b.tags.some((t) => t.toLowerCase().includes(blogSearch.toLowerCase())));
                    const matchCat =
                      blogCatFilter === 'all' || (b.category && b.category.toLowerCase().includes(blogCatFilter.toLowerCase()));
                    return matchSearch && matchCat;
                  })
                  .map((blog) => {
                    const blogId = blog._id || blog.id;
                    return (
                      <div
                        key={blogId}
                        className="glass-panel"
                        style={{
                          padding: '20px',
                          borderRadius: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '16px',
                          borderLeft: blog.published !== false ? '4px solid var(--cyan)' : '4px solid var(--text-muted)'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'rgba(0, 243, 255, 0.1)',
                                border: '1px solid rgba(0, 243, 255, 0.3)',
                                color: 'var(--cyan)',
                                fontWeight: 600
                              }}
                            >
                              {blog.category}
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: blog.published !== false ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                color: blog.published !== false ? 'var(--emerald)' : 'var(--text-muted)',
                                fontWeight: 600
                              }}
                            >
                              {blog.published !== false ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              • {blog.readTime || '5 min read'}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>
                            {blog.title}
                          </h3>

                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: '1.4' }}>
                            {blog.excerpt}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <span>
                              <Eye size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                              {blog.views || 0} reads
                            </span>
                            <span>
                              <Heart size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                              {blog.likes || 0} likes
                            </span>
                            {blog.tags && blog.tags.length > 0 && (
                              <span>Tags: {Array.isArray(blog.tags) ? blog.tags.slice(0, 3).join(', ') : blog.tags}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleTogglePublish(blog)}
                            className="cyber-btn cyber-btn-outline"
                            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                            title={blog.published !== false ? 'Unpublish to Draft' : 'Publish Live'}
                          >
                            {blog.published !== false ? 'Set to Draft' : 'Publish Live'}
                          </button>

                          <button
                            onClick={() => handleOpenEditBlog(blog)}
                            className="cyber-btn"
                            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                          >
                            <Edit3 size={14} /> Edit
                          </button>

                          <button
                            onClick={() => handleDeleteBlog(blog)}
                            className="cyber-btn"
                            style={{ padding: '8px 12px', fontSize: '0.8rem', background: 'rgba(255, 77, 77, 0.2)', borderColor: '#ff4d4d', color: '#ff6b6b' }}
                            title="Delete Blog Article"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    Projects Catalog
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Add new portfolio projects, edit details, or remove existing ones.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectForm({ title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: true });
                  }}
                  className="cyber-btn"
                  style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add New Project
                </button>
              </div>

              {/* Add / Edit Project Form */}
              <form onSubmit={handleAddOrUpdateProject} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--cyan)' }}>
                  {editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Project'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Project Title</label>
                    <input
                      type="text"
                      required
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="e.g. AI Threat Detection Dashboard"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      <option value="AI / ML Analytics">AI / ML Analytics</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Networking">Networking</option>
                      <option value="MERN Stack">MERN Stack</option>
                      <option value="Systems & Linux">Systems & Linux</option>
                      <option value="Frontend Web">Frontend Web</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Tech Stack (Comma-separated)</label>
                    <input
                      type="text"
                      value={typeof projectForm.tech === 'string' ? projectForm.tech : projectForm.tech?.join(', ')}
                      onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                      placeholder="React, Node.js, Python, Flask"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Live Demo Link</label>
                    <input
                      type="url"
                      value={projectForm.live || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, live: e.target.value })}
                      placeholder="https://my-app.vercel.app"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>GitHub Repo Link</label>
                    <input
                      type="url"
                      value={projectForm.github || ''}
                      onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                      placeholder="https://github.com/karanankade/repo"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Highlights / Key Features (One per line)</label>
                  <textarea
                    rows={3}
                    value={typeof projectForm.highlights === 'string' ? projectForm.highlights : projectForm.highlights?.join('\n')}
                    onChange={(e) => setProjectForm({ ...projectForm, highlights: e.target.value })}
                    placeholder="Built responsive REST API&#10;Integrated Machine Learning models"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    />
                    <span>Feature on Homepage</span>
                  </label>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                    {editingProject && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(null);
                          setProjectForm({ title: '', category: 'MERN Stack', tech: '', live: '', github: '', highlights: '', featured: false });
                        }}
                        className="cyber-btn cyber-btn-outline"
                        style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="cyber-btn" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      {editingProject ? 'Update Project' : 'Save Project'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Projects List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {data.projects?.map((proj) => (
                  <div key={proj.id} className="glass-panel" style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 243, 255, 0.1)', color: 'var(--cyan)' }}>
                        {proj.category}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setProjectForm({
                              title: proj.title,
                              category: proj.category,
                              tech: Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech,
                              live: proj.live || '',
                              github: proj.github || '',
                              highlights: Array.isArray(proj.highlights) ? proj.highlights.join('\n') : proj.highlights,
                              featured: proj.featured || false
                            });
                          }}
                          className="cyber-btn cyber-btn-outline"
                          style={{ padding: '6px 8px' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => portfolioStore.deleteProject(proj.id)}
                          className="cyber-btn"
                          style={{ padding: '6px 8px', background: 'rgba(255, 77, 77, 0.2)', borderColor: '#ff4d4d', color: '#ff6b6b' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', margin: '4px 0 8px', color: '#fff' }}>{proj.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1 }}>{proj.highlights?.[0]}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', marginTop: '12px' }}>
                      Tech: {Array.isArray(proj.tech) ? proj.tech.slice(0, 3).join(', ') : proj.tech}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS MATRIX */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  Skill Matrix & Proficiency
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Manage categories and individual technical skill proficiency ratings.
                </p>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    {Object.keys(data.skills || {}).map((cat) => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 2, minWidth: '220px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Skill Name</label>
                  <input
                    type="text"
                    required
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    placeholder="e.g. Wireshark Packet Analysis"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>

                <div style={{ width: '120px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Level ({skillForm.level}%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>

                <button type="submit" className="cyber-btn" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Add Skill
                </button>
              </form>

              {/* Skills Display by Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {Object.entries(data.skills || {}).map(([catKey, skillList]) => (
                  <div key={catKey} className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.5px' }}>
                      {catKey} ({skillList.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {skillList.map((sk, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.85rem', color: '#fff' }}>{sk.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 600 }}>{sk.level}%</span>
                            <button
                              onClick={() => portfolioStore.deleteSkill(catKey, idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CERTS & EXPERIENCE */}
          {activeTab === 'certs_exp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Certifications Section */}
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  Certifications Vault
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Manage credentials, dates, and verification details.
                </p>

                <form onSubmit={handleAddCert} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Certification Name</label>
                      <input
                        type="text"
                        required
                        value={certForm.title}
                        onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                        placeholder="e.g. Cisco CCNA 200-301"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Issuer / Authority</label>
                      <input
                        type="text"
                        required
                        value={certForm.issuer}
                        onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                        placeholder="e.g. Cisco Networking Academy"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Date Issued</label>
                      <input
                        type="text"
                        value={certForm.date}
                        onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                        placeholder="e.g. Dec 2025"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Certification
                  </button>
                </form>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '18px' }}>
                  {data.certifications?.map((cert, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{cert.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--cyan)', marginTop: '2px' }}>{cert.issuer} • {cert.date}</div>
                      </div>
                      <button
                        onClick={() => portfolioStore.deleteCertification(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '28px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  Work Experience & Internships
                </h2>

                <form onSubmit={handleAddExp} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Role / Position</label>
                      <input
                        type="text"
                        required
                        value={expForm.role}
                        onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                        placeholder="e.g. AI / ML Associate Intern"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Company / Organization</label>
                      <input
                        type="text"
                        required
                        value={expForm.company}
                        onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                        placeholder="e.g. Cognifyz Technologies"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Duration</label>
                      <input
                        type="text"
                        value={expForm.period}
                        onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                        placeholder="e.g. Nov 2024 - Dec 2024"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Key Responsibilities & Achievements (One per line)</label>
                    <textarea
                      rows={3}
                      value={expForm.points}
                      onChange={(e) => setExpForm({ ...expForm, points: e.target.value })}
                      placeholder="Conducted restaurant data analysis&#10;Built predictive machine learning models"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="cyber-btn" style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Experience
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '18px' }}>
                  {data.experience?.map((exp, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{exp.role}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--cyan)', marginTop: '2px' }}>{exp.company} • {exp.period}</div>
                        <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {exp.points?.map((pt, pIdx) => <li key={pIdx}>{pt}</li>)}
                        </ul>
                      </div>
                      <button
                        onClick={() => portfolioStore.deleteExperience(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MESSAGES */}
          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    Recruiter Inquiries & Messages
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Contact submissions received via the portfolio contact form.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {['all', 'unread', 'read'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMessageFilter(filter)}
                      className="cyber-btn cyber-btn-outline"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        background: messageFilter === filter ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                        borderColor: messageFilter === filter ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
                        color: messageFilter === filter ? 'var(--cyan)' : 'var(--text-muted)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                  {messages.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete all messages?')) {
                          portfolioStore.clearAllMessages();
                        }
                      }}
                      className="cyber-btn"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(255, 77, 77, 0.2)', borderColor: '#ff4d4d', color: '#ff6b6b' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
                  <Mail size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '6px' }}>No messages found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recruiter inquiries under "{messageFilter}" filter.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredMessages.map((msg) => {
                    const msgId = msg._id || msg.id;
                    return (
                      <div
                        key={msgId}
                        className="glass-panel"
                        style={{
                          padding: '20px',
                          borderRadius: '14px',
                          borderLeft: msg.read ? '3px solid rgba(255,255,255,0.2)' : '3px solid var(--cyan)',
                          background: msg.read ? 'rgba(10, 14, 28, 0.6)' : 'rgba(14, 18, 36, 0.9)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{msg.name}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--cyan)' }}>&lt;{msg.email}&gt;</span>
                              {!msg.read && (
                                <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '8px', background: 'rgba(0, 243, 255, 0.2)', color: 'var(--cyan)', fontWeight: 600 }}>
                                  NEW
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginTop: '4px' }}>
                              Subject: {msg.subject}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                            </span>
                            <button
                              onClick={() => portfolioStore.toggleMessageRead(msgId)}
                              className="cyber-btn cyber-btn-outline"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                            >
                              {msg.read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button
                              onClick={() => portfolioStore.deleteMessage(msgId)}
                              style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '6px' }}
                              title="Delete message"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {msg.message}
                        </p>

                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}`}
                            className="cyber-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
                          >
                            <Send size={12} /> Reply via Email
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SECURITY & BACKUP COMMAND CENTER */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                  Security & Cloud Database Backup
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Manage Multi-Factor OTP authorization, Google SMTP diagnostics, and JSON portfolio data backups.
                </p>
              </div>

              {/* Status Banner */}
              {backupStatus.text && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background:
                      backupStatus.type === 'success'
                        ? 'rgba(0, 255, 136, 0.12)'
                        : backupStatus.type === 'error'
                        ? 'rgba(255, 77, 77, 0.15)'
                        : 'rgba(0, 243, 255, 0.12)',
                    border:
                      backupStatus.type === 'success'
                        ? '1px solid rgba(0, 255, 136, 0.35)'
                        : backupStatus.type === 'error'
                        ? '1px solid rgba(255, 77, 77, 0.4)'
                        : '1px solid rgba(0, 243, 255, 0.35)',
                    color:
                      backupStatus.type === 'success'
                        ? 'var(--emerald)'
                        : backupStatus.type === 'error'
                        ? '#ff6b6b'
                        : 'var(--cyan)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Sparkles size={16} />
                  <span>{backupStatus.text}</span>
                </div>
              )}

              {/* CARD 1: Email OTP Security Status */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <ShieldCheck size={18} color="var(--emerald)" /> Multi-Factor Email OTP Authentication
                  </h3>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '10px',
                      background: 'rgba(0, 255, 136, 0.15)',
                      border: '1px solid var(--emerald)',
                      color: 'var(--emerald)',
                      fontWeight: 600
                    }}
                  >
                    STATUS: HARDENED & ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Authorized Administrator</div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: '2px', fontFamily: 'monospace' }}>
                      karanankade12@gmail.com
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Email Dispatch Gateway</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--cyan)', fontWeight: 600, marginTop: '2px' }}>
                      Google SMTP (SSL Port 465)
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(5, 8, 20, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Session Token</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--emerald)', fontWeight: 600, marginTop: '2px' }}>
                      HMAC-SHA256 (12h TTL)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
                  <button
                    type="button"
                    disabled={testingSmtp}
                    onClick={handleTestSmtp}
                    className="cyber-btn"
                    style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  >
                    <Send size={15} className={testingSmtp ? 'spin' : ''} />
                    {testingSmtp ? 'Delivering Diagnostic Email...' : 'Test Live SMTP Delivery'}
                  </button>

                  <button
                    type="button"
                    onClick={onLogout ? onLogout : onClose}
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.85rem', borderColor: '#ff4d4d', color: '#ff6b6b' }}
                  >
                    <Lock size={15} /> Revoke Session & Lockout
                  </button>
                </div>
              </div>

              {/* CARD 2: MongoDB Cloud Database Sync */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Database size={18} color="var(--cyan)" /> MongoDB Cloud Synchronization
                  </h3>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      borderRadius: '10px',
                      background: 'rgba(0, 243, 255, 0.15)',
                      border: '1px solid var(--cyan)',
                      color: 'var(--cyan)',
                      fontWeight: 600
                    }}
                  >
                    CLUSTER: karan-portfolio.t7tyz9u.mongodb.net
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Your portfolio content and blogs are continuously persisted in your MongoDB Atlas cloud database cluster. Use the force-sync button below to refresh data directly from MongoDB.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button
                    type="button"
                    disabled={syncingCloud}
                    onClick={handleSyncCloud}
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  >
                    <RefreshCw size={15} className={syncingCloud ? 'spin' : ''} />
                    {syncingCloud ? 'Fetching from Cloud...' : 'Refresh from Cloud Database'}
                  </button>
                </div>
              </div>

              {/* CARD 3: JSON Data Backups & Migration */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <FileJson size={18} color="var(--cyan)" /> Backup, Export & Restore
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Generate offline backups of your full portfolio structure, technical blogs, and recruiter messages, or restore from a previously downloaded JSON file.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="cyber-btn"
                    style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  >
                    <Download size={16} /> Export Backup File (.json)
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBackupJSON}
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  >
                    {copiedBackup ? <CheckCheck size={16} color="var(--emerald)" /> : <Copy size={16} />}
                    {copiedBackup ? 'Copied to Clipboard!' : 'Copy JSON to Clipboard'}
                  </button>

                  <label
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Upload size={16} /> Import & Restore JSON
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJSON}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(true)}
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.85rem', borderColor: 'rgba(255, 77, 77, 0.4)', color: '#ff6b6b' }}
                  >
                    <RotateCcw size={16} /> Reset to System Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BLOG ARTICLE EDITOR MODAL */}
          {blogModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                background: 'rgba(5, 8, 20, 0.92)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(12px, 3vw, 20px)'
              }}
              onClick={() => setBlogModalOpen(false)}
            >
              <div
                className="glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: 'min(94vw, 780px)',
                  width: '100%',
                  maxHeight: '92vh',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '16px clamp(16px, 3vw, 26px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="var(--cyan)" />
                    {editingBlog ? `Edit Article: ${editingBlog.title}` : 'Write New Technical Article'}
                  </h3>

                  <button
                    onClick={() => setBlogModalOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleSaveBlog}
                  style={{
                    padding: '24px 26px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. Zero-Trust Architecture in Hybrid Clouds"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        background: 'rgba(5, 8, 20, 0.85)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.92rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Category *
                      </label>
                      <select
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          background: 'rgba(5, 8, 20, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="Networking">Networking</option>
                        <option value="Linux & Security">Linux & Security</option>
                        <option value="AI & Data Science">AI & Data Science</option>
                        <option value="Full-Stack & MERN">Full-Stack & MERN</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Estimated Read Time
                      </label>
                      <input
                        type="text"
                        value={blogForm.readTime}
                        onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                        placeholder="e.g. 6 min read"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          background: 'rgba(5, 8, 20, 0.85)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Article Summary / Excerpt *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      placeholder="Brief overview explaining what readers will learn..."
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        background: 'rgba(5, 8, 20, 0.85)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.88rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={blogForm.tags}
                      onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                      placeholder="SELinux, Firewalld, RHEL, Security"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        background: 'rgba(5, 8, 20, 0.85)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Full Content (Markdown format supported) *
                    </label>
                    <textarea
                      rows={10}
                      required
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder={`### Introduction\nExplain the concept here...\n\n### 1. Implementation\n\`\`\`bash\n# commands\n\`\`\``}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'rgba(5, 8, 20, 0.95)',
                        border: '1px solid rgba(0, 243, 255, 0.25)',
                        color: '#fff',
                        fontSize: '0.88rem',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={blogForm.published}
                        onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                      />
                      <span>Publish Live (Visible to visitors)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={blogForm.featured}
                        onChange={(e) => setBlogForm({ ...blogForm, featured: e.target.checked })}
                      />
                      <span>Featured Article</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setBlogModalOpen(false)}
                      className="cyber-btn cyber-btn-outline"
                      style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cyber-btn"
                      style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                    >
                      <Check size={16} />
                      {editingBlog ? 'Update Article in MongoDB' : 'Publish Article to MongoDB'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reset Confirmation Modal */}
          {resetConfirmOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1100,
                background: 'rgba(5, 8, 20, 0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(12px, 3vw, 20px)'
              }}
              onClick={() => setResetConfirmOpen(false)}
            >
              <div
                className="glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: 'min(92vw, 460px)',
                  width: '100%',
                  padding: 'clamp(20px, 4vw, 28px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 77, 77, 0.4)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ff6b6b' }}>
                  <AlertCircle size={28} />
                  <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#fff' }}>Confirm Reset to Defaults</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                  Are you sure you want to reset all portfolio fields to their original default state (Karan Ankade, SPPU Cyber Security Honours, Cisco/Linux projects) and sync this to MongoDB?
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(false)}
                    className="cyber-btn cyber-btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="cyber-btn"
                    style={{ padding: '10px 20px', fontSize: '0.85rem', background: '#ff4d4d', borderColor: '#ff4d4d', color: '#fff' }}
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
