/**
 * Native Widget Bridge
 * React Nativeとネイティブウィジェットをつなぐブリッジ
 */

import { NativeModules, Platform } from "react-native";

const { WidgetBridge } = NativeModules;

export interface NativeWidgetData {
  percentage: number;
  used_gb: number;
  remaining_gb: number;
  total_gb: number;
  last_updated: string;
  timestamp: string;
}

/**
 * ネイティブウィジェットブリッジ
 */
export class NativeWidgetBridge {
  /**
   * ネイティブウィジェットが利用可能かチェック
   */
  static isAvailable(): boolean {
    return WidgetBridge !== undefined && WidgetBridge !== null;
  }

  /**
   * ウィジェットデータを更新
   */
  static async updateWidgetData(data: NativeWidgetData): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.warn("WidgetBridge is not available");
        return false;
      }

      if (Platform.OS === "ios") {
        // iOSの場合: UserDefaults (App Groups) に保存
        await WidgetBridge.updateWidgetData(data);
        // WidgetKitに更新をリクエスト
        await WidgetBridge.reloadAllTimelines();
        return true;
      } else if (Platform.OS === "android") {
        // Androidの場合: SharedPreferencesに保存済み（AsyncStorage経由）
        // ウィジェット更新のブロードキャストを送信
        await WidgetBridge.updateWidget();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to update native widget:", error);
      return false;
    }
  }

  /**
   * ウィジェット更新をスケジュール（バックグラウンドタスク）
   */
  static async scheduleWidgetUpdate(intervalMinutes: number): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.warn("WidgetBridge is not available");
        return false;
      }

      await WidgetBridge.scheduleUpdate(intervalMinutes);
      return true;
    } catch (error) {
      console.error("Failed to schedule widget update:", error);
      return false;
    }
  }

  /**
   * スケジュールされたウィジェット更新をキャンセル
   */
  static async cancelScheduledUpdate(): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.warn("WidgetBridge is not available");
        return false;
      }

      await WidgetBridge.cancelScheduledUpdate();
      return true;
    } catch (error) {
      console.error("Failed to cancel scheduled update:", error);
      return false;
    }
  }

  /**
   * ウィジェットを即座に更新
   */
  static async reloadWidget(): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.warn("WidgetBridge is not available");
        return false;
      }

      if (Platform.OS === "ios") {
        await WidgetBridge.reloadAllTimelines();
      } else if (Platform.OS === "android") {
        await WidgetBridge.updateWidget();
      }

      return true;
    } catch (error) {
      console.error("Failed to reload widget:", error);
      return false;
    }
  }
}
