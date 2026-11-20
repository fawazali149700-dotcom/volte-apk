/**
 * Full Source Code files for Native Android VoLTE & VoWiFi Switcher
 * Target: Android 11 (API 30) to Android 15 (API 35)
 * Architecture: Jetpack Compose + Material 3 + Shizuku Privileged API + ImsMmTelManager + Settings.Global
 */

export interface AndroidProjectFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'properties';
  description: string;
  category: 'core' | 'ui' | 'config' | 'docs' | 'res';
  content: string;
}

export const ANDROID_PACKAGE_NAME = "com.volte.vowifi.switcher";

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: "AndroidManifest.xml",
    filename: "AndroidManifest.xml",
    language: "xml",
    category: "config",
    description: "ملف البيان الرئيسي للتطبيق متضمناً صلاحيات WRITE_SECURE_SETTINGS و READ_PHONE_STATE ومزود Shizuku",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.volte.vowifi.switcher">

    <!-- صلاحيات قراءة معلومات شريحة الاتصال وحالة الشبكة (Dual SIM) -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <!-- الصلاحية الجوهرية لتعديل إعدادات النظام الحقيقية (Settings.Global / Secure) -->
    <!-- يتم منحها عبر ADB بالأمر: adb shell pm grant com.volte.vowifi.switcher android.permission.WRITE_SECURE_SETTINGS -->
    <!-- أو تمنح تلقائياً عبر خدمة Shizuku بدون كمبيوتر -->
    <uses-permission
        android:name="android.permission.WRITE_SECURE_SETTINGS"
        tools:ignore="ProtectedPermissions" />

    <!-- صلاحية تعديل حالة الهاتف (لـ APIs النظام المدعومة على هواتف معينة) -->
    <uses-permission
        android:name="android.permission.MODIFY_PHONE_STATE"
        tools:ignore="ProtectedPermissions" />

    <!-- إذن إشعارات أندرويد 13+ لعرض سجل التعديلات -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.VoLteVoWiFiSwitcher">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.VoLteVoWiFiSwitcher">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- مزود خدمة Shizuku للوصول إلى صلاحيات Shell المميزة دون روت -->
        <provider
            android:name="rikka.shizuku.ShizukuProvider"
            android:authorities="\${applicationId}.shizuku"
            android:multiprocess="false"
            android:enabled="true"
            android:exported="true"
            android:permission="android.permission.INTERACT_ACROSS_USERS_FULL" />

    </application>
