import React, { useState } from 'react';
import { ANDROID_PACKAGE_NAME } from '../data/androidProjectFiles';
import { X, Copy, Check, Terminal, Wifi, Smartphone, ShieldCheck, AlertTriangle, Key } from 'lucide-react';

interface AdbGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdbGuideModal: React.FC<AdbGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shizuku' | 'adb' | 'brands' | 'secretCodes'>('shizuku');

  if (!isOpen) return null;

  const adbCommand = `adb shell pm grant ${ANDROID_PACKAGE_NAME} android.permission.WRITE_SECURE_SETTINGS`;
  const adbVerifyCmd = `adb shell dumpsys package ${ANDROID_PACKAGE_NAME} | grep WRITE_SECURE_SETTINGS`;
  const adbSimulateVoLte = `adb shell settings put global volte_vt_enabled_0 1`;
  const adbSimulateVoWiFi = `adb shell settings put global wfc_ims_enabled_0 1`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">دليل الصلاحيات والأوامر النظامية (WRITE_SECURE_SETTINGS & Shizuku)</h2>
              <p className="text-xs text-slate-400">طريقة تمكين التطبيق من تعديل إعدادات VoLTE و VoWiFi في النظام الحقيقي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('shizuku')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'shizuku'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            Shizuku (بدون كمبيوتر)
          </button>
          <button
            onClick={() => setActiveTab('adb')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'adb'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            أمر ADB (عبر الكمبيوتر)
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'brands'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            تخصيص الشركات (شاومي / سامسونج)
          </button>
          <button
            onClick={() => setActiveTab('secretCodes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'secretCodes'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            أكواد سرية للاتصال
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'shizuku' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <span className="font-bold block text-emerald-200">الطريقة الأسهل والأحدث (Android 11 حتى Android 15)</span>
                  تطبيق Shizuku يسمح للتطبيقات باستخدام صلاحيات الـ ADB Shell مباشرة من داخل الهاتف دون الحاجة لأي جهاز كمبيوتر إطلاقاً، ودون الحاجة لعمل روت.
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-base">خطوات التفعيل عبر Shizuku:</h3>
                <div className="space-y-2">
                  <div className="flex gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <div>
                      <span className="font-semibold text-slate-200">تحميل تطبيق Shizuku</span>
                      <p className="text-xs text-slate-400 mt-1">حمل تطبيق Shizuku مجاناً من متجر Google Play أو GitHub.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <div>
                      <span className="font-semibold text-slate-200">تفعيل تصحيح الأخطاء اللاسلكي (Wireless Debugging)</span>
                      <p className="text-xs text-slate-400 mt-1">
                        انتقل إلى إعدادات الهاتف ← حول الهاتف ← اضغط 7 مرات على "رقم الإصدار (Build Number)" ← ارجع إلى "خيارات المطور (Developer Options)" ← فعّل "تصحيح الأخطاء اللاسلكي".
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div>
                      <span className="font-semibold text-slate-200">الاقتران (Pairing) وتشغيل الخدمة</span>
                      <p className="text-xs text-slate-400 mt-1">
                        افتح تطبيق Shizuku، اختر "Pairing"، أدخل كود الاقتران من شاشة خيارات المطور، ثم اضغط "Start". ستظهر الخدمة كـ "Shizuku is running".
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                    <div>
                      <span className="font-semibold text-slate-200">منح الإذن لهذا التطبيق</span>
                      <p className="text-xs text-slate-400 mt-1">
                        افتح تطبيق VoLteVoWiFiSwitcher واضغط على زر "منح Shizuku" لتأكيد الصلاحية فوراً!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adb' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                إذا كنت تفضل استخدام الكمبيوتر، يمكنك منح صلاحية <code className="text-indigo-400 font-mono text-xs">WRITE_SECURE_SETTINGS</code> لمرة واحدة فقط باستخدام أمر ADB:
              </p>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-400 font-medium">أمر منح الصلاحية الأساسي:</span>
                  <button
                    onClick={() => copyToClipboard(adbCommand, 'main')}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === 'main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'main' ? 'تم النسخ!' : 'نسخ الأمر'}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto text-left" dir="ltr">
                  {adbCommand}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-400 font-medium">أمر التحقق من نجاح المنح:</span>
                  <button
                    onClick={() => copyToClipboard(adbVerifyCmd, 'verify')}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === 'verify' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'verify' ? 'تم النسخ!' : 'نسخ'}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto text-left" dir="ltr">
                  {adbVerifyCmd}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-400 font-medium">أمر تجريبي لتفعيل VoLTE يدوياً للشريحة 1:</span>
                  <button
                    onClick={() => copyToClipboard(adbSimulateVoLte, 'volte')}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === 'volte' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'volte' ? 'تم النسخ!' : 'نسخ'}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto text-left" dir="ltr">
                  {adbSimulateVoLte}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'brands' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold block text-amber-200">قيود مصنعي الأجهزة (OEM Restrictions)</span>
                  بعض الشركات مثل شاومي وسامسونج تضع فحصاً صارماً لاسم المشغل (Carrier Check)، فإذا لم يكن المشغل معتمداً رسمياً من المصنع تقوم بإخفاء المفتاح أو تعطيل VoLTE/VoWiFi.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    أجهزة Xiaomi / POCO / Redmi
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    قم بفتح تطبيق الاتصال (Dialer) واطلب الأكواد التالية لإلغاء فحص المشغل:
                  </p>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 text-orange-400 text-left" dir="ltr">
                      *#*#86583#*#*
                    </div>
                    <span className="text-[11px] text-slate-500 block">لإلغاء فحص VoLTE (تظهر رسالة VoLTE carrier check was disabled)</span>
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 text-orange-400 text-left" dir="ltr">
                      *#*#86943#*#*
                    </div>
                    <span className="text-[11px] text-slate-500 block">لإلغاء فحص VoWiFi</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    أجهزة Samsung Galaxy
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    سامسونج تخزن الإعدادات في حزمة IMS Service الخاصة بها.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    تطبيقنا يكتب مباشرة في مفتاحين: <br />
                    <code className="text-indigo-400 font-mono text-[11px]">volte_vt_enabled_0</code> للشريحة الأولى و <code className="text-indigo-400 font-mono text-[11px]">volte_vt_enabled_1</code> للثانية، بالإضافة إلى استدعاء <code className="text-indigo-400 font-mono text-[11px]">ImsMmTelManager</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'secretCodes' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                أكواد سرية تُطلب من لوحة الاتصال (Phone Dialer) للوصول إلى قائمة فحص IMS وحالة التسجيل:
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-indigo-400 text-left block" dir="ltr">*#*#4636#*#*</span>
                    <span className="text-xs text-slate-300">قائمة الاختبار العامة في أندرويد (Testing Menu &rarr; Phone info)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('*#*#4636#*#*', 'c4636')}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'c4636' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-orange-400 text-left block" dir="ltr">*#*#86583#*#*</span>
                    <span className="text-xs text-slate-300">شاومي: تعطيل فحص VoLTE للمشغل وتفعيله إجبارياً</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('*#*#86583#*#*', 'c86583')}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'c86583' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-orange-400 text-left block" dir="ltr">*#*#86943#*#*</span>
                    <span className="text-xs text-slate-300">شاومي: تعطيل فحص VoWiFi للمشغل وتفعيله إجبارياً</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('*#*#86943#*#*', 'c86943')}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'c86943' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
