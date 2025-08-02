// /src/types/strategy.ts

export interface KOSResult {
  keyword: string;
  kosScore: number;
  explanation: string;
}

export interface TopicCluster {
  mainTopic: string;
  subTopics: string[];
}

export interface RecommendedPost {
  title: string;
  tactic: string;
}

export interface Persona {
  name: string;
  description: string;
  recommendedPosts: RecommendedPost[];
}

export interface StrategyResult {
  kosResults: KOSResult[];
  pillarContent: string;
  topicClusters: TopicCluster[];
  personas: Persona[];
}