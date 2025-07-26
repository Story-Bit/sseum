export interface BlogPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type RevisionLevel = 'rare' | 'unique' | 'mythical';