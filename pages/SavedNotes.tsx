import React, { useEffect, useState } from 'react';
import { db } from '../services/dbService';
import { GeneratedNote } from '../types';
import { NoteViewer } from '../components/NoteViewer';
import { Search, Filter, Trash2, Eye } from 'lucide-react';

export const SavedNotes: React.FC = () => {
  const [notes, setNotes] = useState<GeneratedNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<GeneratedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await db.getNotes();
    setNotes(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await db.deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
    }
  };

  const filteredNotes = notes
    .filter(n => filter === 'All' || n.gsPaper === filter)
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:flex-row gap-6">
      
      {/* List Panel */}
      <div className={`flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search database..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'GS1', 'GS2', 'GS3', 'GS4'].map(tag => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-3 py-1 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${
                  filter === tag 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
             <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No notes found.</div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note._id}
                onClick={() => setSelectedNote(note)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                  selectedNote?._id === note._id ? 'bg-indigo-50 border-indigo-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                     note.gsPaper === 'GS1' ? 'bg-red-100 text-red-700' :
                     note.gsPaper === 'GS2' ? 'bg-blue-100 text-blue-700' :
                     note.gsPaper === 'GS3' ? 'bg-green-100 text-green-700' :
                     'bg-purple-100 text-purple-700'
                  }`}>
                    {note.gsPaper}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{note.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{note.summary}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      {selectedNote ? (
        <div className="flex-[1.5] h-full">
           <NoteViewer 
             note={selectedNote} 
             saved={true}
             onClose={() => setSelectedNote(null)}
             onDelete={() => handleDelete(selectedNote._id)}
           />
        </div>
      ) : (
        <div className="hidden md:flex flex-[1.5] bg-gray-50 rounded-xl border border-gray-200 border-dashed items-center justify-center text-gray-400">
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Select a note to view details</p>
          </div>
        </div>
      )}
    </div>
  );
};
