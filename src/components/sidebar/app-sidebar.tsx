import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react";
import { NavUser, User } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavItem, NavMain } from "./nav-main";
import { NavProjects, Project } from "./nav-projects";
import { Team, TeamSwitcher } from "./team-switcher";
import type { Route } from "next";

export const data: AppSidebarProps = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navItems: [
    {
      title: "Media",
      url: "/admin/media" as Route,
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Canva Designs",
          url: "/admin/media/images" as Route,
        },
        {
          title: "Diagrams",
          url: "/admin/media/diagrams" as Route,
        },
        {
          title: "Uploaded Media",
          url: "/admin/media/uploaded-media" as Route,
        },
      ],
    },
    {
      title: "Blog",
      url: "/admin/posts" as Route,
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Posts",
          url: "/admin/post" as Route,
        },
      ],
    },
    {
      title: "Messages",
      url: "/admin/messages" as Route,
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Contact Messages",
          url: "/admin/messages" as Route,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ],
};

export interface AppSidebarProps {
  navItems: NavItem[];
  user: User;
  teams: Team[];
  projects: Project[];
}

export function AppSidebar({
  navItems,
  user,
  teams,
  projects,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
