import React from 'react';
import { GeneratedNote } from '../types';
import ReactMarkdown from 'react-markdown';
import { CheckCircle, Book, HelpCircle, Save, Trash2, X, Download } from 'lucide-react';

interface Props {
  note: GeneratedNote;
  onSave?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
  saved?: boolean;
}

export const NoteViewer: React.FC<Props> = ({ note, onSave, onClose, onDelete, saved }) => {
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `# ${note.title}\n\n` +
      `**Source:** ${note.source} | **GS Paper:** ${note.gsPaper}\n` +
      `**Date:** ${new Date().toLocaleDateString()}\n\n` +
      `## Summary\n${note.summary}\n\n` +
      `## Detailed Notes\n${note.content}\n\n` +
      `## Mains Question\n${note.mainsQuestion?.question}\n\n` +
      `### Model Points\n${note.mainsQuestion?.modelAnswerPoints.map(p => `- ${p}`).join('\n')}`
    ], {type: 'text/markdown'});
    
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
        <div className="min-w-0 pr-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded uppercase ${
              note.gsPaper === 'GS1' ? 'bg-red-100 text-red-700' :
              note.gsPaper === 'GS2' ? 'bg-blue-100 text-blue-700' :
              note.gsPaper === 'GS3' ? 'bg-green-100 text-green-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {note.gsPaper}
            </span>
            <span className="text-xs text-gray-500 truncate">{new Date().toLocaleDateString()}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight truncate">{note.title}</h2>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
           <button 
              onClick={handleDownload}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              title="Download Markdown"
            >
              <Download className="w-5 h-5" />
            </button>
          {onSave && (
            <button 
              onClick={onSave}
              className={`p-2 rounded-full transition-colors ${saved ? 'bg-green-100 text-green-700' : 'bg-white border hover:bg-gray-50 text-gray-600'}`}
              title={saved ? "Saved" : "Save to Database"}
            >
              {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            </button>
          )}
          {onDelete && (
             <button 
             onClick={onDelete}
             className="p-2 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
             title="Delete"
           >
             <Trash2 className="w-5 h-5" />
           </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Summary Section */}
        <section>
          <h3 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            <Book className="w-4 h-4 mr-2" />
            Executive Summary
          </h3>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-gray-800 text-sm leading-relaxed">
            {note.summary}
          </div>
        </section>

        {/* Main Content */}
        <section className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </section>

        {/* Mains Question */}
        {note.mainsQuestion && (
          <section className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
             <h3 className="flex items-center text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3">
              <HelpCircle className="w-4 h-4 mr-2" />
              Mains Practice Question
            </h3>
            <p className="font-serif text-lg text-gray-900 mb-4 font-medium italic">
              "{note.mainsQuestion.question}"
            </p>
            <div className="space-y-2">
              <p className="text-xs font-bold text-indigo-600 uppercase">Structure Approach:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {note.mainsQuestion.modelAnswerPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Prelims MCQs */}
        {note.mcqs.length > 0 && (
          <section>
            <h3 className="flex items-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              Prelims MCQs
            </h3>
            <div className="grid gap-4">
              {note.mcqs.map((mcq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <p className="font-medium text-gray-900 mb-3">
                    <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                    {mcq.question}
                  </p>
                  <div className="space-y-2 mb-4">
                    {mcq.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-start text-sm text-gray-600">
                        <span className="w-6 font-mono text-gray-400">({String.fromCharCode(65 + optIdx)})</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-indigo-600 font-medium hover:text-indigo-800">Show Answer & Explanation</summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700">
                      <p className="mb-1"><span className="font-bold">Answer:</span> {String.fromCharCode(65 + mcq.correctOption)}</p>
                      <p>{mcq.explanation}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};