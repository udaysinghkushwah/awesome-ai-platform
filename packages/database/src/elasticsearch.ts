import { Client } from '@elastic/elasticsearch';

export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    });
  }

  async createIndexIfNotExists(indexName: string) {
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
  }

  async searchChunks(indexName: string, projectId: string, queryVector: number[], limit = 5) {
    await this.createIndexIfNotExists(indexName);
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
  }
}
