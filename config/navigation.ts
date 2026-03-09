export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
}

export const dashboardNav: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "dashboard-speed-01",
    description: "Your profile performance at a glance",
  },
  {
    label: "Analyze Profile",
    href: "/dashboard/analyze",
    icon: "analytics-01",
    description: "Scan and analyze your freelancer profile",
  },
  {
    label: "Suggestions",
    href: "/dashboard/suggestions",
    icon: "idea-01",
    description: "AI-powered improvement suggestions",
  },
  {
    label: "Rewrite Tool",
    href: "/dashboard/rewrite",
    icon: "quill-write-02",
    description: "AI-assisted profile section rewrites",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: "credit-card-01",
    description: "Manage your subscription and usage",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "settings-01",
    description: "Account and preferences",
  },
];
