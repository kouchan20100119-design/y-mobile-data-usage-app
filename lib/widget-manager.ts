/**
 * ウィジェット更新マネージャー
 * ネイティブウィジェットのデータ更新を管理
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { YmobileFetcher, MobileDataUsage } from "./ymobile-fetcher";
import { Platform } from "react-native";
import { NativeWidgetBridge } from "./native-widget-bridge";

const WIDGET_DATA_KEY = "widget_data";
const WIDGET_CONFIG_KEY = "widget_config";
const LAST_UPDATE_KEY = "widget_last_update";

export interface WidgetConfig {
  enabled: boolean;
  updateInterval: number; // 分単位
  showMiniWidget: boolean;
  showMainWidget: boolean;
  lastUpdated: string;
}

export interface WidgetData {
  percentage: number;
  used_gb: number;
  remaining_gb: number;
  total_gb: number;
  last_updated: string;
  timestamp: string;
}

const DEFAULT_CONFIG: WidgetConfig = {
  enabled: true,
  updateInterval: 15,
  showMiniWidget: true,
  showMainWidget: true,
  lastUpdated: new Date().toISOString(),
};

export class WidgetManager {
  /**
   * ウィジェット設定を取得
   */
  static async getConfig(): Promise<WidgetConfig> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error("Failed to get widget config:", error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * ウィジェット設定を保存
   */
  static async setConfig(config: WidgetConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(config));
      // ネイティブ側に通知（将来実装）
      await WidgetManager.notifyNativeWidget("config_updated", config);
    } catch (error) {
      console.error("Failed to set widget config:", error);
      throw error;
    }
  }

  /**
   * ウィジェット用のデータを取得
   */
  static async getWidgetData(): Promise<WidgetData | null> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_DATA_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error("Failed to get widget data:", error);
      return null;
    }
  }

  /**
   * ウィジェット用のデータを保存
   */
  static async setWidgetData(data: MobileDataUsage): Promise<void> {
    try {
      const widgetData: WidgetData = {
        percentage: data.percentage,
        used_gb: data.used_gb,
        remaining_gb: data.remaining_gb,
        total_gb: data.total_gb,
        last_updated: data.last_updated,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));
      await AsyncStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());

      // ネイティブウィジェットを更新
      await NativeWidgetBridge.updateWidgetData(widgetData);
    } catch (error) {
      console.error("Failed to set widget data:", error);
      throw error;
    }
  }

  /**
   * ウィジェット更新を実行
   */
  static async updateWidget(): Promise<boolean> {
    try {
      const credentials = await YmobileFetcher.getCredentials();
      if (!credentials) {
        console.warn("No credentials available for widget update");
        return false;
      }

      const fetcher = new YmobileFetcher(credentials.mobileId, credentials.password);
      const result = await fetcher.getData(true); // Force refresh

      if (result.success && result.data) {
        await WidgetManager.setWidgetData(result.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to update widget:", error);
      return false;
    }
  }

  /**
   * ウィジェット更新スケジューラーを開始
   */
  static async startWidgetScheduler(): Promise<void> {
    try {
      const config = await WidgetManager.getConfig();

      if (!config.enabled) {
        console.log("Widget scheduler is disabled");
        return;
      }

      // 初回更新
      await WidgetManager.updateWidget();

      // ネイティブ側でバックグラウンド更新をスケジュール
      const success = await NativeWidgetBridge.scheduleWidgetUpdate(config.updateInterval);
      
      if (success) {
        console.log(`Widget scheduler started with ${config.updateInterval} minute interval`);
      } else {
        console.warn("Failed to start widget scheduler");
      }
    } catch (error) {
      console.error("Failed to start widget scheduler:", error);
    }
  }

  /**
   * ウィジェット更新スケジューラーを停止
   */
  static async stopWidgetScheduler(): Promise<void> {
    try {
      await NativeWidgetBridge.cancelScheduledUpdate();
      console.log("Widget scheduler stopped");
    } catch (error) {
      console.error("Failed to stop widget scheduler:", error);
    }
  }

  /**
   * ウィジェットを即座に更新
   */
  static async reloadWidget(): Promise<boolean> {
    try {
      return await NativeWidgetBridge.reloadWidget();
    } catch (error) {
      console.error("Failed to reload widget:", error);
      return false;
    }
  }

  /**
   * 最後の更新時刻を取得
   */
  static async getLastUpdateTime(): Promise<Date | null> {
    try {
      const stored = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      if (stored) {
        return new Date(stored);
      }
      return null;
    } catch (error) {
      console.error("Failed to get last update time:", error);
      return null;
    }
  }

  /**
   * ウィジェット設定をリセット
   */
  static async resetConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WIDGET_CONFIG_KEY);
      await AsyncStorage.removeItem(WIDGET_DATA_KEY);
      await AsyncStorage.removeItem(LAST_UPDATE_KEY);
      console.log("Widget configuration reset");
    } catch (error) {
      console.error("Failed to reset widget config:", error);
      throw error;
    }
  }
}
