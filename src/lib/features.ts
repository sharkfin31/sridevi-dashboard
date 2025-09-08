import flagsmith from 'flagsmith';

// Initialize Flagsmith
flagsmith.init({
  environmentID: import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || '',
});

// Feature flags utility
export const isFeatureEnabled = (feature: string): boolean => {
  return flagsmith.hasFeature(feature);
};

// Reactive features object
export const getFeatures = () => ({
  GOOGLE_CALENDAR: isFeatureEnabled('google_calendar'),
  NOTION_CALENDAR: isFeatureEnabled('notion_calendar'),
  ADMIN_MODE: isFeatureEnabled('admin_mode'),
});

// Default features (fallback)
export const FEATURES = getFeatures();

export { flagsmith };