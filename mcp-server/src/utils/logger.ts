/**
 * Simple logger utility for consistent logging across the application
 */
export class Logger {
  /**
   * Log informational messages
   */
  static info(message: string, data?: any): void {
    console.log(`ℹ️  [INFO] ${message}`, data || "");
  }

  /**
   * Log error messages
   */
  static error(message: string, error?: any): void {
    console.error(`❌ [ERROR] ${message}`, error || "");
  }

  /**
   * Log warning messages
   */
  static warn(message: string, data?: any): void {
    console.warn(`⚠️  [WARN] ${message}`, data || "");
  }

  /**
   * Log success messages
   */
  static success(message: string, data?: any): void {
    console.log(`✅ [SUCCESS] ${message}`, data || "");
  }

  /**
   * Log debug messages (only in development)
   */
  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔍 [DEBUG] ${message}`, data || "");
    }
  }
}
