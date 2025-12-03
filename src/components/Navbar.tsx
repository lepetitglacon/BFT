import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  Home,
  Menu,
  PiggyBank,
  Settings,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { name: "Accueil", to: "/", icon: Home },
    { name: "Dépenses", to: "/expenses", icon: TrendingUp },
    { name: "Prévisions", to: "/budget", icon: PiggyBank },
    { name: "Graph", to: "/graph", icon: PiggyBank },
    { name: "Paramètres", to: "/settings", icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Follow Your Expenses
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            )
          })}
        </div>

        {/* Desktop User Button */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-border/40 md:hidden">
          <div className="container space-y-1 px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-accent-foreground"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              )
            })}
            <div className="pt-2">
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <User className="h-5 w-5" />
                Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
