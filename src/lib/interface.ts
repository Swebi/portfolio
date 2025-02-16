interface Personal {
  name: string;
  description: string;
  avatar: string;
  initials: string;
  skills: string[];
  githubid: string;
  linkedin: string;
}

interface PortfolioItem {
  id: string;
  category: string;
  active: boolean;
  title: string;
  subtitle: string;
  url: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  source: string;
  location: string;
}
export interface PageProps {
  personal: Personal;
  portfolio: PortfolioItem[];
}
