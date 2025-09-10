
import { useFeatures } from '@/hooks/useFeatures';

interface CalendarProps {
  height?: string;
}

export function GoogleCalendar({ height = "700px" }: CalendarProps) {
  const { features } = useFeatures();

  return (
    <div className="flex gap-4 h-full">

      
      {features.NOTION_CALENDAR && (
        <div className="flex-1 border rounded-lg overflow-hidden">
          <iframe
            src={import.meta.env.VITE_NOTION_CALENDAR_URL}
            width="100%"
            height={height}
            frameBorder="0"
            className="w-full"
            title="Notion Calendar"
          />
        </div>
      )}

      {features.GOOGLE_CALENDAR && (
        <div className="flex-1 border rounded-lg overflow-hidden">
          <iframe
            src={import.meta.env.VITE_GOOGLE_CALENDAR_URL}
            width="100%"
            height={height}
            frameBorder="0"
            scrolling="no"
            className="w-full"
            title="Google Calendar"
          />
        </div>
      )}
    </div>
  );
}