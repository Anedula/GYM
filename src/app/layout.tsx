import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { Logo } from "@/components/icons/logo";
import Link from "next/link";
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'GymCentral - Gestión Inteligente para tu Gimnasio',
  description: 'Simplifica la administración de tu gimnasio con GymCentral.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen={true} collapsible="icon">
          <Sidebar>
            <SidebarHeader className="p-4">
              <Link href="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
                  GymCentral
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0">
              {/* Example Footer item, can be removed or adapted */}
               <div className="group-data-[collapsible=icon]:hidden text-xs text-muted-foreground p-2">
                © {new Date().getFullYear()} GymCentral
              </div>
               <div className="hidden group-data-[collapsible=icon]:flex justify-center p-2">
                 <Logo />
               </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
