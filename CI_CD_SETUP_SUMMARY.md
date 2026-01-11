# ✅ CI/CD セットアップ完了

Y!mobile MonitorアプリのCI/CDパイプラインが構築されました！

## 📋 作成されたファイル

### GitHub Actions ワークフロー（4ファイル）

```
.github/workflows/
├── build.yml              # メインビルドワークフロー
├── pr-check.yml          # プルリクエストチェック
├── deploy.yml            # プロダクションデプロイ
└── update-widget.yml     # ウィジェット更新テスト
```

### EAS Build 設定

```
eas.json                  # EAS Build プロファイル設定
```

### ドキュメント（3ファイル）

```
.github/
├── SETUP_SECRETS.md      # シークレット設定ガイド
└── workflows/
    └── README.md         # ワークフロー詳細説明

CI_CD_GUIDE.md            # 完全セットアップガイド
CI_CD_SETUP_SUMMARY.md    # このファイル
```

### スクリプト

```
scripts/
└── setup-ci.sh           # 自動セットアップスクリプト
```

### 設定ファイル更新

```
package.json              # CI用スクリプト追加
.gitignore               # EAS/シークレットファイル除外
```

---

## 🚀 クイックスタート

### 1. セットアップスクリプトを実行

```bash
pnpm run ci:setup
```

### 2. EXPO_TOKEN を取得

```bash
eas whoami
```

または https://expo.dev/accounts にアクセス

### 3. GitHub Secrets を設定

**必須:**
- `EXPO_TOKEN`

**プロダクション用（オプション）:**
- `GOOGLE_SERVICE_ACCOUNT_KEY` (Android)
- `APPLE_ID` (iOS)
- `APPLE_APP_SPECIFIC_PASSWORD` (iOS)

詳細: `.github/SETUP_SECRETS.md`

### 4. プッシュしてビルド実行

```bash
git add .
git commit -m "ci: setup CI/CD pipeline"
git push origin main
```

GitHub Actionsが自動的に実行されます！

---

## 📱 ビルドコマンド

### ローカル開発

```bash
# 開発サーバー起動
pnpm dev

# Android
pnpm android

# iOS
pnpm ios
```

### EAS Build

```bash
# Android プレビュー
pnpm run eas:build:android

# iOS プレビュー
pnpm run eas:build:ios

# 両方
pnpm run eas:build:all
```

### GitHub Actions（手動トリガー）

```bash
# GitHub CLI
gh workflow run build.yml \
  -f platform=android \
  -f profile=preview

# または Web UI
# https://github.com/[your-repo]/actions → Run workflow
```

---

## 🔄 ワークフロー概要

### 1. PR Check（自動）

プルリクエストが作成/更新されると自動実行：

```
┌─────────────────┐
│  Pull Request   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌───────┐
│ Lint & │ │ Type  │
│ Test   │ │ Check │
└────────┘ └───────┘
```

### 2. Build（mainへのpush時）

```
┌─────────────┐
│ Push main   │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Lint & Test  │
└──────┬───────┘
       │
  ┌────┴────┐
  ▼         ▼
┌─────┐  ┌────┐
│ And │  │iOS │
│roid │  │    │
└─────┘  └────┘
```

### 3. Deploy（タグpush時）

```
┌──────────────┐
│ git tag v1.0 │
│ git push tag │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Build & Test │
└──────┬───────┘
       │
  ┌────┴─────┐
  ▼          ▼
┌──────┐  ┌────────┐
│Google│  │  App   │
│ Play │  │ Store  │
└──────┘  └────────┘
       │
       ▼
┌──────────────┐
│GitHub Release│
└──────────────┘
```

---

## 🎯 主な機能

### ✅ 自動化されること

1. **コード品質チェック**
   - ESLint
   - TypeScript型チェック
   - Prettier フォーマット

2. **テスト実行**
   - ユニットテスト
   - E2Eテスト（設定済み）

3. **ビルド**
   - Android APK/AAB
   - iOS IPA
   - サーバーコード

4. **デプロイ**
   - Google Play Store（内部テスト）
   - App Store（TestFlight）
   - GitHubリリース作成

### 🔐 セキュリティ

- シークレットの暗号化保存
- プロダクション環境の保護
- 承認フローの設定（オプション）

### ⚡ パフォーマンス

