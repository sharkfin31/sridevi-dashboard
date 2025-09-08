import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

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
    default:
      return 'Bus Transport Dashboard'
  }
}

export function SiteHeader({ children, activeTab = 'dashboard' }: SiteHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-semibold">{getHeaderTitle(activeTab)}</h1>
      {children}
    </header>
  )
}