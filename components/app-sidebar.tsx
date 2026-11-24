"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  Folder01Icon,
  File01Icon,
  Menu01Icon,
  Database01Icon,
  Settings05Icon,
  CommandIcon,
} from "@hugeicons/core-free-icons"

const navMain = [
  { title: "Dashboard", url: "/builder/dashboard", icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} /> },
  { title: "Projects", url: "/builder/projects", icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} /> },
  { title: "Blog", url: "/builder/blog", icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} /> },
  { title: "Categories", url: "/builder/categories", icon: <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} /> },
  { title: "Share queue", url: "/builder/queue", icon: <HugeiconsIcon icon={Database01Icon} strokeWidth={2} /> },
  { title: "Site settings", url: "/builder/settings", icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} /> },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string }
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/builder/dashboard" />}
            >
              <HugeiconsIcon icon={CommandIcon} strokeWidth={2} className="size-5!" />
              <span className="text-base font-semibold">Portfolio Builder</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
