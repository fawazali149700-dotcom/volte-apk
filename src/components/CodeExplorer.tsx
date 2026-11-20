import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidProjectFile } from '../data/androidProjectFiles';
import { generateProjectZip, downloadBlob } from '../utils/zipGenerator';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Search, 
  FolderGit2, 
  FileText, 
  Settings, 
  Layers, 
  Terminal,
  ExternalLink,
  FolderOpen
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(ANDROID_PROJECT_FILES[4]); // MainActivity or ImsController
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = ANDROID_PROJECT_FILES.filter(file => {
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateProjectZip();
      downloadBlob(blob, 'VoLteVoWiFiSwitcher-Android-Studio.zip');
    } catch (e) {
      console.error('Failed to generate zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto" dir="rtl">
      {/* Top Banner & Quick Download */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <FolderGit2 className="w-5 h-5" />
            <span>مشروع أندرويد ستوديو أصلي كامل (Full Kotlin & Jetpack Compose Native App)</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-white">
            مستكشف الكود المصدري وجميع ملفات المشروع الجاهزة للبناء
          </h2>
          <p className="text-xs text-slate-400">
            كود احترافي نظيف، موثق بالتعليقات، متوافق مع Android 11 حتى 15، ويشمل Shizuku و ImsMmTelManager و Dual SIM
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Download className={`w-4 h-4 ${isZipping ? 'animate-bounce' : ''}`} />
          {isZipping ? 'جاري تجميع ملف ZIP...' : 'تحميل المشروع كاملاً (Android Studio ZIP)'}
        </button>
      </div>

      {/* Main Code View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left/Right Sidebar: File Tree & Search (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[700px] shadow-lg">
          
          {/* Search box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="ابحث في أسماء الملفات أو الأكواد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 pb-2 border-b border-slate-800/80 overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الكل ({ANDROID_PROJECT_FILES.length})
            </button>
            <button
              onClick={() => setActiveCategory('core')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'core'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              المنطق البرمجي (Core)
            </button>
            <button
              onClick={() => setActiveCategory('ui')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'ui'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الواجهات (UI)
            </button>
            <button
              onClick={() => setActiveCategory('config')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'config'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الإعدادات (Gradle)
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1">
            {filteredFiles.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-2.5 rounded-xl transition-all flex items-start gap-2.5 border ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {file.language === 'kotlin' && <span className="font-mono text-purple-400 text-[10px] font-bold">KT</span>}
                    {file.language === 'xml' && <span className="font-mono text-orange-400 text-[10px] font-bold">XML</span>}
                    {file.language === 'properties' && <span className="font-mono text-emerald-400 text-[10px] font-bold">TOML</span>}
                    {file.language === 'markdown' && <span className="font-mono text-blue-400 text-[10px] font-bold">MD</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-slate-200">{file.filename}</span>
                      <span className="text-[10px] font-mono text-slate-500 truncate" dir="ltr">
                        {file.content.split('\n').length}L
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {file.description}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5 truncate" dir="ltr">
                      {file.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right/Left Code View: Editor (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] shadow-lg overflow-hidden">
          
          {/* File Header & Actions */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{selectedFile.filename}</span>
                <span className="text-[10px] font-mono text-slate-400 block truncate" dir="ltr">{selectedFile.path}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ!' : 'نسخ الكود'}
              </button>
            </div>
          </div>

          {/* Description bar */}
          <div className="px-4 py-2 bg-indigo-950/30 border-b border-slate-800/80 text-xs text-indigo-200 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>{selectedFile.description}</span>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-left" dir="ltr">
            <pre className="text-slate-300">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};
