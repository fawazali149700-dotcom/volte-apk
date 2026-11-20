import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root project folder
  const projectRoot = zip.folder("VoLteVoWiFiSwitcher") || zip;

  // Additional Gradle standard files
  projectRoot.file("settings.gradle.kts", `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://api.xposed.info/") }
    }
}

rootProject.name = "VoLteVoWiFiSwitcher"
include(":app")
`);

  projectRoot.file("gradle.properties", `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`);

  projectRoot.file("app/proguard-rules.pro", `# Keep Shizuku classes
-keep class rikka.shizuku.** { *; }
-keep class dev.rikka.shizuku.** { *; }
-keep interface rikka.shizuku.** { *; }
-keepattributes *Annotation*
`);

  // Add all defined files
  for (const file of ANDROID_PROJECT_FILES) {
    if (file.path === "AndroidManifest.xml") {
      projectRoot.file("app/src/main/AndroidManifest.xml", file.content);
    } else {
      projectRoot.file(file.path, file.content);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
