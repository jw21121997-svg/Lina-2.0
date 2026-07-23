import React, { useState } from 'react';
import { FileText, Plus, Pin, Trash2, Search, HardDrive } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';
import { getCachedAccessToken } from '../../lib/firebase';
import { uploadFileToDrive } from '../../lib/googleDrive';

export const NotesModule: React.FC = () => {
  const { notes, refreshAllModules, setActiveModule } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'recipes' | 'ideas' | 'manuals' | 'important'>('general');
  const [search, setSearch] = useState('');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExportToDrive = async (note: { title: string; content: string; category: string }) => {
    const token = getCachedAccessToken();
    if (!token) {
      setActiveModule('drive');
      return;
    }
    try {
      setExportStatus(`Exporting "${note.title}"...`);
      await uploadFileToDrive(token, `${note.title}.txt`, note.content, 'text/plain');
      setExportStatus(`"${note.title}" saved to Google Drive!`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err: any) {
      setExportStatus(`Export failed: ${err.message}`);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await api.addNote({
      title,
      content,
      category,
      tags: [category],
    });
    setTitle('');
    setContent('');
    await refreshAllModules();
  };

  const handleDelete = async (id: string) => {
    await api.deleteNote(id);
    await refreshAllModules();
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Notes & Knowledge Base</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Wi-Fi passwords, appliance manuals, ideas, and family guidelines</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {exportStatus && (
        <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-2xl text-xs text-violet-200 font-semibold flex items-center justify-between">
          <span>{exportStatus}</span>
        </div>
      )}

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="general">General</option>
            <option value="recipes">Recipes</option>
            <option value="ideas">Ideas</option>
            <option value="manuals">Manuals</option>
            <option value="important">Important</option>
          </select>
        </div>
        <textarea
          placeholder="Note content / details..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-600/30"
        >
          <Plus className="w-4 h-4" /> Save Note
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            No notes found. Create your first note above to build your family knowledge base.
          </div>
        ) : (
          filteredNotes.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                n.isPinned ? 'bg-violet-950/20 border-violet-500/40' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-violet-300 font-bold text-[10px] uppercase">
                    {n.category}
                  </span>
                  {n.isPinned && <Pin className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />}
                </div>
                <div className="font-bold text-base text-white">{n.title}</div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap mt-2">{n.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Updated {n.updatedAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportToDrive(n)}
                    title="Export Note to Google Drive"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Drive</span>
                  </button>
                  <button onClick={() => handleDelete(n.id)} className="p-1.5 text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
