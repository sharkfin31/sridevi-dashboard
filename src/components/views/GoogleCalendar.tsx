interface GoogleCalendarProps {
  height?: string;
}

export function GoogleCalendar({ height = "600px" }: GoogleCalendarProps) {
  return (
    <div className="w-full border rounded-lg overflow-hidden">
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
  );
}