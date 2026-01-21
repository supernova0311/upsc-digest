import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchNewsViaAI, generateNoteFromContent } from '../services/geminiService';
import { db } from '../services/dbService';
import { ArticleCard } from '../components/ArticleCard';
import { NoteViewer } from '../components/NoteViewer';

const SOURCES = [
  { id: 'the-hindu', name: 'The Hindu', topic: 'national news, policy, and supreme court judgments' },
  { id: 'the-hindu-edit', name: 'The Hindu (Editorials)', topic: 'editorials, opinion pieces, and analysis' },
  { id: 'indian-express', name: 'Indian Express', topic: 'explained series, economy, and politics' },
  { id: 'pib', name: 'PIB (Press Information Bureau)', topic: 'government schemes, cabinet decisions, and press releases' },
  { id: 'livemint', name: 'Livemint', topic: 'indian economy, banking, and finance' },
  { id: 'economic-times', name: 'Economic Times', topic: 'macroeconomy, rbi, and fiscal policy' },
  { id: 'business-standard', name: 'Business Standard', topic: 'business, infrastructure, and policy' },
  { id: 'sansad-tv', name: 'Sansad TV (Rajya Sabha)', topic: 'parliamentary debates, bills passed, and committees' },
  { id: 'dte', name: 'Down To Earth', topic: 'environment, ecology, climate change, and agriculture' }
];

export const NewsScraper = () => {
  const [selectedSource, setSelectedSource] = useState(SOURCES[0]);
  const [status, setStatus] = useState('idle');
  const [articles, setArticles] = useState([]);
  const [generatedNote, setGeneratedNote] = useState(null);
  const [error, setError] = useState('');
  const [analyzingId, setAnalyzingId] = useState(null);

  const handleScrape = async () => {
    setStatus('searching');
    setError('');
    setArticles([]);
    setGeneratedNote(null);
    
    try {
      const results = await fetchNewsViaAI(selectedSource.name, selectedSource.topic);
      setArticles(results);
      results.forEach(a => db.saveArticle(a));
      setStatus('success');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch news. Please try again.');
      setStatus('error');
    }
  };

  const handleAnalyze = async (article) => {
    setAnalyzingId(article.id);
    try {
      const noteData = await generateNoteFromContent(
        `${article.title}\n\n${article.summary}`, 
        article.source
      );
      
      const fullNote = {
        ...noteData,
        _id: '',
        articleId: article.id,
        createdAt: new Date().toISOString()
      };
      
      setGeneratedNote(fullNote);
    } catch (err) {
      setError('Analysis failed. Try again.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSaveNote = async () => {
    if (generatedNote) {
      await db.saveNote(generatedNote);
      alert('Note saved to Database successfully!');
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      
      {/* Left Panel: Search & Results */}
      <div className={`flex-1 flex flex-col space-y-6 ${generatedNote ? 'hidden md:flex' : ''}`}>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-900">Live Scraper</h2>
             <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">DB Status: Connected</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select News Source</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                {SOURCES.map(source => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source)}
                    className={`px-3 py-2 text-sm text-left rounded-lg border transition-all ${
                      selectedSource.id === source.id 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium ring-1 ring-indigo-200' 
                      : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleScrape}
              disabled={status === 'searching'}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center transition-colors shadow-sm"
            >
              {status === 'searching' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Scraping & Processing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Fetch {selectedSource.name} News
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {articles.length > 0 ? (
            <>
              <div className="flex justify-between items-center px-1">
                 <span className="text-sm font-medium text-gray-500">Found {articles.length} articles</span>
                 <button onClick={handleScrape} className="text-xs text-indigo-600 flex items-center hover:underline">
                    <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                 </button>
              </div>
              {articles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzingId === article.id}
                />
              ))}
            </>
          ) : status === 'success' ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No relevant articles found for this topic.</p>
              <button onClick={handleScrape} className="mt-2 text-indigo-600 font-medium text-sm hover:underline">Try again</button>
            </div>
          ) : status === 'idle' ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Select a source and click "Fetch" to start scraping.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Panel: Note Viewer (Overlay on mobile, Split on desktop) */}
      {generatedNote && (
        <div className="fixed inset-0 z-50 md:static md:z-0 md:flex-1 bg-gray-900/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 md:p-0 flex items-center md:items-stretch justify-center">
          <div className="w-full max-w-2xl md:max-w-none h-full">
            <NoteViewer 
              note={generatedNote} 
              onSave={handleSaveNote}
              onClose={() => setGeneratedNote(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
