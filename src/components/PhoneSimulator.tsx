import React, { useState } from 'react';
import { 
  Signal, 
  Wifi, 
  Battery, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  ShieldCheck, 
  Smartphone,
  PhoneCall,
  Sliders,
  Radio,
  Check,
  Zap,
  RotateCcw
} from 'lucide-react';

export interface SimState {
  id: number;
  slotIndex: number;
  subId: number;
  displayName: string;
  carrierName: string;
  networkType: '5G' | '4G LTE' | '3G';
  voLte: boolean;
  voWiFi: boolean;
  supportedByCarrier: boolean;
}

export interface SimLog {
  id: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
  tag: string;
  message: string;
  command?: string;
}

interface PhoneSimulatorProps {
  onOpenAdbGuide: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ onOpenAdbGuide }) => {
  // Permission mode state
  const [permissionMode, setPermissionMode] = useState<'shizuku' | 'adb' | 'none'>('shizuku');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'rawSettings'>('app');

  // Dual SIM States
  const [sims, setSims] = useState<SimState[]>([
    {
      id: 1,
      slotIndex: 0,
      subId: 1,
      displayName: 'الشريحة الأولى (SIM 1)',
      carrierName: 'STC Saudi',
      networkType: '5G',
      voLte: true,
      voWiFi: true,
      supportedByCarrier: true
    },
    {
      id: 2,
      slotIndex: 1,
      subId: 2,
      displayName: 'الشريحة الثانية (SIM 2)',
      carrierName: 'Mobily KSA',
      networkType: '4G LTE',
      voLte: false,
      voWiFi: false,
      supportedByCarrier: true
    }
  ]);

  // Real-time Logs
  const [logs, setLogs] = useState<SimLog[]>([
    {
      id: 'log-1',
      timestamp: '20:14:02',
      type: 'info',
      tag: 'ImsController',
      message: 'تم تهيئة محرك تحكم IMS وربطه بـ TelephonyManager',
      command: 'SubscriptionManager.getActiveSubscriptionInfoList()'
    },
    {
      id: 'log-2',
      timestamp: '20:14:03',
      type: 'success',
      tag: 'ShizukuManager',
      message: 'خدمة Shizuku متصلة ونشطة (صلاحية ADB Shell متوفرة)',
      command: 'dev.rikka.shizuku.Shizuku.pingBinder() -> true'
    },
    {
      id: 'log-3',
      timestamp: '20:14:04',
      type: 'info',
      tag: 'ImsState',
      message: 'SIM 1 (STC): VoLTE=ON, VoWiFi=ON | SIM 2 (Mobily): VoLTE=OFF, VoWiFi=OFF'
    }
  ]);

  const addLog = (type: SimLog['type'], tag: string, message: string, command?: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    const newEntry: SimLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: time,
      type,
      tag,
      message,
      command
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  // Toggle VoLTE
  const handleToggleVoLte = (simId: number) => {
    const targetSim = sims.find(s => s.id === simId);
    if (!targetSim) return;

    const nextState = !targetSim.voLte;
    const actionName = nextState ? 'تفعيل' : 'إيقاف';

    addLog(
      'info',
      'ImsController',
      `طلب ${actionName} خدمة VoLTE للشريحة ${targetSim.id} (${targetSim.carrierName})`
    );

    // Check permissions
    if (permissionMode === 'none') {
      addLog(
        'error',
        'SecurityException',
        `فشل ${actionName} VoLTE: يتطلب صلاحية WRITE_SECURE_SETTINGS أو خدمة Shizuku`,
        'Permission denied: android.permission.WRITE_SECURE_SETTINGS'
      );
      return;
    }

    // Success simulation
    const val = nextState ? '1' : '0';
    const cmd = permissionMode === 'shizuku'
      ? `settings put global volte_vt_enabled_${targetSim.slotIndex} ${val} && cmd phone set-volte-enabled ${targetSim.subId} ${nextState}`
      : `Settings.Global.putInt(contentResolver, "volte_vt_enabled_${targetSim.slotIndex}", ${val})`;

    setSims(prev => prev.map(s => s.id === simId ? { ...s, voLte: nextState } : s));

    addLog(
      'success',
      permissionMode === 'shizuku' ? 'ShizukuShell' : 'Settings.Global',
      `تم ${actionName} VoLTE بنجاح في نظام الهاتف!`,
      cmd
    );
  };

  // Toggle VoWiFi
  const handleToggleVoWiFi = (simId: number) => {
    const targetSim = sims.find(s => s.id === simId);
    if (!targetSim) return;

    const nextState = !targetSim.voWiFi;
    const actionName = nextState ? 'تفعيل' : 'إيقاف';

    addLog(
      'info',
      'ImsController',
      `طلب ${actionName} خدمة VoWiFi للشريحة ${targetSim.id} (${targetSim.carrierName})`
    );

    if (permissionMode === 'none') {
      addLog(
        'error',
        'SecurityException',
        `فشل ${actionName} VoWiFi: لا توجد صلاحيات لتعديل Settings.Global`,
        'Requires WRITE_SECURE_SETTINGS or Shizuku IPC'
      );
      return;
    }

    const val = nextState ? '1' : '0';
    const cmd = permissionMode === 'shizuku'
      ? `settings put global wfc_ims_enabled_${targetSim.slotIndex} ${val} && cmd phone set-vowifi-enabled ${targetSim.subId} ${nextState}`
      : `Settings.Global.putInt(contentResolver, "wfc_ims_enabled_${targetSim.slotIndex}", ${val})`;

    setSims(prev => prev.map(s => s.id === simId ? { ...s, voWiFi: nextState } : s));

    addLog(
      'success',
      permissionMode === 'shizuku' ? 'ShizukuShell' : 'Settings.Global',
      `تم ${actionName} VoWiFi (المكالمات عبر Wi-Fi) بنجاح!`,
      cmd
    );
  };

  // Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    addLog('info', 'SubscriptionManager', 'جاري قراءة حالة الشرائح الفعلية من راديو الهاتف...');

    setTimeout(() => {
      setIsRefreshing(false);
      addLog(
        'success',
        'ImsMmTelManager',
        'تم تحديث البيانات وقراءة حالة IMS لكلا الشريحتين من النظام',
        `SIM1: VoLTE=${sims[0].voLte}, SIM2: VoLTE=${sims[1].voLte}`
      );
    }, 600);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Check if any SIM has VoLTE active
  const anyVoLteActive = sims.some(s => s.voLte);
  const anyVoWiFiActive = sims.some(s => s.voWiFi);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-6xl mx-auto" dir="rtl">
      {/* Phone Simulator Frame */}
      <div className="w-full max-w-[420px] mx-auto shrink-0">
        <div className="relative bg-slate-950 p-3 rounded-[48px] shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/60">
          
          {/* Inner Screen */}
          <div className="bg-slate-900 rounded-[38px] overflow-hidden border border-slate-800 flex flex-col h-[760px] text-slate-100 select-none">
            
            {/* Status Bar */}
            <div className="h-10 bg-slate-950 px-6 flex items-center justify-between text-xs text-slate-300 relative shrink-0">
              {/* Dynamic Island / Notch */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-900/60"></span>
              </div>

              {/* Time */}
              <span className="font-semibold text-xs tracking-wide">20:25</span>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-[10px]">
                {/* Dynamic VoLTE Badge */}
                {anyVoLteActive && (
                  <span className="px-1 py-0.2 bg-indigo-600/90 text-white rounded font-mono font-bold text-[9px] animate-pulse">
                    VoLTE
                  </span>
                )}
                {/* Dynamic VoWiFi Badge */}
                {anyVoWiFiActive && (
                  <span className="px-1 py-0.2 bg-emerald-600/90 text-white rounded font-mono font-bold text-[9px] animate-pulse flex items-center gap-0.5">
                    <Wifi className="w-2.5 h-2.5" />
                    VoWiFi
                  </span>
                )}
                <span className="font-mono text-[10px] text-slate-300 font-bold">5G</span>
                <Signal className="w-3.5 h-3.5 text-slate-300" />
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
                <Battery className="w-4 h-4 text-emerald-400 rotate-90" />
              </div>
            </div>

            {/* App Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800/80 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight">VoLTE & VoWiFi Switcher</h1>
                  <span className="text-[11px] text-slate-400">إدارة شبكة المكالمات للشرائح</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenAdbGuide}
                  title="دليل الصلاحيات"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="تحديث الحالة من النظام"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Phone Screen Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Permission Status Banner */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                permissionMode !== 'none'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {permissionMode !== 'none' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">
                        {permissionMode === 'shizuku' && 'الصلاحية مفعلة (عبر Shizuku Shell)'}
                        {permissionMode === 'adb' && 'الصلاحية مفعلة (عبر WRITE_SECURE_SETTINGS)'}
                        {permissionMode === 'none' && 'مطلوب إذن WRITE_SECURE_SETTINGS'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {permissionMode !== 'none'
                          ? 'جاهز لتطبيق التعديل الفعلي على النظام'
                          : 'اضغط للمنح أو اتبع دليل ADB'}
                      </p>
                    </div>
                  </div>

                  {permissionMode === 'none' ? (
                    <button
                      onClick={() => setPermissionMode('shizuku')}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow shrink-0"
                    >
                      منح Shizuku
                    </button>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                      مُفعل
                    </span>
                  )}
                </div>
              </div>

              {/* SIM Cards List */}
              <div className="space-y-3.5">
                {sims.map(sim => (
                  <div
                    key={sim.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-all"
                  >
                    {/* Top SIM Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                          {sim.slotIndex + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">{sim.displayName}</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                              subId: {sim.subId}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{sim.carrierName}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                        {sim.networkType}
                      </span>
                    </div>

                    <div className="h-px bg-slate-700/60 my-2.5"></div>

                    {/* VoLTE Switch Row */}
                    <div className="flex items-center justify-between py-1.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">مكالمات 4G (VoLTE)</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            sim.voLte ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            {sim.voLte ? 'مفعل' : 'معطل'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">صوت HD وبقاء الهاتف على شبكة 4G أثناء الاتصال</p>
                      </div>

                      {/* Switch */}
                      <button
                        onClick={() => handleToggleVoLte(sim.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                          sim.voLte ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform flex items-center justify-center text-[10px] ${
                            sim.voLte ? '-translate-x-5' : 'translate-x-0'
                          }`}
                        >
                          {sim.voLte && <Check className="w-3 h-3 text-indigo-600 stroke-[3]" />}
                        </div>
                      </button>
                    </div>

                    {/* VoWiFi Switch Row */}
                    <div className="flex items-center justify-between py-1.5 pt-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">المكالمات عبر Wi-Fi (VoWiFi)</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            sim.voWiFi ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            {sim.voWiFi ? 'مفعل' : 'معطل'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">إجراء واستقبال المكالمات عند انقطاع تغطية الشبكة</p>
                      </div>

                      {/* Switch */}
                      <button
                        onClick={() => handleToggleVoWiFi(sim.id)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                          sim.voWiFi ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform flex items-center justify-center text-[10px] ${
                            sim.voWiFi ? '-translate-x-5' : 'translate-x-0'
                          }`}
                        >
                          {sim.voWiFi && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                        </div>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Terminal Log Snippet */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 text-[11px] font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-xs text-slate-300">سجل العمليات (Logcat)</span>
                  </div>
                  <button
                    onClick={handleClearLogs}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    مسح
                  </button>
                </div>

                <div className="pt-2 space-y-1.5 max-h-36 overflow-y-auto">
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="text-[10px] leading-relaxed">
                      <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                      <span className={`font-bold ${
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'error' ? 'text-rose-400' :
                        log.type === 'warning' ? 'text-amber-400' : 'text-indigo-400'
                      }`}>
                        [{log.tag}]
                      </span>{' '}
                      <span className="text-slate-200">{log.message}</span>
                      {log.command && (
                        <div className="text-[9px] text-slate-400 pl-2 opacity-80" dir="ltr">
                          &gt; {log.command}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Android Navigation Bar */}
            <div className="h-9 bg-slate-950 flex items-center justify-center gap-14 shrink-0">
              <span className="w-3.5 h-3.5 border-2 border-slate-600 rotate-45 rounded-xs"></span>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-600"></span>
              <span className="w-3.5 h-0.5 bg-slate-600 rounded-full"></span>
            </div>

          </div>
        </div>
      </div>

      {/* Simulator Control Panel & Live Inspector */}
      <div className="flex-1 w-full space-y-5">
        
        {/* Panel Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                لوحة تحكم واختبار محاكي النظام (Testing Controls)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                اختبر استجابة التطبيق لتغير الصلاحيات والشرائح وأوامر Settings.Global الحقيقية
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdbGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                دليل أوامر ADB
              </button>
            </div>
          </div>

          {/* Permission Mode Selector */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-300 block">
              محاكاة حالة الصلاحية في الهاتف:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setPermissionMode('shizuku');
                  addLog('info', 'PermissionSim', 'تم تفعيل وضع Shizuku IPC مع صلاحية Rootless ADB Shell');
                }}
                className={`p-3 rounded-xl border text-right transition-all ${
                  permissionMode === 'shizuku'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1. خدمة Shizuku نشطة</span>
                  {permissionMode === 'shizuku' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400 block">تنفيذ Shell مباشر بدون حاسوب</span>
              </button>

              <button
                onClick={() => {
                  setPermissionMode('adb');
                  addLog('info', 'PermissionSim', 'تم تفعيل وضع WRITE_SECURE_SETTINGS الممنوح عبر ADB');
                }}
                className={`p-3 rounded-xl border text-right transition-all ${
                  permissionMode === 'adb'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">2. إذن ADB مفعل</span>
                  {permissionMode === 'adb' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <span className="text-[11px] text-slate-400 block">عبر Settings.Global المباشر</span>
              </button>

              <button
                onClick={() => {
                  setPermissionMode('none');
                  addLog('warning', 'PermissionSim', 'تمت إزالة الصلاحيات لاختبار معالجة الأخطاء (SecurityException)');
                }}
                className={`p-3 rounded-xl border text-right transition-all ${
                  permissionMode === 'none'
                    ? 'bg-rose-600/20 border-rose-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">3. بدون أي صلاحية</span>
                  {permissionMode === 'none' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <span className="text-[11px] text-slate-400 block">اختبار ظهور التنبيهات والأخطاء</span>
              </button>
            </div>
          </div>

          {/* Quick Customizer for SIMs */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
            {sims.map(sim => (
              <div key={sim.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">تخصيص {sim.displayName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">slot: {sim.slotIndex}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">اسم المشغل:</label>
                    <input
                      type="text"
                      value={sim.carrierName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSims(prev => prev.map(s => s.id === sim.id ? { ...s, carrierName: val } : s));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">نوع الشبكة:</label>
                    <select
                      value={sim.networkType}
                      onChange={(e) => {
                        const val = e.target.value as SimState['networkType'];
                        setSims(prev => prev.map(s => s.id === sim.id ? { ...s, networkType: val } : s));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="5G">5G NR</option>
                      <option value="4G LTE">4G LTE</option>
                      <option value="3G">3G HSPA</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Settings Database State */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              محتوى إعدادات النظام الحقيقية (Settings.Global Key-Value Store)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">system.db / global</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto space-y-1.5 text-left" dir="ltr">
            <div className="text-slate-400"># Current System Global IMS Keys:</div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-indigo-400">volte_vt_enabled_0 (SIM 1)</span>
              <span className={`font-bold ${sims[0].voLte ? 'text-emerald-400' : 'text-slate-500'}`}>
                {sims[0].voLte ? '1 (ENABLED)' : '0 (DISABLED)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-indigo-400">wfc_ims_enabled_0 (SIM 1 VoWiFi)</span>
              <span className={`font-bold ${sims[0].voWiFi ? 'text-emerald-400' : 'text-slate-500'}`}>
                {sims[0].voWiFi ? '1 (ENABLED)' : '0 (DISABLED)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-indigo-400">volte_vt_enabled_1 (SIM 2)</span>
              <span className={`font-bold ${sims[1].voLte ? 'text-emerald-400' : 'text-slate-500'}`}>
                {sims[1].voLte ? '1 (ENABLED)' : '0 (DISABLED)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-indigo-400">wfc_ims_enabled_1 (SIM 2 VoWiFi)</span>
              <span className={`font-bold ${sims[1].voWiFi ? 'text-emerald-400' : 'text-slate-500'}`}>
                {sims[1].voWiFi ? '1 (ENABLED)' : '0 (DISABLED)'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
