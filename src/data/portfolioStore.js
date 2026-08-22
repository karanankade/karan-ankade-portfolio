import { useState, useEffect } from 'react';
import {
  personalInfo as initialPersonalInfo,
  roles as initialRoles,
  projects as initialProjects,
  skills as initialSkills,
  certifications as initialCertifications,
  experience as initialExperience,
  activeCourses as initialActiveCourses
} from './portfolioData';
import { initialBlogs } from './blogData';

const STORAGE_KEY_DATA = 'karan_portfolio_data_v1';
const STORAGE_KEY_TOKEN = 'karan_admin_token';
const STORAGE_KEY_BLOGS = 'karan_portfolio_blogs_v1';

// Initial local fallback data
const fallbackData = {
  personalInfo: initialPersonalInfo,
  roles: initialRoles,
  projects: initialProjects,
  skills: initialSkills,
  certifications: initialCertifications,
  experience: initialExperience,
  activeCourses: initialActiveCourses
};

const fallbackMessages = [];

let currentData = fallbackData;
let currentMessages = fallbackMessages;
let currentBlogs = initialBlogs;
let currentToken = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_TOKEN) || '' : '';
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) =>
    listener({
      data: currentData,
      messages: currentMessages,
      blogs: currentBlogs,
      token: currentToken
    })
  );
};

const getAuthHeaders = () => {
  const token = currentToken || (typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY_TOKEN) : '');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Fetch Initial Public Data & Blogs from MongoDB REST API
const initStoreFromBackend = async () => {
  try {
    const [resPortfolio, resBlogs] = await Promise.all([
      fetch('/api/portfolio').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/blogs').then((res) => (res.ok ? res.json() : null))
    ]);

    if (resPortfolio && resPortfolio.success && resPortfolio.data) {
      const dbData = resPortfolio.data;
      currentData = {
        personalInfo: dbData.personalInfo || fallbackData.personalInfo,
        roles: dbData.roles && dbData.roles.length ? dbData.roles : fallbackData.roles,
        projects: dbData.projects || fallbackData.projects,
        skills: dbData.skills && Object.keys(dbData.skills).length ? dbData.skills : fallbackData.skills,
        certifications: dbData.certifications || fallbackData.certifications,
        experience: dbData.experience || fallbackData.experience,
        activeCourses: dbData.activeCourses || fallbackData.activeCourses
      };
    }

    if (resBlogs && resBlogs.success && Array.isArray(resBlogs.blogs) && resBlogs.blogs.length > 0) {
      currentBlogs = resBlogs.blogs;
    }

    // If already has admin token in session, fetch admin private messages
    if (currentToken) {
      portfolioStore.fetchPrivateMessages();
    } else {
      notifyListeners();
    }
  } catch (error) {
    console.warn('Backend API connection warning - using local cache:', error.message);
  }
};

// Auto-trigger initialization
initStoreFromBackend();

// Helper to push updated portfolio state to MongoDB API (Protected)
const syncPortfolioToMongoDB = async (newData) => {
  currentData = newData;
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(newData));
  notifyListeners();

  try {
    const res = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(newData)
    });
    if (!res.ok) {
      console.warn('Portfolio update returned non-OK status:', res.status);
    }
  } catch (e) {
    console.error('Failed to sync portfolio update to MongoDB backend:', e);
  }
};

// Custom React Hook to consume live portfolio, messages & blogs data
export function usePortfolioData() {
  const [state, setState] = useState({
    data: currentData,
    messages: currentMessages,
    blogs: currentBlogs,
    token: currentToken
  });

  useEffect(() => {
    const handleChange = (newState) => setState(newState);
    listeners.add(handleChange);
    return () => listeners.delete(handleChange);
  }, []);

  return state;
}

