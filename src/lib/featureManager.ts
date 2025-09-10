import flagsmith from 'flagsmith';

class FeatureManager {
  private static instance: FeatureManager;
  private features: Record<string, boolean> = {};
  private initialized = false;
  private listeners: Array<(features: Record<string, boolean>) => void> = [];

  private constructor() {}

  static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await flagsmith.init({
        environmentID: import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || '',
      });
      
      this.updateFeatures();
      this.initialized = true;
    } catch (error) {
      console.error('Flagsmith init error:', error);
    }
  }

  private updateFeatures(): void {
    this.features = {
      GOOGLE_CALENDAR: flagsmith.hasFeature('google_calendar'),
      NOTION_CALENDAR: flagsmith.hasFeature('notion_calendar'),
      ADMIN_MODE: flagsmith.hasFeature('admin_mode'),
      PASS_CHANGE_ENABLED: flagsmith.hasFeature('pass_change_enabled'),
    };
    
    this.notifyListeners();
  }

  getFeatures(): Record<string, boolean> {
    return { ...this.features };
  }

  isFeatureEnabled(feature: string): boolean {
    return this.features[feature] || false;
  }

  subscribe(callback: (features: Record<string, boolean>) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getFeatures()));
  }
}

export const featureManager = FeatureManager.getInstance();