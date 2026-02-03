"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Home,
  Package,
  Users,
  Warehouse,
  FileText,
  Bot,
  User,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AiAssistant } from "./ai-assistant";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/products", icon: Package, label: "Products" },
  { href: "/dashboard/pricing", icon: BarChart3, label: "Pricing" },
  { href: "/dashboard/supply-chain", icon: Warehouse, label: "Supply Chain" },
  { href: "/dashboard/competitors", icon: Users, label: "Competitors" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function MainSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <div className="text-primary-foreground">
              <Logo className="text-white"/>
            </div>
            <SidebarTrigger className="text-sidebar-foreground hover:text-white" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="flex-grow"></div>
           <div className="p-4 m-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 mb-2">
                    <Bot size={20}/>
                    <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <p className="text-sm mb-4">Get help with pricing strategies, supply chain and more.</p>
                <Button variant="secondary" size="sm" className="w-full bg-primary text-primary-foreground" onClick={() => setIsAssistantOpen(true)}>Ask AI</Button>
            </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-8 w-8">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} />}
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">Admin User</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">admin@equitable.edge</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
        <AiAssistant open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