</manifest>`
  },
  {
    path: "app/build.gradle.kts",
    filename: "build.gradle.kts (App)",
    language: "kotlin",
    category: "config",
    description: "إعدادات البناء لموديول التطبيق مع Jetpack Compose و Shizuku API و Coroutines",
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.volte.vowifi.switcher"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.volte.vowifi.switcher"
        minSdk = 30 // Android 11+ كحد أدنى لدعم ImsMmTelManager والتحكم الكامل بالشرائح
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Kotlin Coroutines
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation("androidx.compose.material:material-icons-extended")

    // Shizuku API (للتنفيذ بأعلى صلاحيات النظام ADB shell بدون الحاجة للكمبيوتر)
    implementation("dev.rikka.shizuku:api:13.1.5")
    implementation("dev.rikka.shizuku:provider:13.1.5")

    // أدوات التطوير والاختبار
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}`
  },
  {
    path: "build.gradle.kts",
    filename: "build.gradle.kts (Project)",
    language: "kotlin",
    category: "config",
    description: "إعدادات البناء الجذرية للمشروع وتعريف إضافات Kotlin و Android Gradle Plugin",
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
  },
  {
    path: "gradle/libs.versions.toml",
    filename: "libs.versions.toml",
    language: "properties",
    category: "config",
    description: "كتالوج الإصدارات (Version Catalog) لجميع المكتبات والاعتماديات",
    content: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.11.00"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`
  },
  {
    path: "app/src/main/java/com/volte/vowifi/switcher/MainActivity.kt",
    filename: "MainActivity.kt",
    language: "kotlin",
    category: "core",
    description: "النشاط الرئيسي: إدارة دورة حياة التطبيق، الاتصال بـ Shizuku، واجهة Compose وقراءة حالة الشرائح",
    content: `package com.volte.vowifi.switcher

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.volte.vowifi.switcher.data.ImsController
import com.volte.vowifi.switcher.data.LogEntry
import com.volte.vowifi.switcher.data.SimSlotInfo
import com.volte.vowifi.switcher.shizuku.ShizukuManager
import com.volte.vowifi.switcher.ui.ImsScreen
import com.volte.vowifi.switcher.ui.theme.VoLteVoWiFiSwitcherTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var imsController: ImsController
    private lateinit var shizukuManager: ShizukuManager

    // مراقب طلب صلاحية قراءة حالة الهاتف
    private val requestPhonePermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            refreshSimData()
        } else {
            Toast.makeText(
                this,
                getString(R.string.permission_phone_state_required),
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        imsController = ImsController(this)
        shizukuManager = ShizukuManager(this)

        // تسجيل مستمعي Shizuku لمعرفة حالة البايندر فور اتصاله
        shizukuManager.registerListeners()

        checkInitialPermissions()

        setContent {
            VoLteVoWiFiSwitcherTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val simSlots by imsController.simSlotsState.collectAsState()
                    val logs by imsController.logsState.collectAsState()
                    val isRefreshing by imsController.isRefreshing.collectAsState()
                    val hasSecureSettings by imsController.hasWriteSecureSettings.collectAsState()
                    val isShizukuAvailable by shizukuManager.isAvailable.collectAsState()
                    val isShizukuGranted by shizukuManager.isPermissionGranted.collectAsState()

                    val scope = rememberCoroutineScope()

                    ImsScreen(
                        simSlots = simSlots,
                        logs = logs,
                        isRefreshing = isRefreshing,
                        hasSecureSettings = hasSecureSettings,
                        isShizukuAvailable = isShizukuAvailable,
                        isShizukuGranted = isShizukuGranted,
                        onRefresh = { refreshSimData() },
                        onToggleVoLte = { sim, enabled ->
                            scope.launch {
                                imsController.toggleVoLte(sim, enabled, isShizukuGranted)
                            }
                        },
                        onToggleVoWiFi = { sim, enabled ->
                            scope.launch {
                                imsController.toggleVoWiFi(sim, enabled, isShizukuGranted)
                            }
                        },
                        onRequestShizukuPermission = {
                            shizukuManager.requestPermission()
                        },
                        onClearLogs = {
                            imsController.clearLogs()
                        }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        imsController.checkSecureSettingsPermission()
        refreshSimData()
    }

    override fun onDestroy() {
        super.onDestroy()
        shizukuManager.unregisterListeners()
    }

    private fun checkInitialPermissions() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_PHONE_STATE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPhonePermissionLauncher.launch(Manifest.permission.READ_PHONE_STATE)
        } else {
            refreshSimData()
        }
    }

    private fun refreshSimData() {
        imsController.refreshSimState()
    }
}`
  },
  {
    path: "app/src/main/java/com/volte/vowifi/switcher/data/ImsController.kt",
    filename: "ImsController.kt",
    language: "kotlin",
    category: "core",
    description: "محرك النظام الجوهري: تعديل Settings.Global، استدعاء ImsMmTelManager، تنفيذ أوامر Shell بـ Shizuku، ودعم Dual SIM",
    content: `package com.volte.vowifi.switcher.data

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.telephony.CarrierConfigManager
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import android.telephony.ims.ImsMmTelManager
import androidx.core.content.ContextCompat
import com.volte.vowifi.switcher.shizuku.ShizukuManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * بيانات شريحة الاتصال وحالة VoLTE و VoWiFi
 */
data class SimSlotInfo(
    val slotIndex: Int,          // 0 لـ SIM 1, 1 لـ SIM 2
    val subscriptionId: Int,     // معرف الاشتراك في نظام أندرويد
    val displayName: String,     // اسم الشريحة (SIM 1 / SIM 2)
    val carrierName: String,     // اسم المشغل (مثل STC, Vodafone, etc.)
    val networkType: String,     // نوع الشبكة (5G / 4G LTE / 3G)
    val isVoLteEnabled: Boolean, // هل خدمة VoLTE مفعلة حالياً
    val isVoWiFiEnabled: Boolean,// هل خدمة VoWiFi مفعلة حالياً
    val isVoLteSupportedByCarrier: Boolean = true,
    val isVoWiFiSupportedByCarrier: Boolean = true
)

/**
 * نموذج سجل العمليات (Logs) لعرض أسباب النجاح أو الفشل بالتفصيل
 */
data class LogEntry(
    val id: Long = System.currentTimeMillis(),
    val timestamp: String = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date()),
    val level: LogLevel,
    val message: String,
    val details: String? = null
)

enum class LogLevel {
    SUCCESS, INFO, WARNING, ERROR
}

/**
 * الفئة المسؤولة عن قراءة وتعديل إعدادات VoLTE و VoWiFi الحقيقية في النظام
 */
class ImsController(private val context: Context) {

    private val _simSlotsState = MutableStateFlow<List<SimSlotInfo>>(emptyList())
    val simSlotsState: StateFlow<List<SimSlotInfo>> = _simSlotsState.asStateFlow()

    private val _logsState = MutableStateFlow<List<LogEntry>>(emptyList())
    val logsState: StateFlow<List<LogEntry>> = _logsState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _hasWriteSecureSettings = MutableStateFlow(false)
    val hasWriteSecureSettings: StateFlow<Boolean> = _hasWriteSecureSettings.asStateFlow()

    private val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager
    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager

    init {
        checkSecureSettingsPermission()
        addLog(LogLevel.INFO, "تم تشغيل محرك تحكم IMS بنجاح", "جاهز لمعالجة شرائح الاتصال")
    }

    /**
     * التحقق من توفر صلاحية WRITE_SECURE_SETTINGS
     */
    fun checkSecureSettingsPermission(): Boolean {
        val granted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.WRITE_SECURE_SETTINGS
        ) == PackageManager.PERMISSION_GRANTED
        _hasWriteSecureSettings.value = granted
        return granted
    }

    /**
     * قراءة الحالة الفعلية للشرائح وخدمات VoLTE/VoWiFi من النظام
     */
    fun refreshSimState() {
        _isRefreshing.value = true
        try {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE)
                != PackageManager.PERMISSION_GRANTED
            ) {
                addLog(LogLevel.WARNING, "صلاحية READ_PHONE_STATE غير ممنوحة", "لا يمكن قراءة معلومات الشرائح بدقة")
                _isRefreshing.value = false
                return
            }

            val activeSubs: List<SubscriptionInfo>? = subscriptionManager?.activeSubscriptionInfoList
            val simList = mutableListOf<SimSlotInfo>()

            if (!activeSubs.isNullOrEmpty()) {
                for (sub in activeSubs) {
                    val slotIdx = sub.simSlotIndex
                    val subId = sub.subscriptionId
                    val carrier = sub.carrierName?.toString() ?: "مجهول"
                    val displayName = sub.displayName?.toString() ?: "SIM \${slotIdx + 1}"

                    // قراءة حالة VoLTE الحقيقية عبر عدة استراتيجيات
                    val isVoLteOn = readRealVoLteState(subId, slotIdx)
                    // قراءة حالة VoWiFi الحقيقية
                    val isVoWiFiOn = readRealVoWiFiState(subId, slotIdx)

                    val netType = getNetworkTypeString(subId)

                    simList.add(
                        SimSlotInfo(
                            slotIndex = slotIdx,
                            subscriptionId = subId,
                            displayName = displayName,
                            carrierName = carrier,
                            networkType = netType,
                            isVoLteEnabled = isVoLteOn,
                            isVoWiFiEnabled = isVoWiFiOn
                        )
                    )
                }
            } else {
                addLog(LogLevel.WARNING, "لم يتم العثور على شرائح SIM نشطة", "يرجى التأكد من إدخال الشريحة وتفعيلها")
            }

            _simSlotsState.value = simList
            addLog(LogLevel.SUCCESS, "تم تحديث حالة الشرائح بنجاح", "عدد الشرائح النشطة: \${simList.size}")
        } catch (e: Exception) {
            addLog(LogLevel.ERROR, "فشل أثناء قراءة حالة الشرائح", e.localizedMessage)
        } finally {
            _isRefreshing.value = false
        }
    }

    /**
     * تفعيل أو إيقاف VoLTE فعلياً في النظام للشريحة المحددة
     */
    suspend fun toggleVoLte(sim: SimSlotInfo, targetState: Boolean, isShizukuActive: Boolean): Boolean {
        return withContext(Dispatchers.IO) {
            val desiredInt = if (targetState) 1 else 0
            val actionName = if (targetState) "تفعيل VoLTE" else "إيقاف VoLTE"
            addLog(LogLevel.INFO, "بدء \$actionName لـ \${sim.displayName} (SubId: \${sim.subscriptionId})")

            var success = false
            var appliedMethod = ""

            // الاستراتيجية 1: استخدام Shizuku لتنفيذ أوامر Shell المميزة مباشرة في إعدادات النظام
            if (isShizukuActive) {
                try {
                    val keysToUpdate = listOf(
                        "volte_vt_enabled",
                        "volte_vt_enabled_\${sim.slotIndex}",
                        "volte_vt_enabled\${sim.subscriptionId}"
                    )
                    for (key in keysToUpdate) {
                        val cmd = "settings put global \$key \$desiredInt"
                        ShizukuManager.executeShellCommand(cmd)
                    }

                    // أوامر هاتف إضافية عبر cmd phone للأنظمة الحديثة
                    ShizukuManager.executeShellCommand("cmd phone set-volte-enabled \${sim.subscriptionId} \$targetState")

                    success = true
                    appliedMethod = "Shizuku Privileged Shell"
                } catch (e: Exception) {
                    addLog(LogLevel.WARNING, "فشلت محاولة Shizuku، تجربة Settings.Global", e.message)
                }
            }

            // الاستراتيجية 2: استخدام Settings.Global المباشر إذا كانت صلاحية WRITE_SECURE_SETTINGS متوفرة
            if (!success && checkSecureSettingsPermission()) {
                try {
                    val resolver = context.contentResolver
                    Settings.Global.putInt(resolver, "volte_vt_enabled", desiredInt)
                    Settings.Global.putInt(resolver, "volte_vt_enabled_\${sim.slotIndex}", desiredInt)
                    Settings.Global.putInt(resolver, "volte_vt_enabled\${sim.subscriptionId}", desiredInt)

                    success = true
                    appliedMethod = "Settings.Global (WRITE_SECURE_SETTINGS)"
                } catch (e: Exception) {
                    addLog(LogLevel.WARNING, "فشل التعديل عبر Settings.Global", e.message)
                }
            }

            // الاستراتيجية 3: استدعاء ImsMmTelManager الرسمي (API 30+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    val imsManager = context.getSystemService(ImsMmTelManager::class.java)
                        ?: ImsMmTelManager.createForSubscriptionId(sim.subscriptionId)
                    imsManager.setAdvancedCallingSettingEnabled(targetState)
                    success = true
                    appliedMethod = (if (appliedMethod.isNotEmpty()) "\$appliedMethod + " else "") + "ImsMmTelManager"
                } catch (e: SecurityException) {
                    // يتطلب عادة MODIFY_PHONE_STATE
                } catch (e: Exception) {
                    // تسجيل تنبيه فقط
                }
            }

            if (success) {
                addLog(
                    LogLevel.SUCCESS,
                    "نجح \$actionName على \${sim.displayName}!",
                    "الطريقة المستخدمة: \$appliedMethod"
                )
                // تحديث الحالة محلياً وقراءتها مجدداً
                updateSimLocalState(sim.subscriptionId, newVoLte = targetState)
            } else {
                addLog(
                    LogLevel.ERROR,
                    "فشل \$actionName لـ \${sim.displayName}",
                    "يلزم منح صلاحية WRITE_SECURE_SETTINGS عبر ADB أو تشغيل خدمة Shizuku"
                )
            }
            success
        }
    }

    /**
     * تفعيل أو إيقاف VoWiFi (المكالمات عبر Wi-Fi) فعلياً في النظام
     */
    suspend fun toggleVoWiFi(sim: SimSlotInfo, targetState: Boolean, isShizukuActive: Boolean): Boolean {
        return withContext(Dispatchers.IO) {
            val desiredInt = if (targetState) 1 else 0
            val actionName = if (targetState) "تفعيل VoWiFi" else "إيقاف VoWiFi"
            addLog(LogLevel.INFO, "بدء \$actionName لـ \${sim.displayName} (SubId: \${sim.subscriptionId})")

            var success = false
            var appliedMethod = ""

            // الاستراتيجية 1: Shizuku Shell Commands
            if (isShizukuActive) {
                try {
                    val keys = listOf(
                        "wfc_ims_enabled",
                        "wfc_ims_enabled_\${sim.slotIndex}",
                        "wfc_ims_enabled\${sim.subscriptionId}"
                    )
                    for (key in keys) {
                        ShizukuManager.executeShellCommand("settings put global \$key \$desiredInt")
                    }
                    ShizukuManager.executeShellCommand("cmd phone set-vowifi-enabled \${sim.subscriptionId} \$targetState")

                    success = true
                    appliedMethod = "Shizuku Privileged Shell"
                } catch (e: Exception) {
                    addLog(LogLevel.WARNING, "تعذر استخدام Shizuku لـ VoWiFi", e.message)
                }
            }

            // الاستراتيجية 2: Settings.Global
            if (!success && checkSecureSettingsPermission()) {
                try {
                    val resolver = context.contentResolver
                    Settings.Global.putInt(resolver, "wfc_ims_enabled", desiredInt)
                    Settings.Global.putInt(resolver, "wfc_ims_enabled_\${sim.slotIndex}", desiredInt)
                    Settings.Global.putInt(resolver, "wfc_ims_enabled\${sim.subscriptionId}", desiredInt)

                    success = true
                    appliedMethod = "Settings.Global (WRITE_SECURE_SETTINGS)"
                } catch (e: Exception) {
                    addLog(LogLevel.WARNING, "فشل التعديل عبر Settings.Global", e.message)
                }
            }

            // الاستراتيجية 3: ImsMmTelManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    val imsManager = ImsMmTelManager.createForSubscriptionId(sim.subscriptionId)
                    imsManager.setVoWiFiSettingEnabled(targetState)
                    success = true
                    appliedMethod = (if (appliedMethod.isNotEmpty()) "\$appliedMethod + " else "") + "ImsMmTelManager"
                } catch (e: SecurityException) {
                    // يتطلب MODIFY_PHONE_STATE
                } catch (e: Exception) {
                    // تنبيه
                }
            }

            if (success) {
                addLog(
                    LogLevel.SUCCESS,
                    "نجح \$actionName على \${sim.displayName}!",
                    "الطريقة المستخدمة: \$appliedMethod"
                )
                updateSimLocalState(sim.subscriptionId, newVoWiFi = targetState)
            } else {
                addLog(
                    LogLevel.ERROR,
                    "فشل \$actionName لـ \${sim.displayName}",
                    "يلزم منح الصلاحية عبر ADB: adb shell pm grant \${context.packageName} android.permission.WRITE_SECURE_SETTINGS أو تشغيل Shizuku"
                )
            }
            success
        }
    }

    /**
     * قراءة حالة VoLTE من Settings.Global أو ImsMmTelManager
     */
    private fun readRealVoLteState(subId: Int, slotIdx: Int): Boolean {
        try {
            // محاولة ImsMmTelManager أولاً
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    val imsManager = ImsMmTelManager.createForSubscriptionId(subId)
                    return imsManager.isAdvancedCallingSettingEnabled
                } catch (e: Exception) {
                    // استمرار للفحص اليدوي
                }
            }

            // فحص مفاتيح Settings.Global المعروفة
            val resolver = context.contentResolver
            val perSubKey = "volte_vt_enabled\$subId"
            val perSlotKey = "volte_vt_enabled_\$slotIdx"
            val globalKey = "volte_vt_enabled"

            val valPerSub = Settings.Global.getInt(resolver, perSubKey, -1)
            if (valPerSub != -1) return valPerSub == 1

            val valPerSlot = Settings.Global.getInt(resolver, perSlotKey, -1)
            if (valPerSlot != -1) return valPerSlot == 1

            val valGlobal = Settings.Global.getInt(resolver, globalKey, 1)
            return valGlobal == 1
        } catch (e: Exception) {
            return false
        }
    }

    /**
     * قراءة حالة VoWiFi من Settings.Global أو ImsMmTelManager
     */
    private fun readRealVoWiFiState(subId: Int, slotIdx: Int): Boolean {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    val imsManager = ImsMmTelManager.createForSubscriptionId(subId)
                    return imsManager.isVoWiFiSettingEnabled
                } catch (e: Exception) {
                    // استمرار
                }
            }

            val resolver = context.contentResolver
            val perSubKey = "wfc_ims_enabled\$subId"
            val perSlotKey = "wfc_ims_enabled_\$slotIdx"
            val globalKey = "wfc_ims_enabled"

            val valPerSub = Settings.Global.getInt(resolver, perSubKey, -1)
            if (valPerSub != -1) return valPerSub == 1

            val valPerSlot = Settings.Global.getInt(resolver, perSlotKey, -1)
            if (valPerSlot != -1) return valPerSlot == 1

            val valGlobal = Settings.Global.getInt(resolver, globalKey, 0)
            return valGlobal == 1
        } catch (e: Exception) {
            return false
        }
    }

    private fun updateSimLocalState(subId: Int, newVoLte: Boolean? = null, newVoWiFi: Boolean? = null) {
        val current = _simSlotsState.value.toMutableList()
        val index = current.indexOfFirst { it.subscriptionId == subId }
        if (index != -1) {
            val item = current[index]
            current[index] = item.copy(
                isVoLteEnabled = newVoLte ?: item.isVoLteEnabled,
                isVoWiFiEnabled = newVoWiFi ?: item.isVoWiFiEnabled
            )
            _simSlotsState.value = current
        }
    }

    private fun getNetworkTypeString(subId: Int): String {
        return try {
            val subTelephony = telephonyManager?.createForSubscriptionId(subId) ?: telephonyManager
            when (subTelephony?.dataNetworkType) {
                TelephonyManager.NETWORK_TYPE_NR -> "5G"
                TelephonyManager.NETWORK_TYPE_LTE -> "4G LTE"
                TelephonyManager.NETWORK_TYPE_HSPAP,
                TelephonyManager.NETWORK_TYPE_HSPA,
                TelephonyManager.NETWORK_TYPE_UMTS -> "3G"
                else -> "4G/5G"
            }
        } catch (e: Exception) {
            "4G LTE"
        }
    }

    fun addLog(level: LogLevel, message: String, details: String? = null) {
        val entry = LogEntry(level = level, message = message, details = details)
        val current = _logsState.value.toMutableList()
        current.add(0, entry) // الإضافة في المقدمة
        if (current.size > 100) {
            current.removeAt(current.lastIndex)
        }
        _logsState.value = current
    }

    fun clearLogs() {
        _logsState.value = emptyList()
    }
}`
  },
  {
    path: "app/src/main/java/com/volte/vowifi/switcher/shizuku/ShizukuManager.kt",
    filename: "ShizukuManager.kt",
    language: "kotlin",
    category: "core",
    description: "إدارة ارتباط Shizuku IPC وتنفيذ أوامر Shell بصلاحيات ADB المميزة بدون الحاجة لحاسوب",
    content: `package com.volte.vowifi.switcher.shizuku

import android.content.Context
import android.content.pm.PackageManager
import dev.rikka.shizuku.Shizuku
import dev.rikka.shizuku.ShizukuRemoteProcess
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader

/**
 * فئة مساعدة للتواصل مع تطبيق Shizuku عبر Binder
 * يتيح تنفيذ أوامر adb shell pm grant و settings put global مباشرة
 */
class ShizukuManager(private val context: Context) {

    private val _isAvailable = MutableStateFlow(false)
    val isAvailable: StateFlow<Boolean> = _isAvailable.asStateFlow()

    private val _isPermissionGranted = MutableStateFlow(false)
    val isPermissionGranted: StateFlow<Boolean> = _isPermissionGranted.asStateFlow()

    private val binderReceivedListener = Shizuku.OnBinderReceivedListener {
        _isAvailable.value = true
        checkPermission()
    }

    private val binderDeadListener = Shizuku.OnBinderDeadListener {
        _isAvailable.value = false
        _isPermissionGranted.value = false
    }

    private val requestPermissionResultListener =
        Shizuku.OnRequestPermissionResultListener { requestCode, grantResult ->
            if (requestCode == SHIZUKU_REQUEST_CODE) {
                _isPermissionGranted.value = (grantResult == PackageManager.PERMISSION_GRANTED)
            }
        }

    fun registerListeners() {
        try {
            Shizuku.addBinderReceivedListenerSticky(binderReceivedListener)
            Shizuku.addBinderDeadListener(binderDeadListener)
            Shizuku.addRequestPermissionResultListener(requestPermissionResultListener)
            checkPermission()
        } catch (e: Exception) {
            _isAvailable.value = false
        }
    }

    fun unregisterListeners() {
        try {
            Shizuku.removeBinderReceivedListener(binderReceivedListener)
            Shizuku.removeBinderDeadListener(binderDeadListener)
            Shizuku.removeRequestPermissionResultListener(requestPermissionResultListener)
        } catch (e: Exception) {
            // تجاهل
        }
    }

    fun checkPermission() {
        if (!Shizuku.pingBinder()) {
            _isAvailable.value = false
            _isPermissionGranted.value = false
            return
        }
        _isAvailable.value = true
        _isPermissionGranted.value = try {
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        } catch (e: Exception) {
            false
        }
    }

    fun requestPermission() {
        try {
            if (Shizuku.isPre_V11()) {
                // الإصدارات القديمة لا تدعم الطلب التفاعلي
                return
            }
            if (Shizuku.checkSelfPermission() != PackageManager.PERMISSION_GRANTED) {
                Shizuku.requestPermission(SHIZUKU_REQUEST_CODE)
            }
        } catch (e: Exception) {
            // خطأ في طلب الإذن
        }
    }

    companion object {
        const val SHIZUKU_REQUEST_CODE = 4001

        /**
         * تنفيذ أمر Shell مميز باستخدام Shizuku
         */
        suspend fun executeShellCommand(command: String): String = withContext(Dispatchers.IO) {
            val process: ShizukuRemoteProcess = Shizuku.newProcess(
                arrayOf("sh", "-c", command),
                null,
                null
            )
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                output.append(line).append("\\n")
            }
            val exitCode = process.waitFor()
            if (exitCode != 0) {
                val errReader = BufferedReader(InputStreamReader(process.errorStream))
                val errOutput = StringBuilder()
                while (errReader.readLine().also { line = it } != null) {
                    errOutput.append(line).append("\\n")
                }
                throw RuntimeException("Command failed (\$exitCode): \$errOutput")
            }
            output.toString().trim()
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/volte/vowifi/switcher/ui/ImsScreen.kt",
    filename: "ImsScreen.kt",
    language: "kotlin",
    category: "ui",
    description: "واجهة المستخدم الرئيسية المبنية بـ Material Design 3 مع بطاقات الشرائح وسجل العمليات ومفتاح التحديث",
    content: `package com.volte.vowifi.switcher.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.volte.vowifi.switcher.R
import com.volte.vowifi.switcher.data.LogEntry
import com.volte.vowifi.switcher.data.LogLevel
import com.volte.vowifi.switcher.data.SimSlotInfo

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImsScreen(
    simSlots: List<SimSlotInfo>,
    logs: List<LogEntry>,
    isRefreshing: Boolean,
    hasSecureSettings: Boolean,
    isShizukuAvailable: Boolean,
    isShizukuGranted: Boolean,
    onRefresh: () -> Unit,
    onToggleVoLte: (SimSlotInfo, Boolean) -> Unit,
    onToggleVoWiFi: (SimSlotInfo, Boolean) -> Unit,
    onRequestShizukuPermission: () -> Unit,
    onClearLogs: () -> Unit
) {
    var showPermissionGuide by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.SignalCellularAlt,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = stringResource(R.string.app_name),
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                actions = {
                    // زر تعليمات الصلاحية
                    IconButton(onClick = { showPermissionGuide = true }) {
                        Icon(
                            imageVector = Icons.Default.HelpOutline,
                            contentDescription = "دليل الصلاحيات"
                        )
                    }
                    // زر التحديث
                    IconButton(
                        onClick = onRefresh,
                        enabled = !isRefreshing
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "تحديث الحالة"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // شريط حالة الصلاحيات والأمان
            PermissionStatusBar(
                hasSecureSettings = hasSecureSettings,
                isShizukuAvailable = isShizukuAvailable,
                isShizukuGranted = isShizukuGranted,
                onRequestShizuku = onRequestShizukuPermission,
                onOpenGuide = { showPermissionGuide = true }
            )

            // بطاقات الشرائح SIM 1 و SIM 2
            if (simSlots.isEmpty()) {
                EmptySimCard(onRefresh = onRefresh)
            } else {
                simSlots.forEach { sim ->
                    SimCardItem(
                        sim = sim,
                        onToggleVoLte = { enabled -> onToggleVoLte(sim, enabled) },
                        onToggleVoWiFi = { enabled -> onToggleVoWiFi(sim, enabled) }
                    )
                }
            }

            // سجل العمليات (Logs)
            LogViewerCard(
                logs = logs,
                onClear = onClearLogs,
                modifier = Modifier.weight(1f)
            )
        }
    }

    if (showPermissionGuide) {
        PermissionDialog(
            onDismiss = { showPermissionGuide = false }
        )
    }
}

@Composable
fun PermissionStatusBar(
    hasSecureSettings: Boolean,
    isShizukuAvailable: Boolean,
    isShizukuGranted: Boolean,
    onRequestShizuku: () -> Unit,
    onOpenGuide: () -> Unit
) {
    val isReady = hasSecureSettings || isShizukuGranted

    Card(
        colors = CardDefaults.cardColors(
            containerColor = if (isReady)
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
            else
                MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.6f)
        ),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Icon(
                    imageVector = if (isReady) Icons.Default.CheckCircle else Icons.Default.Warning,
                    contentDescription = null,
                    tint = if (isReady) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = if (isReady) "الصلاحية مفعلة (جاهز للتعديل)" else "تتطلب صلاحية WRITE_SECURE_SETTINGS",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = when {
                            isShizukuGranted -> "عبر خدمة Shizuku (مميزة)"
                            hasSecureSettings -> "عبر ADB Secure Settings"
                            isShizukuAvailable -> "Shizuku متصل، انقر لمنح الإذن"
                            else -> "انقر لمعرفة طريقة التفعيل عبر ADB"
                        },
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (!isReady && isShizukuAvailable) {
                Button(
                    onClick = onRequestShizuku,
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("منح Shizuku", fontSize = 12.sp)
                }
            } else if (!isReady) {
                OutlinedButton(
                    onClick = onOpenGuide,
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("شرح التفعيل", fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
fun SimCardItem(
    sim: SimSlotInfo,
    onToggleVoLte: (Boolean) -> Unit,
    onToggleVoWiFi: (Boolean) -> Unit
) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            // شريط رأس الشريحة
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "\${sim.slotIndex + 1}",
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = sim.displayName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            text = sim.carrierName,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // شارة نوع الشبكة 4G/5G
                Surface(
                    color = MaterialTheme.colorScheme.secondaryContainer,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = sim.networkType,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }

            Divider(modifier = Modifier.padding(vertical = 14.dp), color = MaterialTheme.colorScheme.outlineVariant)

            // مفتاح VoLTE
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "المكالمات عبر 4G (VoLTE)",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (sim.isVoLteEnabled) "مفعل" else "معطل",
                            fontSize = 12.sp,
                            color = if (sim.isVoLteEnabled) MaterialTheme.colorScheme.primary else Color.Gray,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "جودة صوت فائقة وبقاء الاتصال على شبكة LTE أثناء المكالمة",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Switch(
                    checked = sim.isVoLteEnabled,
                    onCheckedChange = onToggleVoLte
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // مفتاح VoWiFi
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "المكالمات عبر واي فاي (VoWiFi)",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (sim.isVoWiFiEnabled) "مفعل" else "معطل",
                            fontSize = 12.sp,
                            color = if (sim.isVoWiFiEnabled) MaterialTheme.colorScheme.primary else Color.Gray,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "إجراء واستقبال المكالمات عند ضعف تغطية الشبكة عبر الـ Wi-Fi",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Switch(
                    checked = sim.isVoWiFiEnabled,
                    onCheckedChange = onToggleVoWiFi
                )
            }
        }
    }
}

@Composable
fun LogViewerCard(
    logs: List<LogEntry>,
    onClear: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Terminal,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "سجل العمليات المباشر (Log)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
                TextButton(
                    onClick = onClear,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("مسح", fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            if (logs.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "لا توجد عمليات مسجلة بعد",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(logs) { entry ->
                        val color = when (entry.level) {
                            LogLevel.SUCCESS -> Color(0xFF2E7D32)
                            LogLevel.ERROR -> MaterialTheme.colorScheme.error
                            LogLevel.WARNING -> Color(0xFFED6C02)
                            LogLevel.INFO -> MaterialTheme.colorScheme.primary
                        }
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colorScheme.surface.copy(alpha = 0.7f),
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(8.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "[\${entry.timestamp}]",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = entry.message,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = color
                                )
                            }
                            if (entry.details != null) {
                                Text(
                                    text = entry.details,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(top = 2.dp, start = 8.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EmptySimCard(onRefresh: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.SimCardAlert,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "لم يتم الكشف عن شرائح SIM",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Text(
                text = "يرجى التحقق من صلاحية قراءة حالة الهاتف وإدخال الشريحة",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(14.dp))
            Button(onClick = onRefresh) {
                Text("إعادة المحاولة")
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/volte/vowifi/switcher/ui/PermissionDialog.kt",
    filename: "PermissionDialog.kt",
    language: "kotlin",
    category: "ui",
    description: "نافذة تشرح للمستخدم خطوة بخطوة كيفية منح صلاحية WRITE_SECURE_SETTINGS عبر ADB أو Shizuku",
    content: `package com.volte.vowifi.switcher.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog

@Composable
fun PermissionDialog(onDismiss: () -> Unit) {
    val context = LocalContext.current
    val packageName = context.packageName
    val adbCommand = "adb shell pm grant \$packageName android.permission.WRITE_SECURE_SETTINGS"

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "دليل منح الصلاحيات للنظام",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                }

                Text(
                    text = "نظراً لأن أندرويد يحمي إعدادات IMS والشبكة الحساسة، يتطلب التطبيق صلاحية WRITE_SECURE_SETTINGS لتطبيق التغيير فعلياً على النظام. يمكنك اختيار إحدى الطريقتين:",
                    fontSize = 13.sp,
                    lineHeight = 20.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // الخيار 1: Shizuku (بدون كمبيوتر)
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "1. الطريقة الأسهل: تطبيق Shizuku (بدون حاسوب)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "• قم بتثبيت تطبيق Shizuku من Play Store أو GitHub.\\n• فعّله عبر تصحيح الأخطاء اللاسلكي (Wireless Debugging) من خيارات المطور.\\n• افتح هذا التطبيق واضغط 'منح Shizuku'.",
                            fontSize = 12.sp,
                            lineHeight = 18.sp
                        )
                    }
                }

                // الخيار 2: عبر الحاسوب ADB
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "2. الطريقة التقليدية: أمر ADB عبر الحاسوب",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "قم بتوصيل الهاتف بالكمبيوتر ونفذ الأمر التالي في Terminal / CMD:",
                            fontSize = 12.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // صندوق الأمر مع زر النسخ
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colorScheme.surface,
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(10.dp)
                        ) {
                            Text(
                                text = adbCommand,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("ADB Command", adbCommand)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "تم نسخ أمر ADB بنجاح", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.align(Alignment.End)
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("نسخ الأمر", fontSize = 12.sp)
                        }
                    }
                }

                Text(
                    text = "ملاحظة أمان: هذا التعديل لا يمس ملفات النظام ولا يلغي شهادة SafetyNet أو حماية البنوك لأنه يتم عبر قنوات النظام الرسمية.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.outline
                )

                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("فهمت ذلك")
                }
            }
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/volte/vowifi/switcher/ui/theme/Theme.kt",
    filename: "Theme.kt",
    language: "kotlin",
    category: "ui",
    description: "ثيم Material 3 متكامل يدعم الوضع الليلي والألوان الديناميكية",
    content: `package com.volte.vowifi.switcher.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF6750A4),
    secondary = Color(0xFF625B71),
    tertiary = Color(0xFF7D5260),
    background = Color(0xFF141218),
    surface = Color(0xFF211F26),
    surfaceVariant = Color(0xFF2B2930),
    onPrimary = Color.White,
    onBackground = Color(0xFFE6E1E5),
    onSurface = Color(0xFFE6E1E5)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF4F46E5),
    secondary = Color(0xFF4338CA),
    tertiary = Color(0xFF0284C7),
    background = Color(0xFFF8FAFC),
    surface = Color(0xFFFFFFFF),
    surfaceVariant = Color(0xFFF1F5F9),
    onPrimary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A)
)

@Composable
fun VoLteVoWiFiSwitcherTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}`
  },
  {
    path: "app/src/main/res/values/strings.xml",
    filename: "strings.xml (Arabic)",
    language: "xml",
    category: "res",
    description: "ملف السلاسل النصية باللغة العربية",
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">VoLTE &amp; VoWiFi Switcher</string>
    <string name="permission_phone_state_required">صلاحية قراءة حالة الهاتف مطلوبة للكشف عن شرائح SIM</string>
    <string name="sim_1">شريحة 1</string>
    <string name="sim_2">شريحة 2</string>
    <string name="volte_title">مكالمات 4G (VoLTE)</string>
    <string name="vowifi_title">مكالمات Wi-Fi (VoWiFi)</string>
    <string name="refresh">تحديث الحالة</string>
    <string name="status_enabled">مفعل</string>
    <string name="status_disabled">معطل</string>
</resources>`
  },
  {
    path: "README.md",
    filename: "README.md",
    language: "markdown",
    category: "docs",
    description: "شرح شامل لطريقة بناء المشروع في Android Studio، ومنح الصلاحيات، واستخدام Shizuku",
    content: `# VoLTE & VoWiFi Switcher - أداة التحكم بالشبكة و IMS لكل شريحة

تطبيق أندرويد أصلي (Native Android App) احترافي ومبني بلغة **Kotlin** وواجهة **Jetpack Compose / Material Design 3** يتيح لمستخدمي Power Users التحكم الكامل في تفعيل وتعطيل خدمات **VoLTE** و **VoWiFi** لكل شريحة اتصال على حدة (Dual SIM Standby / DSDS) وتطبيق التغيير فعلياً على إعدادات النظام الحقيقية (\`Settings.Global\` / \`ImsMmTelManager\`).

---

## 🚀 المميزات الرئيسية

1. **التحكم المستقل بكل شريحة (SIM 1 و SIM 2)**:
   - تحديد معرف الاشتراك الفريد \`subscriptionId\` و \`slotIndex\`.
   - قراءة وتعديل مفاتيح IMS الخاصة بكل شريحة (\`volte_vt_enabled_0\`, \`volte_vt_enabled_1\`, \`wfc_ims_enabled_0\`, \`wfc_ims_enabled_1\`).

2. **التعديل الحقيقي على إعدادات النظام (System / Global Settings)**:
   - ليس مجرد واجهة قراءة فقط، بل يقوم بكتابة القيمة مباشرة في \`Settings.Global\` و \`ImsMmTelManager\`.

3. **دعم Shizuku لتجاوز قيود النظام بدون كمبيوتر وبدون روت**:
   - الاتصال عبر Binder بخدمة Shizuku لتنفيذ أوامر Shell المميزة مباشرة.

4. **دعم أمر ADB المباشر لمن لا يستخدم Shizuku**:
   - استخدام صلاحية \`android.permission.WRITE_SECURE_SETTINGS\`.

5. **سجل عمليات حي (Live Log)**:
   - عرض نتيجة كل محاولة تغيير (نجاح/فشل مع السبب التقني الدقيق وطريقة التنفيذ).

6. **أمان تام**:
   - لا يتطلب روت ولا يعدل قسم النظام (System Partition)، مما يحافظ على شهادة Google Play Integrity و SafetyNet وتطبيقات البنوك.

---

## 🛠️ متطلبات البناء (Build Requirements)

- **Android Studio**: Ladybug (2024.2) أو أحدث
- **Kotlin**: 2.0+
- **Gradle**: 8.7+
- **JDK**: Java 17
- **أقل إصدار أندرويد**: Android 11 (API 30)
- **الإصدار المستهدف**: Android 15 (API 35)

---

## ⚡ خطوات منح الصلاحيات (Permission Setup)

لتطبيق التعديلات الحقيقية على إعدادات النظام، يجب منح الصلاحية بإحدى طريقتين:

### الطريقة الأولى: عبر تطبيق Shizuku (بدون كمبيوتر - موصى بها)
1. حمّل تطبيق **Shizuku** من Google Play أو GitHub.
2. من إعدادات المطور في الهاتف (Developer Options)، فعّل **تصحيح الأخطاء اللاسلكي (Wireless Debugging)**.
3. افتح Shizuku واضغط على "Pairing" ثم ابدأ الخدمة "Start".
4. افتح هذا التطبيق واضغط على **"منح Shizuku"** وسيعمل فوراً بأعلى صلاحيات!

### الطريقة الثانية: عبر أمر ADB من الكمبيوتر
1. فعّل **تصحيح أخطاء USB (USB Debugging)** في خيارات المطور.
2. صل الهاتف بالكمبيوتر وافتح Terminal أو موجه الأوامر (CMD).
3. اكتب الأمر التالي:
\`\`\`bash
adb shell pm grant com.volte.vowifi.switcher android.permission.WRITE_SECURE_SETTINGS
\`\`\`
4. افتح التطبيق واستمتع بالتحكم الكامل!

---

## 📱 أكواد سرية مفيدة لبعض الأجهزة

- **هواتف شاومي (Xiaomi / POCO / Redmi)**:
  - لتعطيل فحص المشغل لـ VoLTE (Carrier Check Disable): \`*#*#86583#*#*\`
  - لتعطيل فحص المشغل لـ VoWiFi: \`*#*#86943#*#*\`
- **قائمة اختبار الشبكة العامة في أندرويد**:
  - \`*#*#4636#*#*\` -> معلومات الهاتف (Phone info) -> تحقق من حالة IMS.`
  }
];
