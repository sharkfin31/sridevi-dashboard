export interface CalendarProvider {
  render(height?: string): JSX.Element;
}

export interface CalendarConfig {
  type: 'google' | 'notion';
  url: string;
  title: string;
}