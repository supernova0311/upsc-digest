import React, { useRef, useState } from 'react';
import { GeneratedNote } from '../types';
import ReactMarkdown from 'react-markdown';
import { CheckCircle, Book, HelpCircle, Save, Trash2, X, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  note: GeneratedNote;
  onSave?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
  saved?: boolean;
}

export const NoteViewer: React.FC<Props> = ({ note, onSave, onClose, onDelete, saved }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `# ${note.title}\n\n` +
      `**Source:** ${note.source} | **GS Paper:** ${note.gsPaper}\n` +
      `**Date:** ${new Date().toLocaleDateString()}\n\n` +
      `## Summary\n${note.summary}\n\n` +
      `## Detailed Notes\n${note.content}\n\n` +
      (note.mainsQuestion ? `## Mains Question\n${note.mainsQuestion?.question}\n\n### Model Points\n${note.mainsQuestion?.modelAnswerPoints.map(p => `- ${p}`).join('\n')}\n\n` : '') +
      (note.mcqs.length > 0 ? `## MCQs\n${note.mcqs.map((mcq, i) => `\n### Q${i + 1}. ${mcq.question}\n${mcq.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}\n**Answer:** ${String.fromCharCode(65 + mcq.correctOption)}\n**Explanation:** ${mcq.explanation}`).join('\n')}` : '')
    ], {type: 'text/markdown'});
    
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      if (!contentRef.current) return;
      
      // Create a temporary container for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.6';
      
      // Build HTML content
      tempDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">${note.title}</h1>
          <div style="color: #6b7280; font-size: 11px;">
            <p><strong>Source:</strong> ${note.source}</p>
            <p><strong>GS Paper:</strong> ${note.gsPaper}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #4f46e5; font-size: 14px; margin-bottom: 10px;">Executive Summary</h2>
          <div style="background-color: #fffbeb; padding: 10px; border-left: 4px solid #fbbf24;">
            ${note.summary}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #4f46e5; font-size: 14px; margin-bottom: 10px;">Detailed Notes</h2>
          <div>${note.content.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
        </div>
        
        ${note.mainsQuestion ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #4f46e5; font-size: 14px; margin-bottom: 10px;">Mains Practice Question</h2>
          <p style="font-style: italic; margin-bottom: 10px;"><strong>"${note.mainsQuestion.question}"</strong></p>
          <h3 style="font-size: 12px; margin-bottom: 5px;">Structure Approach:</h3>
          <ul style="margin-left: 20px;">
            ${note.mainsQuestion.modelAnswerPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${note.mcqs.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2 style="color: #4f46e5; font-size: 14px; margin-bottom: 10px;">Prelims MCQs</h2>
          ${note.mcqs.map((mcq, i) => `
            <div style="margin-bottom: 15px; border: 1px solid #e5e7eb; padding: 10px; border-radius: 5px;">
              <p style="margin-bottom: 8px;"><strong>Q${i + 1}. ${mcq.question}</strong></p>
              <div style="margin-left: 10px; margin-bottom: 8px;">
                ${mcq.options.map((opt, j) => `<p>(<strong>${String.fromCharCode(65 + j)}</strong>) ${opt}</p>`).join('')}
              </div>
              <p style="background-color: #f3f4f6; padding: 5px; border-radius: 3px;">
                <strong>Answer:</strong> ${String.fromCharCode(65 + mcq.correctOption)}<br/>
                <strong>Explanation:</strong> ${mcq.explanation}
              </p>
            </div>
          `).join('')}
        </div>
        ` : ''}
      `;
      
      document.body.appendChild(tempDiv);
      
      // Convert to canvas and then to PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add pages
      const imgData = canvas.toDataURL('image/png');
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297; // A4 height in mm
        position -= 297;
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
      
      pdf.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
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
          {/* Download Dropdown */}
          <div className="relative group">
            <button 
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center space-x-1"
              title="Download Note"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">▼</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 first:rounded-t-lg"
              >
                <FileText className="w-4 h-4" />
                <span>{downloading ? 'Generating PDF...' : 'Download as PDF'}</span>
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 last:rounded-b-lg"
              >
                <FileText className="w-4 h-4" />
                <span>Download as Markdown</span>
              </button>
            </div>
          </div>
          
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
      <div ref={contentRef} className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
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