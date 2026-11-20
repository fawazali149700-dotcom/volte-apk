import React, { useState } from 'react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { AdbGuideModal } from './components/AdbGuideModal';
import { generateProjectZip, downloadBlob } from './utils/zipGenerator';
import { 
  Radio, 
  Smartphone, 
  Code2, 
  Cpu, 
  Terminal, 
  Download, 
  ShieldCheck, 
  Wifi, 
  Signal, 
  Layers,
  HelpCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture'>('simulator');
  const [isAdbModalOpen, setIsAdbModalOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateProjectZip();
      downloadBlob(blob, 'VoLteVoWiFiSwitcher-Android-Project.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" dir="rtl">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">VoLTE & VoWiFi Switcher</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Android Native API 30+
                </span>
              </div>
              <p className="text-xs text-slate-400">تطبيق أندرويد أصلي للتحكم بخدمات IMS لكل شريحة SIM</p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href="/volte-switcher.html"
              download="VoLTE-VoWiFi-Switcher.html"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm"
              title="تحميل كود المشروع والمحاكي بالكامل كملف HTML مستقل"
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>تحميل بصيغة HTML</span>
            </a>

            <button
              onClick={() => setIsAdbModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors"
            >
              <Terminal className="w-4 h-4 text-indigo-400" />
              أوامر ADB و Shizuku
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isZipping ? 'animate-bounce' : ''}`} />
              <span className="hidden xs:inline">{isZipping ? 'جاري التحميل...' : 'تحميل كود المشروع (ZIP)'}</span>
              <span className="xs:hidden">تحميل ZIP</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            المحاكي التفاعلي المباشر (Phone Simulator)
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            الكود المصدري وملفات المشروع (Source Code)
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            البنية المعمارية ومنطق النظام (Architecture)
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Intro Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">تطبيق أندرويد حقيقي مكتوب بلغة Kotlin مع واجهة Material 3</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    يقوم بتعديل مفاتيح <code className="text-indigo-300 font-mono">Settings.Global</code> الفعلية لكل شريحة عبر Shizuku بدون الحاجة للروت
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5 text-indigo-400" />
                  Dual SIM (DSDS)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  Shizuku Ready
                </span>
              </div>
            </div>

            {/* Interactive Phone Simulator */}
            <PhoneSimulator onOpenAdbGuide={() => setIsAdbModalOpen(true)} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="animate-fade-in">
            <CodeExplorer />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="animate-fade-in">
            <ArchitectureGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>جاهز للاستيراد والبناء المباشر في Android Studio (Ladybug / Iguana / Koala)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>الهدف: Android 11 - 15 (API 30 - 35)</span>
            <span>•</span>
            <span>Jetpack Compose</span>
            <span>•</span>
            <span>Shizuku IPC v13.1.5</span>
          </div>
        </div>
      </footer>

      {/* ADB Guide Modal */}
      <AdbGuideModal
        isOpen={isAdbModalOpen}
        onClose={() => setIsAdbModalOpen(false)}
      />

    </div>
  );
}
