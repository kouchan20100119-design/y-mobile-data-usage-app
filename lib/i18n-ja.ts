/**
 * 日本語ローカライゼーション
 */

export const i18n = {
  // ログイン画面
  login: {
    title: "Y!mobile Monitor",
    subtitle: "データ使用量をチェック",
    mobileIdLabel: "Y!mobile ID",
    mobileIdPlaceholder: "電話番号またはメールアドレス",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワード",
    loginButton: "ログイン",
    loggingIn: "ログイン中...",
    loginError: "ログインに失敗しました",
    invalidCredentials: "Y!mobile IDまたはパスワードが正しくありません",
    networkError: "ネットワークエラーが発生しました",
  },

  // ホーム画面
  home: {
    title: "データ使用状況",
    lastUpdated: "最終更新",
    refreshButton: "更新",
    logoutButton: "ログアウト",
    refreshing: "更新中...",
    refreshSuccess: "データを更新しました",
    refreshError: "更新に失敗しました",
  },

  // データ表示
  data: {
    usageRate: "使用率",
    remaining: "残量",
    used: "使用済み",
    total: "総容量",
    basicCapacity: "基本容量",
    carryover: "繰越容量",
    paidCapacity: "有料容量",
    usedCapacity: "使用済み容量",
    remainingCapacity: "残量",
    gb: "GB",
    percent: "%",
  },

  // 設定画面
  settings: {
    title: "設定",
    credentials: "認証情報",
    changeCredentials: "認証情報を変更",
    cacheSettings: "キャッシュ設定",
    cacheUpdateInterval: "更新間隔",
    minutes: "分",
    notificationSettings: "通知設定",
    appInfo: "アプリ情報",
    version: "バージョン",
    about: "について",
    logout: "ログアウト",
    confirmLogout: "ログアウトしますか？",
    cancel: "キャンセル",
    confirm: "確認",
  },

  // エラーメッセージ
  errors: {
    loginFailed: "ログインに失敗しました",
    fetchFailed: "データ取得に失敗しました",
    parseError: "データの解析に失敗しました",
    networkError: "ネットワークエラーが発生しました",
    unknownError: "不明なエラーが発生しました",
    retryButton: "再試行",
    closeButton: "閉じる",
  },

  // 成功メッセージ
  success: {
    loginSuccess: "ログインしました",
    logoutSuccess: "ログアウトしました",
    updateSuccess: "データを更新しました",
    credentialsSaved: "認証情報を保存しました",
  },

  // ローディング状態
  loading: {
    loggingIn: "ログイン中...",
    fetching: "データ取得中...",
    updating: "更新中...",
    saving: "保存中...",
  },

  // グラフラベル
  chart: {
    usageChart: "使用状況",
    usageBreakdown: "容量内訳",
    usedLabel: "使用済み",
    remainingLabel: "残量",
    basicLabel: "基本",
    carryoverLabel: "繰越",
    paidLabel: "有料",
  },
};

export type I18nKeys = typeof i18n;
