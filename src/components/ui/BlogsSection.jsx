import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen, Search, Tag, Eye, Heart, Clock, Calendar, ArrowRight,
  Share2, X, Sparkles, Check, Bookmark, Terminal, Shield, Network, BrainCircuit, Code2, Copy, CheckCheck,
  ShieldCheck, Cpu, Layers
} from 'lucide-react';
import { usePortfolioData, portfolioStore } from '../../data/portfolioStore';
import { playClickSound, playHoverSound } from '../../utils/audioFX';
import { apiUrl } from '../../config/api';
import HoloCardTilt from './HoloCardTilt';

const CATEGORIES = [
  'All',
  'Cyber Security',
  'Networking',
  'Linux & Security',
  'AI & Data Science',
  'Full-Stack & MERN'
];

const categoryStyles = {
  'Cyber Security': {
    color: '#00f3ff',
    bgGradient: 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(0, 102, 255, 0.15) 100%)',
    borderGlow: 'rgba(0, 243, 255, 0.3)',
    icon: ShieldCheck
  },
  'Networking': {
    color: '#00ff88',
    bgGradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.25) 0%, rgba(0, 170, 85, 0.15) 100%)',
    borderGlow: 'rgba(0, 255, 136, 0.3)',
    icon: Network
  },
  'Linux & Security': {
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)',
    borderGlow: 'rgba(56, 189, 248, 0.3)',
    icon: Terminal
  },
  'AI & Data Science': {
    color: '#ff007f',
    bgGradient: 'linear-gradient(135deg, rgba(255, 0, 127, 0.25) 0%, rgba(157, 78, 221, 0.15) 100%)',
    borderGlow: 'rgba(255, 0, 127, 0.3)',
    icon: BrainCircuit
  },
  'Full-Stack & MERN': {
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)',
    borderGlow: 'rgba(168, 85, 247, 0.3)',
    icon: Code2
  }
};

