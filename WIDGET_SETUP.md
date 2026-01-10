# ネイティブウィジェット実装ガイド

このドキュメントでは、Y!mobile Monitorアプリにスマートフォンのホーム画面に表示するネイティブウィジェット機能を実装する方法を説明します。

## 概要

Expoを使用したReact Nativeアプリでネイティブウィジェットを実装するには、以下の2つのアプローチがあります：

1. **Expo Config Plugins**を使用してネイティブコードを生成
2. **EAS Build**でカスタムネイティブコードをビルド

## Androidウィジェット実装

### 1. 必要なパッケージのインストール

```bash
pnpm add expo-build-properties
```

### 2. app.config.tsの設定

AndroidウィジェットはJavaで実装し、Expoのビルドシステムで自動生成します。

```typescript
// app.config.ts
plugins: [
  [
    "expo-build-properties",
    {
      android: {
        buildArchs: ["armeabi-v7a", "arm64-v8a"],
        // ウィジェットサポート
        usesCleartextTraffic: false,
      },
    },
  ],
]
```

### 3. Androidウィジェットコード

`android/app/src/main/java/com/ymobile/monitor/widget/`に以下のファイルを作成：

- `DataWidgetProvider.java` - ウィジェットプロバイダー
- `WidgetUpdateService.java` - ウィジェット更新サービス

### 4. AndroidManifest.xmlの設定

ウィジェット宣言をAndroidManifest.xmlに追加：

```xml
<receiver
    android:name=".widget.DataWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_info" />
</receiver>
```

## iOSウィジェット実装

### 1. WidgetKitの設定

iOS 14以降でWidgetKitを使用します。

### 2. app.config.tsの設定

```typescript
// app.config.ts
ios: {
  supportsTablet: true,
  bundleIdentifier: env.iosBundleId,
  // ウィジェット対応
  infoPlist: {
    NSWidgetSupport: true,
  },
}
```

### 3. iOSウィジェットコード

`ios/YmobileMonitor/Widgets/`に以下のファイルを作成：

- `DataWidget.swift` - ウィジェット定義
- `DataWidgetBundle.swift` - ウィジェットバンドル

## バックグラウンド更新

### Android

AlarmManagerを使用して定期的にウィジェットを更新：

```java
AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
Intent intent = new Intent(context, WidgetUpdateService.class);
PendingIntent pendingIntent = PendingIntent.getService(context, 0, intent, 
    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

// 15分ごとに更新
alarmManager.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
    SystemClock.elapsedRealtime() + AlarmManager.INTERVAL_FIFTEEN_MINUTES,
    AlarmManager.INTERVAL_FIFTEEN_MINUTES,
    pendingIntent);
```

### iOS

BackgroundTasks フレームワークを使用：

```swift
import BackgroundTasks

func scheduleWidgetRefresh() {
    let request = BGProcessingTaskRequest(identifier: "com.ymobile.monitor.widget.refresh")
    request.requiresNetworkConnectivity = true
    
    do {
        try BGTaskScheduler.shared.submit(request)
    } catch {
        print("Failed to schedule widget refresh: \(error)")
    }
}
```

## ウィジェットデータの共有

### 共有ストレージの使用

AppGroupsを使用してアプリとウィジェット間でデータを共有：

**Android:**
```java
Context context = context.createPackageContext("com.ymobile.monitor", 0);
SharedPreferences prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE);
```

**iOS:**
```swift
let defaults = UserDefaults(suiteName: "group.com.ymobile.monitor")
defaults?.set(data, forKey: "widget_data")
```

## ウィジェット表示サイズ

### Android
- 最小: 4x1 (デフォルト)
- 推奨: 4x2

### iOS
- Small: 2x2
- Medium: 2x4
- Large: 4x4

## デバッグ

### Android
```bash
adb shell dumpsys appwidget
```

### iOS
```bash
xcrun simctl spawn booted log stream --predicate 'eventMessage contains "widget"'
```

## リソース

- [Android App Widgets](https://developer.android.com/guide/topics/appwidgets)
- [iOS WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Expo Build Properties](https://docs.expo.dev/build-reference/build-properties/)
