# GitHub Secrets セットアップガイド

このドキュメントでは、GitHub ActionsでY!mobile Monitorアプリをビルド・デプロイするために必要なシークレットの設定方法を説明します。

## 📋 必要なシークレット一覧

### 1. EXPO_TOKEN（必須）

**説明**: Expo/EASにアクセスするためのトークン

**取得方法**:
```bash
# Expo CLIでログイン
npx expo login

# トークンを生成
npx eas whoami
npx expo whoami
```

または、Expo.devのダッシュボードから：
1. https://expo.dev にアクセス
2. Account Settings → Access Tokens
3. "Create Token" をクリック
4. トークン名を入力（例: "GitHub Actions"）
5. 生成されたトークンをコピー

**設定方法**:
- GitHub Repository → Settings → Secrets and variables → Actions
- "New repository secret" をクリック
- Name: `EXPO_TOKEN`
- Secret: 生成したトークンを貼り付け

---

### 2. GOOGLE_SERVICE_ACCOUNT_KEY（Android Deploy用）

**説明**: Google Play Consoleへのアップロード用サービスアカウントキー

**取得方法**:
1. Google Play Console にアクセス
2. Setup → API access → Service accounts
3. "Create new service account" または既存のものを選択
4. JSON キーファイルをダウンロード
5. ファイルの内容を Base64 エンコード:
   ```bash
   # Linux/Mac
   base64 -i play-store-service-account.json
   
   # Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("play-store-service-account.json"))
   ```

**設定方法**:
- Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
- Secret: Base64エンコードされた内容

---

### 3. APPLE_ID（iOS Deploy用）

**説明**: Apple Developer アカウントのApple ID

**取得方法**:
- あなたのApple IDメールアドレス（例: developer@example.com）

**設定方法**:
- Name: `APPLE_ID`
- Secret: Apple IDメールアドレス

---

### 4. APPLE_APP_SPECIFIC_PASSWORD（iOS Deploy用）

**説明**: App-specific password for App Store Connect

**取得方法**:
1. https://appleid.apple.com にアクセス
2. Sign In & Security → App-Specific Passwords
3. "Generate an app-specific password" をクリック
4. 名前を入力（例: "GitHub Actions"）
5. 生成されたパスワードをコピー

**設定方法**:
- Name: `APPLE_APP_SPECIFIC_PASSWORD`
- Secret: 生成されたパスワード

---

## 🔐 シークレットの設定手順

### GitHub Repository での設定

1. GitHubリポジトリにアクセス
2. **Settings** タブをクリック
3. 左サイドバーの **Secrets and variables** → **Actions** をクリック
4. **New repository secret** をクリック
5. 上記の各シークレットを追加

### 環境（Environment）の設定

プロダクションデプロイには、Environment を設定することを推奨します：

1. Settings → Environments → New environment
2. Environment name: `production`
3. Protection rules を設定:
   - ✅ Required reviewers（承認者が必要）
   - ✅ Wait timer（デプロイ前の待機時間）
4. Environment secrets を追加:
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `APPLE_ID`
   - `APPLE_APP_SPECIFIC_PASSWORD`

---

## 🧪 テスト方法

### 1. シークレットが正しく設定されているか確認

リポジトリの Settings → Secrets and variables → Actions で、以下が設定されていることを確認：
- ✅ EXPO_TOKEN
- ✅ GOOGLE_SERVICE_ACCOUNT_KEY（Android Deploy時）
- ✅ APPLE_ID（iOS Deploy時）
- ✅ APPLE_APP_SPECIFIC_PASSWORD（iOS Deploy時）

### 2. ビルドをテスト実行

```bash
# 手動でワークフローをトリガー
# GitHub → Actions → "Build and Deploy" → "Run workflow"
```

または、コマンドラインから：
```bash
gh workflow run build.yml -f platform=android -f profile=preview
```

---

## 🚀 EAS ビルドの初期設定

### 1. EAS CLI のインストール

```bash
pnpm add -g eas-cli
```

### 2. EAS にログイン

```bash
eas login
```

### 3. プロジェクトの設定

```bash
# EAS プロジェクトを初期化（既に eas.json がある場合は不要）
eas build:configure
```

### 4. 認証情報の設定

#### Android
```bash
# Androidキーストアを生成（初回のみ）
eas credentials -p android
```

#### iOS
```bash
# iOS証明書とプロビジョニングプロファイルを設定
eas credentials -p ios
```

---

## 📝 よくある質問

### Q: EXPO_TOKEN はどこで確認できますか？
A: `npx expo whoami` コマンドを実行するか、https://expo.dev のアカウント設定で確認できます。

### Q: ビルドが失敗します
A: 
1. シークレットが正しく設定されているか確認
2. `eas.json` の設定を確認
3. Expo/EASダッシュボードでビルドログを確認

### Q: プライベートリポジトリで使えますか？
A: はい、GitHub Actionsはプライベートリポジトリでも利用できます。ただし、無料プランでは月間の実行時間制限があります。

### Q: EAS ビルドの料金は？
A: 無料プランでは月に30ビルドまで無料です。詳細は https://expo.dev/pricing を参照してください。

---

## 🔒 セキュリティのベストプラクティス

1. **シークレットは絶対にコードにコミットしない**
2. **Environment を使用してプロダクションデプロイを保護**
3. **定期的にトークンをローテーション**
4. **最小権限の原則を適用**（必要な権限のみ付与）
5. **ログにシークレットが表示されないよう注意**

---

## 📚 参考リンク

- [Expo Application Services (EAS)](https://docs.expo.dev/eas/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [Google Play Console API](https://developers.google.com/android-publisher)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)

---

**最終更新**: 2026年1月11日
