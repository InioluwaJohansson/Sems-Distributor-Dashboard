"use client"

import { useState, useEffect, useRef } from "react"
import { LogOut, User, Menu, X, DollarSign, User2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Activity,
  BarChart3,
  CreditCard,
  Home,
  LayoutDashboard,
  ParkingMeterIcon as Meter,
  Users,
  UserCog,
} from "lucide-react"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleLogout = () => {
    router.push("/login")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Administrators",
      icon: UserCog,
      href: "/dashboard/administrators",
    },
    {
      title: "Customers",
      icon: Users,
      href: "/dashboard/customers",
    },
    {
      title: "Meters",
      icon: Meter,
      href: "/dashboard/meters",
    },
    {
      title: "Transactions",
      icon: CreditCard,
      href: "/dashboard/transactions",
    },
    {
      title: "Prices",
      icon: DollarSign,
      href: "/dashboard/prices",
    },
    {
      title: "Energy Usage",
      icon: Activity,
      href: "/dashboard/energy-usage",
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
    },
  ]

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center gap-4 bg-background px-6 header">
      <div className="flex items-center gap-2">
        <Button ref={menuButtonRef} variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4" />
          </div>
          <div className="hidden md:flex md:flex-col md:gap-0.5 md:leading-none">
            <span className="font-semibold">SEMS</span>
            <span className="text-xs">Smart Electric Metering System</span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu Dropdown */}
      {isMenuOpen && (
        <div ref={menuRef} className="absolute top-16 left-0 w-64 bg-background shadow-lg rounded-br-md z-50">
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 hover:bg-accent ${
                  pathname === item.href ? "bg-accent/50 font-medium" : ""
                }`}
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex-1">{/* Search form removed */}</div>
      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/profile" className="flex items-center w-full">
                <User2 className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
