/**
 * Generic storage service using localStorage
 * Can be extended in the future to support other strategies
 */

class StorageService {
  /**
   * Saves a value to localStorage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  /**
   * Gets a value from localStorage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Removes a value from localStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      throw error;
    }
  }

  /**
   * Checks if a value exists in localStorage
   */
  async hasItem(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }

  /**
   * Clears all localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Gets all keys from localStorage
   */
  getAllKeys(): string[] {
    return Object.keys(localStorage);
  }
}

export const storageService = new StorageService();