// Portfolio Store API
export const portfolioStore = {
  getData: () => currentData,
  getMessages: () => currentMessages,
  getBlogs: () => currentBlogs,
  getAuthToken: () => currentToken,

  setAuthToken: (token) => {
    currentToken = token || '';
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
      } else {
        sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
    notifyListeners();
    if (token) {
      portfolioStore.fetchPrivateMessages();
      portfolioStore.fetchBlogs();
    }
  },

  clearAuthToken: () => {
    currentToken = '';
    currentMessages = [];
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    }
    notifyListeners();
    portfolioStore.fetchBlogs(); // re-fetch public view of blogs
  },

  fetchPrivateMessages: async () => {
    try {
      const res = await fetch('/api/messages', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.messages)) {
          currentMessages = json.messages;
          notifyListeners();
        }
      }
    } catch (err) {
      console.error('Failed to fetch private messages:', err);
    }
  },

  // -----------------------------------------------------------
  // BLOGS CRUD API (MONGODB)
  // -----------------------------------------------------------
  fetchBlogs: async () => {
    try {
      const res = await fetch('/api/blogs', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.blogs)) {
          currentBlogs = json.blogs;
          notifyListeners();
          return json.blogs;
        }
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    }
    return currentBlogs;
  },

  addBlog: async (blogPayload) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogPayload)
      });
      const json = await res.json();
      if (json.success && json.blog) {
        currentBlogs = [json.blog, ...currentBlogs];
        notifyListeners();
        return { success: true, blog: json.blog };
      }
      return { success: false, error: json.error || 'Failed to create blog post' };
    } catch (err) {
      console.error('Add blog error:', err);
      // Fallback local addition
      const localBlog = {
        _id: `blog-${Date.now()}`,
        id: `blog-${Date.now()}`,
        ...blogPayload,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      currentBlogs = [localBlog, ...currentBlogs];
      notifyListeners();
      return { success: true, blog: localBlog };
    }
  },

  updateBlog: async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const json = await res.json();
      if (json.success && json.blog) {
        currentBlogs = currentBlogs.map((b) => (b._id === id || b.id === id ? json.blog : b));
        notifyListeners();
        return { success: true, blog: json.blog };
      }
      return { success: false, error: json.error || 'Failed to update blog' };
    } catch (err) {
      console.error('Update blog error:', err);
      currentBlogs = currentBlogs.map((b) => (b._id === id || b.id === id ? { ...b, ...updatedFields } : b));
      notifyListeners();
      return { success: true };
    }
  },

  deleteBlog: async (id) => {
    try {
      await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error('Delete blog error:', err);
    }
    currentBlogs = currentBlogs.filter((b) => b._id !== id && b.id !== id);
    notifyListeners();
    return { success: true };
  },

  likeBlog: async (idOrSlug) => {
    try {
      const res = await fetch(`/api/blogs/${idOrSlug}/like`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          currentBlogs = currentBlogs.map((b) =>
            b._id === idOrSlug || b.id === idOrSlug || b.slug === idOrSlug
              ? { ...b, likes: json.likes }
              : b
          );
          notifyListeners();
          return json.likes;
        }
      }
    } catch (err) {
      console.error('Like blog error:', err);
    }
    // Optimistic fallback
    currentBlogs = currentBlogs.map((b) =>
      b._id === idOrSlug || b.id === idOrSlug || b.slug === idOrSlug
        ? { ...b, likes: (b.likes || 0) + 1 }
        : b
    );
    notifyListeners();
  },

  // -----------------------------------------------------------
  // Profile, Projects, Skills & Certifications API
  // -----------------------------------------------------------
  updatePersonalInfo: (updatedInfo) => {
    const newData = { ...currentData, personalInfo: { ...currentData.personalInfo, ...updatedInfo } };
    syncPortfolioToMongoDB(newData);
  },

  addProject: (project) => {
    const newProject = {
      ...project,
      id: project.id || `proj-${Date.now()}`
    };
    const newData = { ...currentData, projects: [newProject, ...currentData.projects] };
    syncPortfolioToMongoDB(newData);
  },

  updateProject: (id, updatedFields) => {
    const newProjects = currentData.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    const newData = { ...currentData, projects: newProjects };
    syncPortfolioToMongoDB(newData);
  },

  deleteProject: (id) => {
    const newProjects = currentData.projects.filter((p) => p.id !== id);
    const newData = { ...currentData, projects: newProjects };
    syncPortfolioToMongoDB(newData);
  },

  addSkill: (categoryKey, name, level = 85) => {
    const catSkills = currentData.skills[categoryKey] || [];
    const updatedCat = [...catSkills, { name, level: Number(level) }];
    const newData = {
      ...currentData,
      skills: { ...currentData.skills, [categoryKey]: updatedCat }
    };
    syncPortfolioToMongoDB(newData);
  },

  updateSkill: (categoryKey, skillIndex, updatedFields) => {
    const catSkills = [...(currentData.skills[categoryKey] || [])];
    if (catSkills[skillIndex]) {
      catSkills[skillIndex] = { ...catSkills[skillIndex], ...updatedFields };
      const newData = {
        ...currentData,
        skills: { ...currentData.skills, [categoryKey]: catSkills }
      };
      syncPortfolioToMongoDB(newData);
    }
  },

  deleteSkill: (categoryKey, skillIndex) => {
    const catSkills = (currentData.skills[categoryKey] || []).filter((_, idx) => idx !== skillIndex);
    const newData = {
      ...currentData,
      skills: { ...currentData.skills, [categoryKey]: catSkills }
    };
    syncPortfolioToMongoDB(newData);
  },

  addSkillCategory: (categoryKey, categoryName) => {
    if (!currentData.skills[categoryKey]) {
      const newData = {
        ...currentData,
        skills: { ...currentData.skills, [categoryKey]: [] }
      };
      syncPortfolioToMongoDB(newData);
    }
  },

  addCertification: (cert) => {
    const newData = { ...currentData, certifications: [cert, ...currentData.certifications] };
    syncPortfolioToMongoDB(newData);
  },

  deleteCertification: (index) => {
    const newCerts = currentData.certifications.filter((_, idx) => idx !== index);
    const newData = { ...currentData, certifications: newCerts };
    syncPortfolioToMongoDB(newData);
  },

  addExperience: (exp) => {
    const newData = { ...currentData, experience: [exp, ...currentData.experience] };
    syncPortfolioToMongoDB(newData);
  },

  deleteExperience: (index) => {
    const newExp = currentData.experience.filter((_, idx) => idx !== index);
    const newData = { ...currentData, experience: newExp };
    syncPortfolioToMongoDB(newData);
  },

  // -----------------------------------------------------------
  // Messages API (MongoDB)
  // -----------------------------------------------------------
  addMessage: async (msg) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      const result = await res.json();
      if (result.success && result.message) {
        currentMessages = [result.message, ...currentMessages];
        notifyListeners();
        return result;
      }
    } catch (e) {
      console.error('MongoDB add message failed, saving locally:', e);
    }

    const localMsg = {
      _id: `msg-${Date.now()}`,
      id: `msg-${Date.now()}`,
      name: msg.name || 'Anonymous',
      email: msg.email || '',
      subject: msg.subject || 'Portfolio Inquiry',
      message: msg.message || '',
      timestamp: new Date().toISOString(),
      read: false
    };
    currentMessages = [localMsg, ...currentMessages];
    notifyListeners();
    return { success: true, message: localMsg };
  },

  toggleMessageRead: async (id) => {
    currentMessages = currentMessages.map((m) => (m._id === id || m.id === id ? { ...m, read: !m.read } : m));
    notifyListeners();

    try {
      await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error('Failed to update message read status in MongoDB:', e);
    }
  },

  deleteMessage: async (id) => {
    currentMessages = currentMessages.filter((m) => m._id !== id && m.id !== id);
    notifyListeners();

    try {
      await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error('Failed to delete message in MongoDB:', e);
    }
  },

  clearAllMessages: async () => {
    currentMessages = [];
    notifyListeners();

    try {
      await fetch('/api/messages', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error('Failed to clear messages in MongoDB:', e);
    }
  },

  // -----------------------------------------------------------
  // Backup, Import, Export & Cloud Sync API
  // -----------------------------------------------------------
  refreshFromCloud: async () => {
    try {
      const [resPortfolio, resBlogs] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/blogs', { headers: getAuthHeaders() })
      ]);

      if (resPortfolio.ok) {
        const json = await resPortfolio.json();
        if (json.success && json.data) {
          const dbData = json.data;
          currentData = {
            personalInfo: dbData.personalInfo || fallbackData.personalInfo,
            roles: dbData.roles && dbData.roles.length ? dbData.roles : fallbackData.roles,
            projects: dbData.projects || fallbackData.projects,
            skills: dbData.skills && Object.keys(dbData.skills).length ? dbData.skills : fallbackData.skills,
            certifications: dbData.certifications || fallbackData.certifications,
            experience: dbData.experience || fallbackData.experience,
            activeCourses: dbData.activeCourses || fallbackData.activeCourses
          };
          localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(currentData));
        }
      }

      if (resBlogs.ok) {
        const jsonBlogs = await resBlogs.json();
        if (jsonBlogs.success && Array.isArray(jsonBlogs.blogs)) {
          currentBlogs = jsonBlogs.blogs;
        }
      }

      notifyListeners();
      return { success: true, message: 'Data synced with MongoDB cloud database!' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetToDefaults: async () => {
    currentData = JSON.parse(JSON.stringify(fallbackData));
    currentBlogs = JSON.parse(JSON.stringify(initialBlogs));
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(currentData));
    notifyListeners();
    await syncPortfolioToMongoDB(currentData);
    return { success: true };
  },

  exportJSON: () => {
    return JSON.stringify(
      {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        system: 'Karan Ankade Cyber Portfolio',
        data: currentData,
        blogs: currentBlogs,
        messages: currentMessages
      },
      null,
      2
    );
  },

  importJSON: async (jsonInput) => {
    try {
      const parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON backup format.' };
      }

      let targetData = null;
      let targetMessages = null;
      let targetBlogs = null;

      if (parsed.data && typeof parsed.data === 'object' && (parsed.data.personalInfo || parsed.data.projects)) {
        targetData = parsed.data;
        targetMessages = Array.isArray(parsed.messages) ? parsed.messages : null;
        targetBlogs = Array.isArray(parsed.blogs) ? parsed.blogs : null;
      } else if (parsed.personalInfo || parsed.projects || parsed.skills) {
        targetData = parsed;
        targetMessages = Array.isArray(parsed.messages) ? parsed.messages : null;
        targetBlogs = Array.isArray(parsed.blogs) ? parsed.blogs : null;
      } else {
        return { success: false, error: 'JSON does not contain recognized portfolio fields.' };
      }

      currentData = {
        personalInfo: targetData.personalInfo || fallbackData.personalInfo,
        roles: targetData.roles || fallbackData.roles,
        projects: targetData.projects || fallbackData.projects,
        skills: targetData.skills || fallbackData.skills,
        certifications: targetData.certifications || fallbackData.certifications,
        experience: targetData.experience || fallbackData.experience,
        activeCourses: targetData.activeCourses || fallbackData.activeCourses
      };

      if (targetMessages !== null) currentMessages = targetMessages;
      if (targetBlogs !== null) currentBlogs = targetBlogs;

      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(currentData));
      notifyListeners();
      await syncPortfolioToMongoDB(currentData);
      return { success: true, message: 'Portfolio & Blogs backup restored successfully!' };
    } catch (e) {
      return { success: false, error: 'Failed to parse JSON file: ' + e.message };
    }
  }
};
