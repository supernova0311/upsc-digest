import React, { useEffect, useState } from 'react';
import { db } from '../services/dbService';
import { GeneratedNote, NewsArticle } from '../types';
import { Link } from 'react-router-dom';
import { Newspaper, BookOpen, ArrowUpRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { generateDailyDigest } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<GeneratedNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Digest State
  const [digest, setDigest] = useState<string | null>(null);
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const notesData = await db.getNotes();
    const articlesData = await db.getRecentArticles();
    setNotes(notesData);
    setRecentArticles(articlesData);
    setLoading(false);
  };

  const handleGenerateDigest = async () => {
    if (recentArticles.length === 0) return;
    setGeneratingDigest(true);
    try {
        // Synthesize top 15 most recent articles
        const text = await generateDailyDigest(recentArticles.slice(0, 15));
        setDigest(text);
    } catch (e) {
        console.error(e);
        alert("Failed to generate digest. Please try again.");
    } finally {
        setGeneratingDigest(false);
    }
  };

  const stats = {
    total: notes.length,
    gs1: notes.filter(n => n.gsPaper === 'GS1').length,
    gs2: notes.filter(n => n.gsPaper === 'GS2').length,
    gs3: notes.filter(n => n.gsPaper === 'GS3').length,
    gs4: notes.filter(n => n.gsPaper === 'GS4').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Aspirant</h1>
        <p className="text-gray-500">Here's your daily UPSC preparation overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Notes</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">GS II (Polity)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.gs2}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">GS III (Economy)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.gs3}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-sm font-medium text-gray-500">Recent Activity</p>
           <p className="text-sm text-gray-600 mt-3 flex items-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
              notes.length > 0 ? `Last: ${new Date(notes[0].createdAt).toLocaleDateString()}` : 'No activity'}
           </p>
        </div>
      </div>

      {/* Daily Digest Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                        Daily AI Digest
                    </h2>
                    <p className="text-gray-400 mt-1">Automated synthesis of your scraped news headlines.</p>
                </div>
                {digest && (
                    <button 
                        onClick={handleGenerateDigest} 
                        disabled={generatingDigest}
                        className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg flex items-center"
                    >
                        <RefreshCw className={`w-3 h-3 mr-1 ${generatingDigest ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                )}
            </div>

            {!digest ? (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    {recentArticles.length === 0 ? (
                         <div className="space-y-3">
                            <p className="text-gray-400">No recent news articles found to analyze.</p>
                            <Link to="/scraper" className="inline-block text-indigo-400 hover:text-indigo-300 text-sm font-medium">Go to Scraper &rarr;</Link>
                         </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300">Found {recentArticles.length} recent articles available for analysis.</p>
                            <button 
                                onClick={handleGenerateDigest}
                                disabled={generatingDigest}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center mx-auto"
                            >
                                {generatingDigest ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                Generate Today's Briefing
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="prose prose-invert max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-sm max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    <ReactMarkdown>{digest}</ReactMarkdown>
                 </div>
            )}
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/scraper" className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="relative z-10">
            <Newspaper className="w-10 h-10 mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-2">Fetch Today's News</h3>
            <p className="text-indigo-100 mb-6 max-w-sm">Use AI to scrape and aggregate important headlines from The Hindu, Indian Express, and PIB.</p>
            <span className="inline-flex items-center font-medium group-hover:translate-x-1 transition-transform">
              Start Scraper <ArrowUpRight className="ml-2 w-4 h-4" />
            </span>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        </Link>

        <Link to="/notes" className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
          <div className="relative z-10">
            <BookOpen className="w-10 h-10 mb-4 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Review Notes</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Access your MongoDB database of saved notes, generated MCQs, and Mains answers.</p>
            <span className="inline-flex items-center font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
              Open Database <ArrowUpRight className="ml-2 w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Notes List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recently Generated Notes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading database...</div>
          ) : notes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notes generated yet. Start scraping!</div>
          ) : (
            notes.slice(0, 5).map(note => (
              <div key={note._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`w-2 h-2 rounded-full ${
                    note.gsPaper === 'GS1' ? 'bg-red-500' :
                    note.gsPaper === 'GS2' ? 'bg-blue-500' :
                    note.gsPaper === 'GS3' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></span>
                  <div>
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleDateString()} • {note.source}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">{note.gsPaper}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};