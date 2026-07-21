import { Client } from '@elastic/elasticsearch';

export class ElasticsearchService {
  private client: Client;
  private isOnline = false;
  private memoryStore: Map<string, any[]> = new Map(); // indexName -> docs[]

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      maxRetries: 0,
      requestTimeout: 1000,
    });
    // Connection state is checked lazily or assumed based on first ping
  }

  private async checkConnection(): Promise<boolean> {
    if (this.isOnline) return true;
    try {
      await this.client.ping();
      this.isOnline = true;
      return true;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  async createIndexIfNotExists(indexName: string) {
    const online = await this.checkConnection();
    if (!online) {
      if (!this.memoryStore.has(indexName)) {
        this.memoryStore.set(indexName, []);
      }
      return;
    }

    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          mappings: {
            properties: {
              id: { type: 'keyword' },
              filePath: { type: 'text' },
              content: { type: 'text' },
              embedding: {
                type: 'dense_vector',
                dims: 1536,
                index: true,
                similarity: 'cosine',
              },
              projectId: { type: 'keyword' },
              organizationId: { type: 'keyword' },
              createdAt: { type: 'date' },
            },
          },
        });
      }
    } catch (err) {
      console.warn('⚠️ Elasticsearch index check failed. Falling back to in-memory store.', err);
      this.isOnline = false;
      if (!this.memoryStore.has(indexName)) {
        this.memoryStore.set(indexName, []);
      }
    }
  }

  async indexChunk(indexName: string, chunk: {
    id: string;
    filePath: string;
    content: string;
    embedding: number[];
    projectId: string;
    organizationId: string;
  }) {
    await this.createIndexIfNotExists(indexName);
    
    if (!this.isOnline) {
      const docs = this.memoryStore.get(indexName) || [];
      // Remove duplicate ID if existing
      const filtered = docs.filter(d => d.id !== chunk.id);
      filtered.push({
        id: chunk.id,
        filePath: chunk.filePath,
        content: chunk.content,
        embedding: chunk.embedding,
        projectId: chunk.projectId,
        organizationId: chunk.organizationId,
        createdAt: new Date().toISOString(),
      });
      this.memoryStore.set(indexName, filtered);
      return;
    }

    try {
      await this.client.index({
        index: indexName,
        id: chunk.id,
        document: {
          id: chunk.id,
          filePath: chunk.filePath,
          content: chunk.content,
          embedding: chunk.embedding,
          projectId: chunk.projectId,
          organizationId: chunk.organizationId,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.warn('⚠️ Failed to index to Elasticsearch. Falling back to in-memory.', err);
      this.isOnline = false;
      const docs = this.memoryStore.get(indexName) || [];
      const filtered = docs.filter(d => d.id !== chunk.id);
      filtered.push({
        id: chunk.id,
        filePath: chunk.filePath,
        content: chunk.content,
        embedding: chunk.embedding,
        projectId: chunk.projectId,
        organizationId: chunk.organizationId,
        createdAt: new Date().toISOString(),
      });
      this.memoryStore.set(indexName, filtered);
    }
  }

  async searchChunks(
    indexName: string,
    projectId: string,
    queryVector: number[],
    limit = 5,
  ): Promise<{ id: string; filePath: string; content: string; score: number }[]> {
    await this.createIndexIfNotExists(indexName);

    if (!this.isOnline) {
      const docs = this.memoryStore.get(indexName) || [];
      const projectDocs = docs.filter(d => d.projectId === projectId);
      
      const scored = projectDocs.map(doc => {
        const score = this.cosineSimilarity(queryVector, doc.embedding);
        return {
          id: doc.id,
          filePath: doc.filePath,
          content: doc.content,
          score,
        };
      });

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    try {
      const result = await this.client.search<any>({
        index: indexName,
        knn: {
          field: 'embedding',
          query_vector: queryVector,
          k: limit,
          num_candidates: 50,
          filter: {
            term: { projectId },
          },
        },
        _source: ['id', 'filePath', 'content'],
      });

      return result.hits.hits.map((hit: any) => ({
        id: hit._source.id,
        filePath: hit._source.filePath,
        content: hit._source.content,
        score: hit._score || 0,
      }));
    } catch (err) {
      console.warn('⚠️ Elasticsearch search failed. Falling back to in-memory.', err);
      this.isOnline = false;
      // Recurse to return memory results
      return this.searchChunks(indexName, projectId, queryVector, limit);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}
