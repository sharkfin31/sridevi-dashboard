import { useEffect, useState } from 'react';
import { flagsmith, getFeatures } from '../../lib/features';

interface CalendarProps {
  height?: string;
}

export function GoogleCalendar({ height = "700px" }: CalendarProps) {
  const [features, setFeatures] = useState(getFeatures());

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        await flagsmith.init({
          environmentID: import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || '',
        });
        
        const updatedFeatures = getFeatures();
        setFeatures(updatedFeatures);
      } catch (error) {
        console.error('Flagsmith init error:', error);
      }
    };
    
    loadFeatures();
  }, []);

  return (
    <div className="flex gap-4 h-full">

      
      {features.NOTION_CALENDAR && (
        <div className="flex-1 border rounded-lg overflow-hidden">
          <iframe
            src="https://shyam31896.notion.site/ebd/1e2a41d68cb78033a8e0f108de542192?v=1e2a41d68cb780c79bdb000c77a6bfc4"
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
            src="https://calendar.google.com/calendar/embed?src=65f68675c358687018e5fe71f78547186dc7d65aac55edb05441fa6ae80f9230%40group.calendar.google.com&ctz=Asia%2FKolkata"
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