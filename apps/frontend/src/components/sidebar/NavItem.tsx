import { type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItemProps {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
  collapsed?: boolean
}

export default function NavItem({ to, icon: Icon, label, end, collapsed }: NavItemProps) {
  if (collapsed) {
    return (
      <NavLink
        to={to}
        end={end}
        title={label}
        className={({ isActive }) =>
          cn(
            'flex items-center justify-center py-2.5 rounded-lg text-sm transition-colors duration-200',
            'border-l-2',
            isActive
              ? 'border-l-accent bg-accent/20 text-white font-medium'
              : 'border-l-transparent text-white/70 hover:text-white hover:bg-white/5'
          )
        }
      >
        <Icon className="size-5 shrink-0" />
      </NavLink>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm transition-colors duration-200',
          'border-l-2',
          isActive
            ? 'border-l-accent bg-accent/20 text-white font-medium'
            : 'border-l-transparent text-white/70 hover:text-white hover:bg-white/5'
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}
