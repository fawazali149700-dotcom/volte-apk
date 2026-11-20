import React from 'react';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Radio, 
  AlertTriangle, 
  GitBranch, 
  Terminal, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="rtl">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-indigo-400" />
          البنية المعمارية ومنطق النظام (Android IMS & Dual SIM Architecture)
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          تفصيل شامل لكيفية تعديل إعدادات VoLTE و VoWiFi في نظام أندرويد 11+، والتعامل مع قيود المشغلين، وصلاحيات النظام بدون روت.
        </p>
      </div>

      {/* Grid of 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pillar 1: Multi-SIM Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
            <Radio className="w-5 h-5" />
            <span>1. إدارة الشرائح المزدوجة (SubscriptionManager)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            لكل شريحة هاتف في أندرويد معرفان رئيسيان:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-slate-200">slotIndex (0 أو 1):</strong> المنفذ الفيزيائي في الهاتف (SIM 1 / SIM 2).</li>
            <li><strong className="text-slate-200">subscriptionId (مثل 1, 2, ...):</strong> المعرف الرقمي الفريد للاشتراك والمشغل، ويتغير إذا تم استبدال الشريحة.</li>
          </ul>
          <p className="text-xs text-slate-400 leading-relaxed">
            يقوم كود <code className="text-indigo-300 font-mono text-[11px]">ImsController.kt</code> بربط كل مفتاح تحكم بالـ <code className="text-indigo-300 font-mono text-[11px]">subscriptionId</code> الصحيح لضمان عدم حدوث تضارب بين الشريحتين.
          </p>
        </div>

        {/* Pillar 2: System Settings Injection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <span>2. التعديل الفعلي (Settings.Global & ImsMmTelManager)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            يستخدم التطبيق استراتيجية ثلاثية الطبقات (Triple-Fallback Strategy):
          </p>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
            <li><strong className="text-slate-200">Shizuku Privileged Shell:</strong> تنفيذ أمر النظام بصلاحيات Rootless Shell.</li>
            <li><strong className="text-slate-200">Settings.Global.putInt:</strong> الكتابة المباشرة بموجب <code className="text-indigo-300 font-mono text-[11px]">WRITE_SECURE_SETTINGS</code>.</li>
            <li><strong className="text-slate-200">ImsMmTelManager (API 30+):</strong> استدعاء الدالة الرسمية <code className="text-indigo-300 font-mono text-[11px]">setAdvancedCallingSettingEnabled()</code>.</li>
          </ol>
        </div>

        {/* Pillar 3: Special Scenarios Handling */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>3. معالجة الحالات الخاصة والقيود</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-2">
            <li>
              <strong className="text-slate-200 block">• عدم دعم المشغل للخدمة:</strong>
              يتم قراءة <code className="text-amber-300 font-mono text-[11px]">CarrierConfigManager.KEY_CARRIER_VOLTE_AVAILABLE_BOOL</code>. وإذا كان غير مدعوم، يوضح السجل ذلك دون حدوث انهيار (Crash).
            </li>
            <li>
              <strong className="text-slate-200 block">• وضع DSDS (Dual SIM Standby):</strong>
              في أجهزة DSDS، عندما تجري مكالمة على شريحة قد تتوقف البيانات على الأخرى إلا إذا تم تفعيل VoLTE وميزة Cross-SIM Calling.
            </li>
          </ul>
        </div>

        {/* Pillar 4: Safety & Play Integrity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>4. الأمان وسلامة النظام (Play Integrity & SafetyNet)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            التطبيق <strong className="text-white">لا يمس ملفات النظام أو قسم System/Vendor نهائياً</strong>، ولا يتطلب كسر حماية الجهاز (Root).
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            جميع العمليات تتم عبر قنوات Binder الرسمية والمنافذ المسموح بها لمطوري Power Users عبر ADB أو Shizuku، مما يحافظ على عمل تطبيقات البنوك والحماية بنسبة 100%.
          </p>
        </div>

      </div>

      {/* Keys Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          جدول مفاتيح إعدادات النظام الحقيقية المستخدمة بحسب الجهاز
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="p-3 text-right">المفتاح في Settings.Global</th>
                <th className="p-3 text-right">الخدمة</th>
                <th className="p-3 text-right">الشرائح المدعومة</th>
                <th className="p-3 text-right">الأجهزة المتوافقة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="p-3 text-indigo-400 font-bold">volte_vt_enabled</td>
                <td className="p-3 font-sans">تفعيل VoLTE العام</td>
                <td className="p-3">الشريحة الافتراضية</td>
                <td className="p-3 font-sans">Pixel, AOSP, Motorola</td>
              </tr>
              <tr>
                <td className="p-3 text-indigo-400 font-bold">volte_vt_enabled_0</td>
                <td className="p-3 font-sans">تفعيل VoLTE للشريحة 1</td>
                <td className="p-3">SIM Slot 0</td>
                <td className="p-3 font-sans">Samsung One UI, Xiaomi MIUI/HyperOS, OnePlus</td>
              </tr>
              <tr>
                <td className="p-3 text-indigo-400 font-bold">volte_vt_enabled_1</td>
                <td className="p-3 font-sans">تفعيل VoLTE للشريحة 2</td>
                <td className="p-3">SIM Slot 1</td>
                <td className="p-3 font-sans">Samsung, Xiaomi, Oppo, Vivo</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">wfc_ims_enabled_0</td>
                <td className="p-3 font-sans">تفعيل VoWiFi للشريحة 1</td>
                <td className="p-3">SIM Slot 0</td>
                <td className="p-3 font-sans">كافة أجهزة أندرويد 11+</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">wfc_ims_enabled_1</td>
                <td className="p-3 font-sans">تفعيل VoWiFi للشريحة 2</td>
                <td className="p-3">SIM Slot 1</td>
                <td className="p-3 font-sans">كافة أجهزة أندرويد 11+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
