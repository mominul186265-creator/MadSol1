/**
 * MadSol Real-Time Cloud Synchronization & Persistent Document Vault
 * Guarantees that even if the Android app is uninstalled and reinstalled,
 * all documents, students, attendance, exams, fees, and institution data are preserved
 * and restored automatically from the server cloud storage.
 */

import { safeStorage } from './safeStorage';

export interface CloudSyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  hasCloudBackup: boolean;
  totalKeys: number;
  lastError: string | null;
}

class CloudSyncManager {
  private static instance: CloudSyncManager;
  private isSyncing = false;
  private lastSyncedAt: string | null = null;
  private debounceTimer: any = null;
  private listeners: Array<(status: CloudSyncStatus) => void> = [];

  private constructor() {
    this.lastSyncedAt = safeStorage.getItem('madsol_last_cloud_sync_time');
  }

  public static getInstance(): CloudSyncManager {
    if (!CloudSyncManager.instance) {
      CloudSyncManager.instance = new CloudSyncManager();
    }
    return CloudSyncManager.instance;
  }

  public subscribe(cb: (status: CloudSyncStatus) => void): () => void {
    this.listeners.push(cb);
    cb(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(lastError: string | null = null) {
    const status = this.getStatus(lastError);
    this.listeners.forEach((l) => {
      try {
        l(status);
      } catch (err) {
        console.warn('Listener error', err);
      }
    });
  }

  public getStatus(lastError: string | null = null): CloudSyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
      hasCloudBackup: !!this.lastSyncedAt,
      totalKeys: this.getAllStoredKeys().length,
      lastError,
    };
  }

  /**
   * Returns all MadSol keys stored in localStorage
   */
  public getAllStoredKeys(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const keys: string[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('madsol_') || k.includes('madsol'))) {
          keys.push(k);
        }
      }
    } catch {
      // Fallback
    }
    return keys;
  }

  /**
   * Bundles all MadSol localStorage keys into a complete snapshot object
   */
  public createSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    const keys = this.getAllStoredKeys();
    keys.forEach((k) => {
      try {
        const val = safeStorage.getItem(k);
        if (val !== null) {
          snapshot[k] = val;
        }
      } catch {
        // Skip inaccessible key
      }
    });
    return snapshot;
  }

  /**
   * Pushes full database & document snapshot to the server cloud
   */
  public async pushBackup(userEmail?: string, institutionId?: string): Promise<{ success: boolean; message?: string }> {
    if (this.isSyncing) return { success: true };
    this.isSyncing = true;
    this.notify();

    try {
      const snapshot = this.createSnapshot();
      const keys = Object.keys(snapshot);

      // Do not overwrite existing cloud backup with an empty snapshot
      if (keys.length === 0) {
        this.isSyncing = false;
        this.notify();
        return { success: false, message: 'সংরক্ষণের জন্য কোনো ডেটা পাওয়া যায়নি।' };
      }

      const email = userEmail || safeStorage.getItem('madsol_remembered_identifier') || 'mominulislam186265@gmail.com';
      const instId = institutionId || 'inst-banir-khamar';

      const res = await fetch('/api/sync/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          institutionId: instId,
          snapshot,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        this.lastSyncedAt = data.timestamp || new Date().toISOString();
        safeStorage.setItem('madsol_last_cloud_sync_time', this.lastSyncedAt);
        this.isSyncing = false;
        this.notify();
        return { success: true, message: 'ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে।' };
      } else {
        throw new Error(data.message || 'Sync failed');
      }
    } catch (err: any) {
      this.isSyncing = false;
      this.notify(err?.message || 'Sync error');
      console.warn('[CloudSync] pushBackup failed:', err);
      return { success: false, message: err?.message || 'ক্লাউডে সেভ করতে সমস্যা হয়েছে।' };
    }
  }

  /**
   * Pulls latest cloud backup and restores all keys into localStorage
   */
  public async pullAndRestore(userEmail?: string, institutionId?: string): Promise<{
    success: boolean;
    restored: boolean;
    keyCount?: number;
    message?: string;
  }> {
    this.isSyncing = true;
    this.notify();

    try {
      const email = userEmail || safeStorage.getItem('madsol_remembered_identifier') || 'mominulislam186265@gmail.com';
      const instId = institutionId || 'inst-banir-khamar';

      const url = `/api/sync/pull?userEmail=${encodeURIComponent(email)}&institutionId=${encodeURIComponent(instId)}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.exists || !data.snapshot) {
        this.isSyncing = false;
        this.notify();
        return {
          success: true,
          restored: false,
          message: 'সার্ভারে কোনো সংরক্ষিত ব্যাকআপ পাওয়া যায়নি।',
        };
      }

      // Restore snapshot into localStorage & safeStorage
      const snapshot: Record<string, string> = data.snapshot;
      let count = 0;
      Object.keys(snapshot).forEach((key) => {
        try {
          safeStorage.setItem(key, snapshot[key]);
          count++;
        } catch (e) {
          console.warn(`Failed restoring key ${key}:`, e);
        }
      });

      this.lastSyncedAt = data.timestamp || new Date().toISOString();
      safeStorage.setItem('madsol_last_cloud_sync_time', this.lastSyncedAt);
      this.isSyncing = false;
      this.notify();

      // Trigger custom event so all contexts can refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('madsol_data_restored', { detail: { keyCount: count } }));
      }

      return {
        success: true,
        restored: true,
        keyCount: count,
        message: `${count}টি ডেটা আইটেম ও সকল ডকুমেন্ট সফলভাবে ক্লাউড থেকে পুনরুদ্ধার করা হয়েছে।`,
      };
    } catch (err: any) {
      this.isSyncing = false;
      this.notify(err?.message || 'Restore error');
      console.warn('[CloudSync] pullAndRestore failed:', err);
      return { success: false, restored: false, message: err?.message || 'ক্লাউড থেকে ডেটা আনতে ব্যর্থ হয়েছে।' };
    }
  }

  /**
   * Schedules debounced cloud save
   */
  public triggerDebouncedSave(delayMs = 4000): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.pushBackup().catch(() => {});
    }, delayMs);
  }

  /**
   * Downloads a local copy of madsol-backup.json onto the user's device
   */
  public exportBackupJson(): void {
    try {
      const snapshot = this.createSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madsol-madrasa-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  /**
   * Imports a backup JSON file from the user's device and updates cloud
   */
  public async importBackupJson(file: File): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid backup file format');
      }

      let count = 0;
      Object.keys(parsed).forEach((k) => {
        if (k.startsWith('madsol_') || k.includes('madsol')) {
          safeStorage.setItem(k, typeof parsed[k] === 'string' ? parsed[k] : JSON.stringify(parsed[k]));
          count++;
        }
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('madsol_data_restored', { detail: { keyCount: count } }));
      }

      // Immediately push restored backup to server cloud
      await this.pushBackup();

      return {
        success: true,
        count,
        message: `${count}টি ডেটা সফলভাবে রিস্টোর ও ক্লাউডে সিঙ্ক করা হয়েছে।`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: err?.message || 'ফাইলটি সঠিক ব্যাকআপ ফাইল নয়।',
      };
    }
  }
}

export const cloudSync = CloudSyncManager.getInstance();
