export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: 'Newspaper' | 'Government' | 'Environment' | 'Economy';
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url?: string;
  summary: string;
  publishedDate: string;
  scrapedAt: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctOption: number; // Index 0-3
  explanation: string;
}

export interface MainsQuestion {
  question: string;
  modelAnswerPoints: string[];
}

export interface GeneratedNote {
  _id: string; // MongoDB style ID
  userId?: string; // Owner of the note
  articleId?: string;
  title: string;
  source: string;
  gsPaper: 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Prelims' | 'Essay';
  tags: string[];
  summary: string;
  content: string; // Markdown formatted detailed notes
  mcqs: MCQ[];
  mainsQuestion?: MainsQuestion;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type ProcessingStatus = 'idle' | 'searching' | 'analyzing' | 'success' | 'error';