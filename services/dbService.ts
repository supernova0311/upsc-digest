import { GeneratedNote, NewsArticle } from '../types';
import { authService } from './authService';

const BACKEND_URL = 'http://localhost:5000/api';
const STORAGE_KEYS = {
  NOTES: 'upsc_app_notes',
  ARTICLES: 'upsc_app_articles',
};

class DatabaseService {
  private useBackend = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.checkBackendStatus();
  }

  private async checkBackendStatus() {
    try {
        const res = await fetch(`${BACKEND_URL}/health`);
        this.useBackend = res.ok;
        if(this.useBackend) console.log("✅ Connected to Backend API");
    } catch (e) {
        console.log("⚠️ Backend unavailable, using LocalStorage mode");
        this.useBackend = false;
    }
  }

  private async ensureInitialized() {
    await this.initPromise;
  }

  // --- Helper for Headers ---
  private getHeaders() {
    const { token } = authService.getStoredAuth();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
  }

  // --- Notes Operations ---

  async getNotes(): Promise<GeneratedNote[]> {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/notes`, { headers: this.getHeaders() });
            if (res.ok) return await res.json();
        } catch(e) { console.error(e); }
    }
    
    // Fallback
    await this.simulateLatency(300);
    return this.getFromStorage<GeneratedNote>(STORAGE_KEYS.NOTES).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async saveNote(note: GeneratedNote): Promise<GeneratedNote> {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/notes`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(note)
            });
            if (res.ok) return await res.json();
        } catch(e) { console.error(e); }
    }

    // Fallback
    await this.simulateLatency(500);
    const notes = this.getFromStorage<GeneratedNote>(STORAGE_KEYS.NOTES);
    const newNote = { ...note, _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    notes.push(newNote);
    this.saveToStorage(STORAGE_KEYS.NOTES, notes);
    return newNote;
  }

  async deleteNote(id: string): Promise<void> {
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

    // Fallback
    await this.simulateLatency(300);
    const notes = this.getFromStorage<GeneratedNote>(STORAGE_KEYS.NOTES);
    const filtered = notes.filter(n => n._id !== id);
    this.saveToStorage(STORAGE_KEYS.NOTES, filtered);
  }

  // --- Article History ---

  async getRecentArticles(): Promise<NewsArticle[]> {
    await this.ensureInitialized();

    if (this.useBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/articles`, { headers: this.getHeaders() });
            if (res.ok) return await res.json();
        } catch(e) { console.error(e); }
    }

    return this.getFromStorage<NewsArticle>(STORAGE_KEYS.ARTICLES);
  }

  async saveArticle(article: NewsArticle): Promise<void> {
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

    // Fallback
    const articles = this.getFromStorage<NewsArticle>(STORAGE_KEYS.ARTICLES);
    // Avoid duplicates in local storage
    if (!articles.find(a => a.title === article.title)) {
      articles.unshift(article);
      if (articles.length > 50) articles.pop();
      this.saveToStorage(STORAGE_KEYS.ARTICLES, articles);
    }
  }

  // --- LocalStorage Helpers ---
  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private async simulateLatency(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const db = new DatabaseService();