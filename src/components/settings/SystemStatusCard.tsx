import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { RefreshCw, Trash2, Settings, Clock, Zap, HardDrive, Activity, Database } from 'lucide-react';
import { formatUptime, formatBytes, formatDateTime } from '@/lib/utils/formatters';
import { SystemInfo } from '@/hooks/useSystemInfo';

interface SystemStatusCardProps {
  systemInfo: SystemInfo | null;
  responseTime: number | null;
  loading: boolean;
  onRefresh: () => void;
  onClearCache: () => void;
}

export function SystemStatusCard({ 
  systemInfo, 
  responseTime, 
  loading, 
  onRefresh, 
  onClearCache 
}: SystemStatusCardProps) {
  if (!systemInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading system status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Status */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Activity}
            iconColor="#22c55e"
            label="Backend"
            value={systemInfo.status}
          />
          <MetricCard
            icon={Database}
            iconColor={systemInfo.notionKey === 'Present' ? '#22c55e' : '#ef4444'}
            label="Notion API"
            value={systemInfo.notionKey}
            variant={systemInfo.notionKey === 'Present' ? 'default' : 'destructive'}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Zap}
            iconColor="#3b82f6"
            label="Response Time"
            value={responseTime ? `${responseTime}ms` : 'N/A'}
          />
          <MetricCard
            icon={Clock}
            iconColor="#a855f7"
            label="Uptime"
            value={systemInfo.uptime ? formatUptime(systemInfo.uptime) : 'N/A'}
          />
        </div>

        {/* Memory & Cache */}
        {(systemInfo.memoryUsage || systemInfo.cacheSize) && (
          <div className="grid grid-cols-2 gap-3">
            {systemInfo.memoryUsage && (
              <MetricCard
                icon={HardDrive}
                iconColor="#f97316"
                label="Memory"
                value={formatBytes(systemInfo.memoryUsage.used)}
              />
            )}
            {systemInfo.cacheSize && (
              <MetricCard
                icon={Database}
                iconColor="#06b6d4"
                label="Cache Size"
                value={formatBytes(systemInfo.cacheSize)}
              />
            )}
          </div>
        )}

        {/* Last Check */}
        <div className="text-center text-xs text-muted-foreground border-t pt-3">
          Last updated: {formatDateTime(systemInfo.timestamp)}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={onClearCache} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}