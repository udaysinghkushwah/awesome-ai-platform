export interface FileChunk {
  id: string;
  filePath: string;
  content: string;
  embedding: number[];
  tokens: number;
  projectId: string;
  organizationId: string;
  createdAt: string;
}

export interface SearchQueryDto {
  query: string;
  limit?: number;
}

export interface SearchResult {
  id: string;
  filePath: string;
  content: string;
  score: number;
}
