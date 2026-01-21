import { authService } from './authService';

const BACKEND_URL = 'http://localhost:5000/api';
const STORAGE_KEYS = {
  NOTES: 'upsc_app_notes',
  ARTICLES: 'upsc_app_articles',
};

class DatabaseService {
  constructor() {
    this.useBackend = false;
    this.initPromise = this.checkBackendStatus();
  }

  async checkBackendStatus() {
    try {
        const res = await fetch(`${BACKEND_URL}/health`);
        this.useBackend = res.ok;
        if(this.useBackend) console.log("✅ Connected to Backend API");
    } catch (e) {
        console.log("⚠️ Backend unavailable, using LocalStorage mode");
        this.useBackend = false;
    }
  }

  async ensureInitialized() {
    await this.initPromise;
  }

  getHeaders() {
    const { token } = authService.getStoredAuth();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
  }

  async getNotes() {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/notes`, { headers: this.getHeaders() });
            if (res.ok) return await res.json();
        } catch(e) { console.error(e); }
    }
    
    await this.simulateLatency(300);
    return this.getFromStorage('NOTES').sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async saveNote(note) {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/notes`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(note)
            });
            if (res.ok) {
                const savedNote = await res.json();
                console.log('✅ Note saved to MongoDB');
                return savedNote;
            } else {
                console.error('Backend save failed, status:', res.status);
            }
        } catch(e) { 
            console.error('Backend error, using fallback:', e);
        }
    }

    console.log('💾 Saving to localStorage');
    await this.simulateLatency(500);
    const notes = this.getFromStorage('NOTES');
    const newNote = { ...note, _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    notes.push(newNote);
    this.saveToStorage('NOTES', notes);
    return newNote;
  }

  async deleteNote(id) {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            await fetch(`${BACKEND_URL}/notes/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return;
        } catch(e) { console.error(e); }
    }

    await this.simulateLatency(300);
    const notes = this.getFromStorage('NOTES');
    const filtered = notes.filter(n => n._id !== id);
    this.saveToStorage('NOTES', filtered);
  }

  async getRecentArticles() {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/articles`, { headers: this.getHeaders() });
            if (res.ok) {
                const articles = await res.json();
                console.log('✅ Fetched articles from MongoDB:', articles.length);
                return articles;
            } else {
                console.error('Backend fetch failed, status:', res.status);
            }
        } catch(e) { 
            console.error('Backend error, using fallback:', e);
        }
    }

    const localArticles = this.getFromStorage('ARTICLES');
    console.log('💾 Using localStorage articles:', localArticles.length);
    return localArticles;
  }

  async saveArticle(article) {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            await fetch(`${BACKEND_URL}/articles`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(article)
            });
            return;
        } catch(e) { console.error(e); }
    }

    const articles = this.getFromStorage('ARTICLES');
    if (!articles.find(a => a.title === article.title)) {
      articles.unshift(article);
      if (articles.length > 50) articles.pop();
      this.saveToStorage('ARTICLES', articles);
    }
  }

  getFromStorage(key) {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : [];
  }

  saveToStorage(key, data) {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  }

  async simulateLatency(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const db = new DatabaseService();
