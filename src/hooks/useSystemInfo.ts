import { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast';
import { authManager } from '@/lib/auth';

export interface SystemInfo {
  status: string;
  timestamp: string;
  notionKey: string;
  features: Record<string, boolean>;
  uptime?: number;
  memoryUsage?: {
    used: number;
    total: number;
  };
  responseTime?: number;
  cacheSize?: number;
}

export function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const fetchSystemInfo = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/test`);
      const endTime = Date.now();
      const data = await response.json();
      setSystemInfo(data);
      setResponseTime(endTime - startTime);
    } catch (error) {
      showToast('Failed to fetch system info', 'error');
      setResponseTime(null);
    }
  };

  const syncNow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/sync-now`, {
        method: 'POST',
        headers: authManager.getAuthHeaders()
      });
      const data = await response.json();
      showToast(data.message, 'success');
    } catch (error) {
      showToast('Sync failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/cache/clear`, {
        method: 'POST',
        headers: authManager.getAuthHeaders()
      });
      const data = await response.json();
      showToast(data.message, 'success');
    } catch (error) {
      showToast('Cache clear failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  return {
    systemInfo,
    responseTime,
    loading,
    fetchSystemInfo,
    syncNow,
    clearCache
  };
}