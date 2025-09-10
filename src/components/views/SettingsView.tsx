import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { useFeatures } from '@/hooks/useFeatures';
import { useSystemInfo } from '@/hooks/useSystemInfo';
import { SystemStatusCard } from '@/components/settings/SystemStatusCard';

export function SettingsView() {
  const { features } = useFeatures();
  const { systemInfo, responseTime, loading, fetchSystemInfo, clearCache } = useSystemInfo();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SystemStatusCard
          systemInfo={systemInfo}
          responseTime={responseTime}
          loading={loading}
          onRefresh={fetchSystemInfo}
          onClearCache={clearCache}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Feature Flags
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://app.flagsmith.com/project/30186/environment/a65FsRNYHh5jbKgNC5X2rE/features?is_archived=false&tag_strategy=INTERSECTION&page=1&search=&sortBy=name&sortOrder=asc', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Manage
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Combine and sort feature flags */}
              {[
                ...Object.entries(features).map(([feature, enabled]) => ({ feature, enabled, source: 'frontend' })),
                ...(systemInfo?.features ? Object.entries(systemInfo.features).map(([feature, enabled]) => ({ feature, enabled, source: 'backend' })) : [])
              ]
                .sort((a, b) => {
                  // Sort by enabled status first (enabled first), then by name
                  if (a.enabled !== b.enabled) return b.enabled ? 1 : -1;
                  return a.feature.localeCompare(b.feature);
                })
                .map(({ feature, enabled, source }) => (
                  <div key={`${source}-${feature}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{feature.replace('_', ' ')}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature === 'ADMIN_MODE' ? 'Enables administrative features and settings access' :
                         feature === 'DAILY_SYNC' ? 'Automatically syncs data with external services daily at 2 AM' :
                         `${source.charAt(0).toUpperCase() + source.slice(1)} feature configuration`}
                      </p>
                    </div>
                    <Badge variant={enabled ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
                      {enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}