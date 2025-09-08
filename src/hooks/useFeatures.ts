import { useState, useEffect } from 'react';
import { featureManager } from '../lib/featureManager';

export function useFeatures() {
  const [features, setFeatures] = useState(featureManager.getFeatures());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeFeatures = async () => {
      await featureManager.initialize();
      setFeatures(featureManager.getFeatures());
      setLoading(false);
    };

    const unsubscribe = featureManager.subscribe(setFeatures);
    initializeFeatures();

    return unsubscribe;
  }, []);

  return { features, loading };
}