import React from 'react';
import { NewsArticle } from '../types';
import { ArrowRight, Clock, Link as LinkIcon } from 'lucide-react';

interface Props {
  article: NewsArticle;
  onAnalyze: (article: NewsArticle) => void;
  isAnalyzing: boolean;
}

export const ArticleCard: React.FC<Props> = ({ article, onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {article.source}
        </span>
        <span className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(article.publishedDate).toLocaleDateString()}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
        {article.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {article.summary}
      </p>

      <div className="flex items-center justify-between mt-auto">
        {article.url && (
           <a 
           href={article.url} 
           target="_blank" 
           rel="noreferrer" 
           className="text-gray-400 hover:text-gray-600 transition-colors"
           title="Open Source"
         >
           <LinkIcon className="w-4 h-4" />
         </a>
        )}
       
        <button
          onClick={() => onAnalyze(article)}
          disabled={isAnalyzing}
          className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
        >
          <span>{isAnalyzing ? 'Analyzing...' : 'Generate Notes'}</span>
          {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
