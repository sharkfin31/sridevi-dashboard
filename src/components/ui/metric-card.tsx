import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string | ReactNode;
  variant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

export function MetricCard({ icon: Icon, iconColor, label, value, variant = 'default' }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center p-3 border rounded-lg">
      <Icon className="h-5 w-5 mb-1" style={iconColor ? { color: iconColor } : undefined} />
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      {typeof value === 'string' ? (
        <Badge variant={variant} className="text-xs px-2 py-0">
          {value}
        </Badge>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  );
}