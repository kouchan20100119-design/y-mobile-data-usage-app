/**
 * Y!mobile データ残量取得ロジック
 * Pythonコード (ymobile_fetcher.py) をTypeScriptに移植
 */

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MobileDataUsage {
  timestamp: string;
  remaining_gb: number;
  total_gb: number;
  used_gb: number;
  percentage: number;
  last_updated: string;
  kurikoshi_gb: number;
  kihon_gb: number;
  yuryou_gb: number;
}

export interface FetchResult {
  success: boolean;
  data?: MobileDataUsage;
  error?: string;
}

const CACHE_DURATION_MINUTES = 15;
const CACHE_KEY = "ymobile_cache";
const CREDENTIALS_KEY = "ymobile_credentials";

export class YmobileFetcher {
  private mobileId: string;
  private password: string;
  private cacheDuration: number;

  constructor(mobileId: string, password: string) {
    this.mobileId = mobileId;
    this.password = password;
    this.cacheDuration = CACHE_DURATION_MINUTES * 60 * 1000; // Convert to milliseconds
  }

  /**
   * キャッシュからデータを読み込み
   */
  async getCachedData(): Promise<MobileDataUsage | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log("📝 初回実行 - データを取得します");
        return null;
      }

      const cache = JSON.parse(cached) as MobileDataUsage & { timestamp: string };
      const cachedTime = new Date(cache.timestamp).getTime();
      const now = Date.now();

      if (now - cachedTime < this.cacheDuration) {
        const remainingSeconds = Math.floor((this.cacheDuration - (now - cachedTime)) / 1000);
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        console.log(`✅ キャッシュ使用（次回更新まで ${remainingMinutes}分）`);
        return cache;
      }

      console.log("⏰ キャッシュ期限切れ - 新規取得します");
      return null;
    } catch (error) {
      console.log("⚠️ キャッシュ読み込みエラー:", error);
      return null;
    }
  }

  /**
   * キャッシュに保存
   */
  async saveCache(data: MobileDataUsage): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("⚠️ キャッシュ保存エラー:", error);
    }
  }

  /**
   * ログイン処理
   */
  private async login(): Promise<{ ticket: string; sessionCookie: string } | null> {
    try {
      console.log("🔐 ログイン中...");

      // ログインページを取得してticketを取得
      const response = await fetch("https://my.ymobile.jp/muc/d/webLink/doSend/MWBWL0130", {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        },
      });

      const html = await response.text();
      const ticketMatch = html.match(/name="ticket"\s+value="([^"]+)"/);

      if (!ticketMatch || !ticketMatch[1]) {
        throw new Error("ログインページのticketが見つかりません");
      }

      const ticket = ticketMatch[1];

      // ログイン
      const loginResponse = await fetch("https://id.my.ymobile.jp/sbid_auth/type1/2.0/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        },
        body: `telnum=${encodeURIComponent(this.mobileId)}&password=${encodeURIComponent(
          this.password
        )}&ticket=${encodeURIComponent(ticket)}`,
      });

      const setCookieHeader = loginResponse.headers.get("set-cookie");
      const sessionCookie = setCookieHeader || "";

      return { ticket, sessionCookie };
    } catch (error) {
      console.log("❌ ログインエラー:", error);
      return null;
    }
  }

  /**
   * 新規データ取得
   */
  async fetchFreshData(): Promise<MobileDataUsage | null> {
    try {
      const loginResult = await this.login();
      if (!loginResult) {
        throw new Error("ログイン失敗");
      }

      console.log("📊 データ取得中...");

      // データ取得ページへ
      const dataPageResponse = await fetch("https://my.ymobile.jp/muc/d/webLink/doSend/MRERE0000", {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          Cookie: loginResult.sessionCookie,
        },
      });

      const dataPageHtml = await dataPageResponse.text();

      // トークン取得
      const mfivMatch = dataPageHtml.match(/name="mfiv"\s+value="([^"]+)"/);
      const mfymMatch = dataPageHtml.match(/name="mfym"\s+value="([^"]+)"/);

      if (!mfivMatch || !mfymMatch) {
        throw new Error("認証トークンの取得に失敗しました");
      }

      const mfiv = mfivMatch[1];
      const mfym = mfymMatch[1];

      // データ取得
      const dataResponse = await fetch("https://re61.my.ymobile.jp/resfe/top/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          Cookie: loginResult.sessionCookie,
        },
        body: `mfiv=${encodeURIComponent(mfiv)}&mfym=${encodeURIComponent(mfym)}`,
      });

      const dataHtml = await dataResponse.text();
      const result = this.parseData(dataHtml);

      if (result) {
        console.log(`✅ 取得成功: ${result.remaining_gb}GB / ${result.total_gb}GB 残り`);
        return result;
      } else {
        console.log("❌ データ解析失敗");
        return null;
      }
    } catch (error) {
      console.log("❌ エラー:", error);
      return null;
    }
  }

  /**
   * HTMLからデータを抽出
   */
  private parseData(html: string): MobileDataUsage | null {
    try {
      // テーブルを探す
      const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/g);
      if (!tableMatches || tableMatches.length < 4) {
        throw new Error(`テーブルが不足しています（${tableMatches?.length || 0}個）`);
      }

      // テーブルから数値を抽出する関数
      const extractNumber = (tableHtml: string, rowIndex: number = 0): number => {
        const rows = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
        if (!rows || !rows[rowIndex]) {
          throw new Error("行が見つかりません");
        }

        const tdMatches = rows[rowIndex].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if (!tdMatches || !tdMatches[0]) {
          throw new Error("セルが見つかりません");
        }

        const text = tdMatches[0]
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, "")
          .replace(/GB/g, "")
          .trim();

        const num = parseFloat(text);
        if (isNaN(num)) {
          throw new Error(`数値に変換できません: ${text}`);
        }
        return num;
      };

      // kurikoshi (繰越)
      const kurikoshi = extractNumber(tableMatches[0], 0);

      // kihon (基本)
      const kihon = extractNumber(tableMatches[1], 1);

      // yuryou (有料)
      const yuryou = extractNumber(tableMatches[2], 0);

      // used (使用済み)
      const used = extractNumber(tableMatches[3], 0);

      // 計算
      const remaining = kihon + kurikoshi - used;
      const total = kihon + kurikoshi;
      const percentage = total > 0 ? (used / total) * 100 : 0;

      return {
        timestamp: new Date().toISOString(),
        remaining_gb: Math.round(remaining * 100) / 100,
        total_gb: Math.round(total * 100) / 100,
        used_gb: Math.round(used * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
        last_updated: new Date().toLocaleString("ja-JP"),
        kurikoshi_gb: Math.round(kurikoshi * 100) / 100,
        kihon_gb: Math.round(kihon * 100) / 100,
        yuryou_gb: Math.round(yuryou * 100) / 100,
      };
    } catch (error) {
      console.log("⚠️ データ解析エラー:", error);
      return null;
    }
  }

  /**
   * データ取得のメイン関数
   */
  async getData(forceRefresh: boolean = false): Promise<FetchResult> {
    // キャッシュチェック
    if (!forceRefresh) {
      const cached = await this.getCachedData();
      if (cached) {
        return { success: true, data: cached };
      }
    }

    // 新規取得
    console.log("🚀 データ取得開始...");
    const data = await this.fetchFreshData();

    if (data) {
      await this.saveCache(data);
      return { success: true, data };
    }

    return {
      success: false,
      error: "データ取得に失敗しました。認証情報を確認してください。",
    };
  }

  /**
   * 認証情報をセキュアストレージに保存
   */
  static async saveCredentials(mobileId: string, password: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify({ mobileId, password }));
    } catch (error) {
      console.log("⚠️ 認証情報保存エラー:", error);
      throw error;
    }
  }

  /**
   * 認証情報をセキュアストレージから取得
   */
  static async getCredentials(): Promise<{ mobileId: string; password: string } | null> {
    try {
      const stored = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.log("⚠️ 認証情報取得エラー:", error);
      return null;
    }
  }

  /**
   * 認証情報を削除
   */
  static async deleteCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    } catch (error) {
      console.log("⚠️ 認証情報削除エラー:", error);
    }
  }
}
