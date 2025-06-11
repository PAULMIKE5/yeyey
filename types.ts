
export interface NavItem {
  path: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  activeIcon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

// You can expand this with more user-specific details if needed
export interface UserProfile {
  username: string;
  totalEarnings: number;
  referralCode: string;
  joinDate?: string; // Optional: ISO date string
}