- 依存関係のキャッシュ
- 並列ジョブ実行
- インクリメンタルビルド

---

## 📊 ビルドプロファイル

### Development（開発）
```json
{
  "developmentClient": true,
  "distribution": "internal"
}
```
用途: 開発中のテスト

### Preview（プレビュー）
```json
{
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```
用途: 内部テスト配布

### Production（本番）
```json
{
  "distribution": "store",
  "android": { "buildType": "aab" }
}
```
用途: ストア公開

---

## 🛠️ 利用可能なコマンド

### パッケージマネージャー

```bash
pnpm install              # 依存関係インストール
pnpm run ci:setup        # CI/CD自動セットアップ
```

### 開発

```bash
pnpm dev                 # 開発サーバー起動
pnpm android            # Android エミュレータ
pnpm ios                # iOS シミュレータ
```

### ビルド

```bash
pnpm build              # サーバービルド
pnpm prebuild           # ネイティブプロジェクト生成
pnpm prebuild:clean     # クリーンビルド
```

### テスト & チェック

```bash
pnpm test               # テスト実行
pnpm test:watch         # ウォッチモード
pnpm test:ci            # カバレッジ付き
pnpm check              # 型チェック
pnpm lint               # リント実行
pnpm format             # フォーマット
pnpm format:check       # フォーマットチェック
```

### EAS Build

```bash
pnpm run eas:build:android    # Android ビルド
pnpm run eas:build:ios        # iOS ビルド
pnpm run eas:build:all        # 両方ビルド
```

### EAS Submit

```bash
pnpm run eas:submit:android   # Play Store提出
pnpm run eas:submit:ios       # App Store提出
```

---

## 📚 ドキュメント

### 必読

1. **[CI_CD_GUIDE.md](./CI_CD_GUIDE.md)**
   - 完全なセットアップガイド
   - トラブルシューティング
   - ベストプラクティス

2. **[.github/SETUP_SECRETS.md](./.github/SETUP_SECRETS.md)**
   - GitHub Secretsの設定方法
   - 各シークレットの取得手順

3. **[.github/workflows/README.md](./.github/workflows/README.md)**
   - 各ワークフローの詳細説明
   - 実行方法

### 参考

- **[WIDGET_IMPLEMENTATION.md](./WIDGET_IMPLEMENTATION.md)**
  - ネイティブウィジェット実装詳細

- **[README_WIDGET.md](./README_WIDGET.md)**
  - ウィジェット機能クイックスタート

---

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# ローカルでテスト
pnpm build
pnpm check
pnpm test

# EAS ログ確認
eas build:list
eas build:view [BUILD_ID]
```

### シークレットエラー

```bash
# GitHub Secrets確認
gh secret list

# 再設定
gh secret set EXPO_TOKEN
```

### 認証エラー

```bash
# 再ログイン
eas login
eas whoami

# トークン再生成
gh secret set EXPO_TOKEN
```

詳細は `CI_CD_GUIDE.md` の「トラブルシューティング」セクションを参照

---

## 🎉 次のステップ

### 1. 初回ビルドを実行

```bash
# 手動トリガー
gh workflow run build.yml -f platform=android -f profile=preview
```

### 2. ビルド結果を確認

- GitHub Actions: https://github.com/[your-repo]/actions
- EAS Dashboard: https://expo.dev

### 3. テスト配布

ビルドが完了したら：
- Android: APKをダウンロードしてインストール
- iOS: TestFlightでテスト

### 4. プロダクション準備

1. ストア用の画像・説明文を準備
2. プライバシーポリシーを作成
3. `v1.0.0` タグでリリース

---

## 💡 ヒント

- **最初は `preview` プロファイルでテスト**
- **本番デプロイ前に内部テストを十分に実施**
- **バージョン番号は必ずインクリメント**
- **CHANGELOG.md を更新**（推奨）

---

## 📞 サポート

問題が発生した場合：

1. ログを確認（GitHub Actions / EAS Dashboard）
2. ドキュメントを参照
3. GitHubのIssuesで報告

---

**✅ CI/CDセットアップ完了！**

あなたのアプリは自動ビルド・デプロイの準備が整いました。

---

**作成日**: 2026年1月11日  
**バージョン**: 1.0.0  
**ステータス**: 🟢 Ready to Build