// Helper component to format inline markdown (bold, code, links)
function FormattedInlineText({ text }) {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={keyIdx++}>{remaining.substring(lastIndex, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} style={{ color: '#ffffff', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIdx++}
          style={{
            background: 'rgba(0, 243, 255, 0.12)',
            color: 'var(--cyan)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.88em',
            border: '1px solid rgba(0, 243, 255, 0.25)'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < remaining.length) {
    parts.push(<span key={keyIdx++}>{remaining.substring(lastIndex)}</span>);
  }

  return <>{parts.length > 0 ? parts : text}</>;
}

// Markdown Content Parser for Blog Articles
function MarkdownRenderer({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const lines = (content || '').split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code Block (``` ... ```)
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const fullCode = codeLines.join('\n');
      const codeIdx = i;

      elements.push(
        <div
          key={`code-${i}`}
          style={{
            margin: '18px 0',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 243, 255, 0.25)',
            background: 'rgba(5, 8, 20, 0.95)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div
            style={{
              padding: '8px 14px',
              background: 'rgba(14, 18, 36, 0.95)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)' }}>
              <Terminal size={13} /> {lang}
            </span>
            <button
              onClick={() => handleCopyCode(fullCode, codeIdx)}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedIndex === codeIdx ? 'var(--emerald)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                padding: '4px 8px',
                borderRadius: '4px',
                minHeight: '28px'
              }}
            >
              {copiedIndex === codeIdx ? <CheckCheck size={13} /> : <Copy size={13} />}
              {copiedIndex === codeIdx ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: '14px 16px',
              overflowX: 'auto',
              fontSize: '0.86rem',
              lineHeight: '1.6',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              color: '#38bdf8'
            }}
          >
            <code>{fullCode}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // 2. Table (| Col 1 | Col 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const rowContent = lines[i].trim();
        if (!/^\|(\s*:?-+:?\s*\|)+$/.test(rowContent)) {
          const cells = rowContent
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }

      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(1);

        elements.push(
          <div
            key={`table-${i}`}
            style={{
              margin: '20px 0',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '12px',
              border: '1px solid rgba(0, 243, 255, 0.2)',
              background: 'rgba(5, 8, 20, 0.7)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', minWidth: '420px' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 243, 255, 0.08)', borderBottom: '1px solid rgba(0, 243, 255, 0.25)' }}>
                  {headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        color: 'var(--cyan)',
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                      }}
                    >
                      <FormattedInlineText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      borderBottom: rIdx !== bodyRows.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                      background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '10px 14px', color: '#cbd5e1', lineHeight: '1.5' }}>
                        <FormattedInlineText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: 'clamp(1.15rem, 2.2vw, 1.3rem)',
            fontWeight: 700,
            color: 'var(--cyan)',
            marginTop: '24px',
            marginBottom: '12px',
            fontFamily: 'var(--font-heading)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ width: '4px', height: '16px', background: 'var(--cyan)', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }} />
          <FormattedInlineText text={trimmed.replace('### ', '')} />
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#ffffff',
            marginTop: '18px',
            marginBottom: '8px',
            fontFamily: 'var(--font-heading)'
          }}
        >
          <FormattedInlineText text={trimmed.replace('#### ', '')} />
        </h4>
      );
      i++;
      continue;
    }

    // 4. Horizontal Rule
    if (trimmed === '---') {
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: 'none',
            borderTop: '1px solid rgba(0, 243, 255, 0.2)',
            margin: '24px 0'
          }}
        />
      );
      i++;
      continue;
    }

    // 5. Bullet List Items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <li
          key={`li-${i}`}
          style={{
            marginLeft: '20px',
            marginBottom: '8px',
            color: '#e2e8f0',
            lineHeight: '1.7',
            listStyleType: 'disc'
          }}
        >
          <FormattedInlineText text={trimmed.replace(/^(\*|-)\s+/, '')} />
        </li>
      );
      i++;
      continue;
    }

    // 6. Blockquote / Callout
    if (trimmed.startsWith('> ')) {
      elements.push(
        <div
          key={`quote-${i}`}
          style={{
            borderLeft: '3px solid var(--cyan)',
            background: 'rgba(0, 243, 255, 0.05)',
            padding: '10px 16px',
            borderRadius: '0 8px 8px 0',
            margin: '14px 0',
            fontSize: '0.9rem',
            color: '#93c5fd',
            fontStyle: 'italic'
          }}
        >
          <FormattedInlineText text={trimmed.replace('> ', '')} />
        </div>
      );
      i++;
      continue;
    }

    // 7. Regular Paragraph or Spacer
    if (!trimmed) {
      elements.push(<div key={`space-${i}`} style={{ height: '8px' }} />);
    } else {
      elements.push(
        <p
          key={`p-${i}`}
          style={{
            margin: '0 0 12px',
            color: '#cbd5e1',
            lineHeight: '1.75',
            fontSize: '0.94rem'
          }}
        >
          <FormattedInlineText text={trimmed} />
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

export default function BlogsSection() {
  const { blogs } = usePortfolioData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBlog, setActiveBlog] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeBlog) {
        setActiveBlog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBlog]);

  // Lock background body scroll when reader modal is open
  useEffect(() => {
    if (activeBlog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeBlog]);

  // Filter only published blogs for visitors
  const publishedBlogs = useMemo(() => {
    return (blogs || []).filter((b) => b.published !== false);
  }, [blogs]);

  // Filter and search logic
  const filteredBlogs = useMemo(() => {
    return publishedBlogs.filter((blog) => {
      const matchCat =
        selectedCategory === 'All' ||
        (blog.category && blog.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === 'Linux & Security' && (blog.category.includes('Linux') || blog.category.includes('Security')));

      const matchSearch =
        !searchQuery ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchCat && matchSearch;
    });
  }, [publishedBlogs, selectedCategory, searchQuery]);

  const handleOpenBlog = (blog) => {
    playClickSound();
    setActiveBlog(blog);
    if (blog._id || blog.id || blog.slug) {
      fetch(apiUrl(`/api/blogs/${blog._id || blog.slug || blog.id}`)).catch(() => {});
    }
  };

  const handleLike = (e, blogId) => {
    if (e) e.stopPropagation();
    playClickSound();
    if (!likedMap[blogId]) {
      portfolioStore.likeBlog(blogId);
      setLikedMap((prev) => ({ ...prev, [blogId]: true }));
    }
  };

  const handleShare = () => {
    playClickSound();
    const url = window.location.origin + '#blogs';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <section id="blogs" className="section-container">
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(0, 243, 255, 0.08)',
            border: '1px solid rgba(0, 243, 255, 0.3)',
            color: 'var(--cyan)',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '1px',
            marginBottom: '12px',
            boxShadow: '0 0 20px rgba(0, 243, 255, 0.15)'
          }}
        >
          <BookOpen size={14} />
          <span>TECHNICAL ARTICLES & RESEARCH VAULT</span>
        </div>

        <h2 className="section-title" style={{ justifyContent: 'center' }}>
          Engineering <span className="text-gradient">Knowledge Vault</span>
        </h2>
        <p className="section-subtitle" style={{ marginInline: 'auto' }}>
          Curated deep-dives into Cyber Security defense, Cisco CCNA routing labs, Enterprise Linux RHEL system administration, MERN full-stack architecture, and ARIMA predictive machine learning.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxWidth: '1080px',
          margin: '0 auto 36px'
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--cyan)'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, keywords, or technical tags..."
            style={{
              width: '100%',
              padding: '13px 18px 13px 48px',
              borderRadius: '14px',
              background: 'rgba(10, 14, 28, 0.85)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              color: '#fff',
              fontSize: '0.92rem',
              outline: 'none',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.05)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear Search"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center'
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const styleConfig = categoryStyles[cat] || { color: 'var(--cyan)' };
            return (
              <button
                key={cat}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat);
                }}
                onMouseEnter={() => playHoverSound()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: isSelected ? 'rgba(0, 243, 255, 0.18)' : 'rgba(14, 18, 36, 0.65)',
                  border: isSelected ? `1.5px solid ${styleConfig.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isSelected ? styleConfig.color : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isSelected ? `0 0 15px ${styleConfig.color}40` : 'none',
                  minHeight: '38px'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blogs Grid with Holographic 3D Cards */}
      {filteredBlogs.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            maxWidth: '600px',
            margin: '30px auto',
            padding: '40px 20px',
            textAlign: 'center',
            borderRadius: '18px',
            border: '1px solid rgba(0, 243, 255, 0.2)'
          }}
        >
          <BookOpen size={36} color="var(--cyan)" style={{ margin: '0 auto 14px', opacity: 0.8 }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>No matching articles</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '18px' }}>
            No published engineering guides match your query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="cyber-btn"
            style={{ padding: '8px 18px', fontSize: '0.84rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(1rem, 2vw, 1.75rem)'
          }}
        >
          {filteredBlogs.map((blog) => {
            const blogId = blog._id || blog.id;
            const styleConfig = categoryStyles[blog.category] || {
              color: 'var(--cyan)',
              bgGradient: 'linear-gradient(135deg, rgba(0, 243, 255, 0.2) 0%, rgba(157, 78, 221, 0.15) 100%)',
              borderGlow: 'rgba(0, 243, 255, 0.3)',
              icon: BookOpen
            };
            const CategoryIcon = styleConfig.icon;
            const isLiked = likedMap[blogId];

            return (
              <HoloCardTilt
                key={blogId}
                className="glass-panel"
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 243, 255, 0.02)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {/* 1. Visual Banner Header */}
                <div
                  onClick={() => handleOpenBlog(blog)}
                  style={{
                    height: '130px',
                    background: styleConfig.bgGradient,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <CategoryIcon
                    size={100}
                    style={{
                      position: 'absolute',
                      right: '-12px',
                      bottom: '-20px',
                      color: styleConfig.color,
                      opacity: 0.12,
                      transform: 'rotate(-10deg)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'rgba(5, 8, 20, 0.75)',
                        border: `1px solid ${styleConfig.color}`,
                        color: styleConfig.color,
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        backdropFilter: 'blur(10px)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: styleConfig.color,
                          boxShadow: `0 0 8px ${styleConfig.color}`
                        }}
                      />
                      {blog.category}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        padding: '3px 9px',
                        borderRadius: '20px',
                        background: 'rgba(5, 8, 20, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Clock size={12} color="var(--cyan)" />
                      {blog.readTime || '5 min read'}
                    </span>
                  </div>

                  {/* Author Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--cyan), var(--neon-purple))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#000'
                      }}
                    >
                      KA
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#ffffff', fontWeight: 600 }}>
                      Karan Kishan Ankade
                    </span>
                  </div>
                </div>

                {/* 2. Main Article Body */}
                <div
                  onClick={() => handleOpenBlog(blog)}
                  style={{
                    padding: '20px 18px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: '1.4',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    {blog.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.55',
                      marginBottom: '14px',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {blog.excerpt}
                  </p>

                  {/* Technical Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(0, 243, 255, 0.06)',
                            color: '#93c5fd',
                            border: '1px solid rgba(0, 243, 255, 0.15)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 3. Card Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                      paddingTop: '12px',
                      marginTop: 'auto'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        title={`${blog.views || 0} views`}
                      >
                        <Eye size={13} color="var(--cyan)" />
                        <span>{blog.views || 0}</span>
                      </span>

                      <button
                        onClick={(e) => handleLike(e, blogId)}
                        style={{
                          background: isLiked ? 'rgba(255, 0, 127, 0.12)' : 'transparent',
                          border: isLiked ? '1px solid rgba(255, 0, 127, 0.3)' : '1px solid transparent',
                          borderRadius: '6px',
                          color: isLiked ? '#ff007f' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '0.78rem',
                          minHeight: '28px'
                        }}
                        title="Like this article"
                      >
                        <Heart size={13} fill={isLiked ? '#ff007f' : 'transparent'} color={isLiked ? '#ff007f' : 'currentColor'} />
                        <span>{(blog.likes || 0) + (isLiked ? 1 : 0)}</span>
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.82rem',
                        color: 'var(--cyan)',
                        fontWeight: 700
                      }}
                    >
                      <span>Read</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </HoloCardTilt>
            );
          })}
        </div>
      )}

      {/* Full Article Reader Modal */}
      {activeBlog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeBlog.title}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(3, 6, 16, 0.96)',
            backdropFilter: 'blur(25px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 24px)',
            overflowY: 'auto'
          }}
          onClick={() => setActiveBlog(null)}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(94vw, 880px)',
              width: '100%',
              maxHeight: '90dvh',
              borderRadius: '22px',
              border: '1px solid rgba(0, 243, 255, 0.35)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 243, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px clamp(16px, 3vw, 26px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(10, 14, 28, 0.98)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      background: 'rgba(0, 243, 255, 0.15)',
                      border: '1px solid var(--cyan)',
                      color: 'var(--cyan)',
                      fontWeight: 600
                    }}
                  >
                    {activeBlog.category}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    • {activeBlog.readTime || '5 min read'}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(1.15rem, 2.4vw, 1.55rem)',
                    fontWeight: 800,
                    color: '#fff',
                    margin: 0,
                    lineHeight: '1.3',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  {activeBlog.title}
                </h2>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveBlog(null)}
                aria-label="Close Article Reader"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  minHeight: '38px',
                  minWidth: '38px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '20px clamp(16px, 3vw, 28px)',
                overflowY: 'auto',
                color: '#e2e8f0',
                fontSize: '0.94rem'
              }}
            >
              {/* Author Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'rgba(5, 8, 20, 0.7)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  marginBottom: '20px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--cyan), var(--neon-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#000',
                    fontSize: '0.92rem'
                  }}
                >
                  KA
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                    {activeBlog.author?.name || 'Karan Kishan Ankade'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {activeBlog.author?.role || 'Cyber Security & Network Engineer'}
                  </div>
                </div>
              </div>

              {/* Formatted Markdown Content */}
              <MarkdownRenderer content={activeBlog.content} />

              {/* Topics */}
              {activeBlog.tags && activeBlog.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '28px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <Tag size={14} color="var(--cyan)" />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginRight: '4px' }}>Topics:</span>
                  {activeBlog.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(0, 243, 255, 0.08)',
                        border: '1px solid rgba(0, 243, 255, 0.2)',
                        color: 'var(--cyan)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div
              style={{
                padding: '14px clamp(16px, 3vw, 26px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(8, 12, 24, 0.98)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={(e) => handleLike(e, activeBlog._id || activeBlog.id)}
                  className="cyber-btn"
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.8rem',
                    background: likedMap[activeBlog._id || activeBlog.id] ? 'rgba(255, 0, 127, 0.2)' : 'rgba(0, 243, 255, 0.1)',
                    borderColor: likedMap[activeBlog._id || activeBlog.id] ? '#ff007f' : 'var(--cyan)',
                    minHeight: '38px'
                  }}
                >
                  <Heart size={14} fill={likedMap[activeBlog._id || activeBlog.id] ? '#ff007f' : 'transparent'} />
                  <span>Like ({(activeBlog.likes || 0) + (likedMap[activeBlog._id || activeBlog.id] ? 1 : 0)})</span>
                </button>

                <button
                  onClick={handleShare}
                  className="cyber-btn cyber-btn-outline"
                  style={{ padding: '7px 12px', fontSize: '0.8rem', minHeight: '38px' }}
                >
                  {copiedLink ? <Check size={14} color="var(--emerald)" /> : <Share2 size={14} />}
                  <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

              <button
                onClick={() => setActiveBlog(null)}
                className="cyber-btn cyber-btn-outline"
                style={{ padding: '7px 16px', fontSize: '0.8rem', minHeight: '38px' }}
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
