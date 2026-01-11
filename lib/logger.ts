/**
 * ロギングシステム
 * Logfoxなどのログ監視ツールに対応したログ出力
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: Record<string, any>;
  error?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxLogSize: number; // ファイルの最大サイズ（バイト）
  maxLogCount: number; // 保持するログファイルの最大数
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  enableRemote: false,
  maxLogSize: 1024 * 1024, // 1MB
  maxLogCount: 5,
};

const LOG_CONFIG_KEY = "logger_config";
const LOG_ENTRIES_KEY = "logger_entries";
const LOG_FILE_PREFIX = "log_";

class Logger {
  private config: LoggerConfig = DEFAULT_CONFIG;
  private logBuffer: LogEntry[] = [];
  private isInitialized = false;

  /**
   * ロガーを初期化
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(LOG_CONFIG_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      } else {
        await this.saveConfig(DEFAULT_CONFIG);
      }
      this.isInitialized = true;
      this.info("Logger", "Logger initialized", { platform: Platform.OS });
    } catch (error) {
      console.error("Failed to initialize logger:", error);
    }
  }

  /**
   * ログレベルを取得
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * ログレベルを設定
   */
  async setLevel(level: LogLevel): Promise<void> {
    this.config.level = level;
    await this.saveConfig(this.config);
  }

  /**
   * ロガー設定を取得
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * ロガー設定を保存
   */
  async saveConfig(config: LoggerConfig): Promise<void> {
    try {
      this.config = config;
      await AsyncStorage.setItem(LOG_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save logger config:", error);
    }
  }

  /**
   * ログレベルの比較
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configIndex = levels.indexOf(this.config.level);
    const logIndex = levels.indexOf(level);
    return logIndex >= configIndex;
  }

  /**
   * ログエントリを作成
   */
  private createEntry(level: LogLevel, tag: string, message: string, data?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      tag,
      message,
      data,
    };
  }

  /**
   * ログを出力
   */
  private async outputLog(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // コンソール出力
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // ファイル出力
    if (this.config.enableFile) {
      await this.logToFile(entry);
    }

    // リモート送信
    if (this.config.enableRemote) {
      await this.logToRemote(entry);
    }

    // バッファに保存
    this.logBuffer.push(entry);
    if (this.logBuffer.length > 1000) {
      this.logBuffer.shift();
    }
  }

  /**
   * コンソールにログを出力
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.tag}]`;
    const message = entry.message;
    const data = entry.data ? JSON.stringify(entry.data) : "";

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data);
        break;
    }
  }

  /**
   * ファイルにログを出力
   */
  private async logToFile(entry: LogEntry): Promise<void> {
    try {
      const logLine = `${entry.timestamp} [${entry.level}] [${entry.tag}] ${entry.message}${
        entry.data ? " " + JSON.stringify(entry.data) : ""
      }\n`;

      const key = `${LOG_FILE_PREFIX}${new Date().toISOString().split("T")[0]}`;
      const existing = await AsyncStorage.getItem(key);
      const newContent = (existing || "") + logLine;

      await AsyncStorage.setItem(key, newContent);
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }

  /**
   * リモートにログを送信
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    try {
      // 将来の実装：リモートサーバーにログを送信
      // await fetch("https://logs.example.com/api/logs", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      console.error("Failed to send log to remote:", error);
    }
  }

  /**
   * DEBUGレベルのログ
   */
  async debug(tag: string, message: string, data?: Record<string, any>): Promise<void> {
    const entry = this.createEntry(LogLevel.DEBUG, tag, message, data);
    await this.outputLog(entry);
  }

  /**
   * INFOレベルのログ
   */
  async info(tag: string, message: string, data?: Record<string, any>): Promise<void> {
    const entry = this.createEntry(LogLevel.INFO, tag, message, data);
    await this.outputLog(entry);
  }

  /**
   * WARNレベルのログ
   */
  async warn(tag: string, message: string, data?: Record<string, any>): Promise<void> {
    const entry = this.createEntry(LogLevel.WARN, tag, message, data);
    await this.outputLog(entry);
  }

  /**
   * ERRORレベルのログ
   */
  async error(tag: string, message: string, error?: Error | string, data?: Record<string, any>): Promise<void> {
    const errorMessage = typeof error === "string" ? error : error?.message || "Unknown error";
    const entry = this.createEntry(LogLevel.ERROR, tag, message, {
      ...data,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    await this.outputLog(entry);
  }

  /**
   * ログバッファを取得
   */
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * ログをクリア
   */
  async clearLogs(): Promise<void> {
    try {
      this.logBuffer = [];
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter((key) => key.startsWith(LOG_FILE_PREFIX));
      await AsyncStorage.multiRemove(logKeys);
      this.info("Logger", "Logs cleared");
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }

  /**
   * ログをエクスポート
   */
  async exportLogs(): Promise<string> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter((key) => key.startsWith(LOG_FILE_PREFIX));

      let allLogs = "";
      for (const key of logKeys) {
        const content = await AsyncStorage.getItem(key);
        if (content) {
          allLogs += `\n=== ${key} ===\n${content}`;
        }
      }

      return allLogs || "No logs available";
    } catch (error) {
      console.error("Failed to export logs:", error);
      return "Failed to export logs";
    }
  }

  /**
   * ログ統計を取得
   */
  async getLogStats(): Promise<Record<string, number>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter((key) => key.startsWith(LOG_FILE_PREFIX));

      const stats: Record<string, number> = {
        totalFiles: logKeys.length,
        totalEntries: this.logBuffer.length,
      };

      for (const key of logKeys) {
        const content = await AsyncStorage.getItem(key);
        if (content) {
          stats[key] = content.split("\n").length;
        }
      }

      return stats;
    } catch (error) {
      console.error("Failed to get log stats:", error);
      return {};
    }
  }
}

// シングルトンインスタンス
export const logger = new Logger();
