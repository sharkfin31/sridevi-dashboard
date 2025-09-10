import { Copyright } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-4 text-center text-xs text-muted-foreground bg-background flex items-center justify-center gap-2">
      <Copyright className="inline-block h-4 w-4" />
      <span> {year} Sri Devi Bus Transports. All Rights Reserved</span>
    </footer>
  );
}
