interface SiteHeaderProps {
  children?: React.ReactNode
  activeTab?: string
}

const getHeaderTitle = (activeTab: string) => {
  switch (activeTab) {
    case 'dashboard':
      return 'Dashboard'
    case 'calendar':
      return 'Scheduler'
    case 'bookings':
      return 'Booking Management'
    case 'maintenance':
      return 'Maintenance Tracking'
    case 'analytics':
      return 'Analytics & Reports'
    case 'settings':
      return 'Settings'
    case 'account':
      return 'Account Management'
    default:
      return 'Bus Transport Dashboard'
  }
}

export function SiteHeader({ children, activeTab = 'dashboard' }: SiteHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <h1 className="text-lg font-semibold md:ml-8">{getHeaderTitle(activeTab)}</h1>
      {children}
    </header>
  )
}