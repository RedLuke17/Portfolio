export interface TimelineItem {
  year: number;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  tech: string[];
  category: 'hardware' | 'education' | 'maker' | 'gaming' | 'general';
}

export interface SkillGroup {
  category: string;
  skills: { name: string; level: number; icon: string }[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  features: string[];
  imagePrompt?: string;
  imageUrl?: string;
}
