# 🎯 ネイティブウィジェット機能 - クイックスタートガイド

Y!mobile Monitorアプリに**ホーム画面ウィジェット機能**が追加されました！

## ✨ 機能概要

- 📊 **リアルタイムデータ表示**: データ使用量をホーム画面で確認
- 🤖 **Android対応**: AppWidget実装
- 🍎 **iOS対応**: WidgetKit実装（iOS 14+）
- 🔄 **自動更新**: 15分ごとにバックグラウンド更新
- 🎨 **美しいUI**: 使用率に応じた色分け表示

## 🚀 セットアップ（3ステップ）

### ステップ1: 依存関係のインストール

```bash
pnpm install
```

### ステップ2: ネイティブプロジェクトの生成

```bash
npx expo prebuild
```

このコマンドで以下が自動的に実行されます：
- ✅ `android/`と`ios/`フォルダの生成
- ✅ ウィジェット用のネイティブコード配置
- ✅ 必要な設定の適用

### ステップ3: プラットフォーム別の追加設定

#### 🤖 Android

`android/app/src/main/java/space/manus/y/mobile/monitor/app/t20251231050125/MainApplication.java`を開いて、以下を追加：

```java
// インポートを追加
import space.manus.y.mobile.monitor.app.t20251231050125.widget.WidgetBridgePackage;

// getPackages()メソッド内に追加
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new WidgetBridgePackage()); // この行を追加
  return packages;
}
```

#### 🍎 iOS

1. **Xcodeでプロジェクトを開く**
   ```bash
   open ios/*.xcworkspace
   ```

2. **Widget Extensionを追加**
   - File → New → Target
   - "Widget Extension"を選択
   - Product Name: `YmobileDataWidget`
   - Include Configuration Intent: チェックなし

3. **ファイルをコピー**
   - `ios/YmobileDataWidget/YmobileDataWidget.swift`
   - `ios/YmobileDataWidget/Info.plist`
   
   を、Xcodeで作成された`YmobileDataWidget`フォルダに置き換え

4. **App Groupsを設定**
   - メインアプリとWidget Extensionの両方で：
   - Signing & Capabilities → + Capability → App Groups
   - App Group ID: `group.space.manus.y.mobile.monitor.app.t20251231050125`

5. **Bridgeファイルを追加**
   - `ios/YmobileDataWidget/WidgetBridge.swift`
   - `ios/YmobileDataWidget/WidgetBridge.m`
   
   をメインアプリのターゲットに追加（Widget Extensionではない）

## 🏃 実行

### Android
```bash
pnpm android
# または
npx expo run:android
```

### iOS
```bash
pnpm ios
# または
npx expo run:ios
```

## 📱 ウィジェットの追加方法

### Android
1. ホーム画面を長押し
2. 「ウィジェット」メニューを開く
3. 「Y!mobile データ使用量」を探す
4. ホーム画面にドラッグ

### iOS
1. ホーム画面を長押し
2. 左上の「+」ボタン
3. 「Y!mobile データ使用量」を検索
4. サイズを選択して「ウィジェットを追加」

## 🎨 ウィジェット表示内容

- **使用率**: 大きく表示（色分け）
  - 🟢 緑: 0-69%
  - 🟡 黄: 70-89%
  - 🔴 赤: 90%以上
- **プログレスバー**: 視覚的な使用状況
- **使用量**: XX.XX GB
- **残量**: XX.XX GB
- **合計**: XX.XX GB
- **最終更新時刻**: YYYY/MM/DD HH:MM

## 🔄 更新タイミング

ウィジェットは以下の時に自動更新されます：

1. ✅ アプリでデータを取得/更新した時
2. ✅ バックグラウンドで15分ごと
3. ✅ ウィジェットをタップした時（アプリ起動）

## ⚙️ 設定

アプリ内の「ウィジェット設定」画面から：
- ウィジェットの有効/無効
- 更新間隔の変更
- 表示設定

## 🐛 トラブルシューティング

### ウィジェットが表示されない

**Android:**
```bash
# クリーンビルド
npx expo prebuild --clean
pnpm android
```

**iOS:**
- Xcodeでプロジェクトをクリーン（⌘+Shift+K）
- App Groupsの設定を再確認
- Widget ExtensionのBundle IDを確認

### データが更新されない

1. アプリを起動してログイン
2. ホーム画面でデータを取得
3. ウィジェット設定で更新間隔を確認
4. ログ画面でエラーを確認

### ビルドエラー

**Android:**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild
```

**iOS:**
- Podsを再インストール:
  ```bash
  cd ios
  pod deintegrate
  pod install
  cd ..
  ```

## 📚 詳細ドキュメント

- 📖 [完全実装ガイド](./WIDGET_IMPLEMENTATION.md)
- 📝 [セットアップ詳細](./WIDGET_SETUP.md)
- 🎨 [カスタマイズ方法](./WIDGET_IMPLEMENTATION.md#-カスタマイズ)

## 🎯 動作確認チェックリスト

- [ ] `pnpm install`完了
- [ ] `npx expo prebuild`完了
- [ ] Android: MainApplication.javaにWidgetBridgePackage追加
- [ ] iOS: Widget Extension作成
- [ ] iOS: App Groups設定
- [ ] iOS: Bridgeファイル追加
- [ ] アプリビルド成功
- [ ] アプリでログイン成功
- [ ] データ取得成功
- [ ] ホーム画面にウィジェット追加
- [ ] ウィジェットにデータ表示
- [ ] ウィジェットタップでアプリ起動

## 💡 ヒント

- **初回は必ずアプリを起動**してログイン＆データ取得してください
- **ウィジェットはアプリとデータを共有**します（認証情報は共有しません）
- **バッテリー最適化**により、更新タイミングがずれることがあります
- **Androidでは複数のウィジェット**を配置できます

## 🆘 サポート

問題が発生した場合：
1. ログ画面でエラーメッセージを確認
2. `WIDGET_IMPLEMENTATION.md`の詳細ガイドを参照
3. GitHubのIssuesで報告

---

**実装完了**: 2026年1月11日  
**対応プラットフォーム**: Android 5.0+, iOS 14.0+
