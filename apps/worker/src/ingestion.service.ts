import * as fs from 'fs';
import * as path from 'path';
import { ElasticsearchService } from '@awesome-ai/database';
import { chunkFile } from './chunker';

export class IngestionService {
  private elasticsearch = new ElasticsearchService();

  async indexDirectory(dirPath: string, projectId: string, organizationId: string) {
    console.log(`🚀 Starting ingestion for directory: ${dirPath}`);
    const files = this.scanDir(dirPath);
    console.log(`Found ${files.length} candidate files for indexing.`);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(dirPath, file);
        const chunks = chunkFile(content);

        console.log(`Indexing ${relativePath} (${chunks.length} chunks)...`);

        for (let idx = 0; idx < chunks.length; idx++) {
          const chunkText = chunks[idx];
          const chunkId = `${projectId}_${relativePath.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}`;
          const embedding = this.generateSimulatedEmbedding(chunkText);

          await this.elasticsearch.indexChunk('code-chunks', {
            id: chunkId,
            filePath: relativePath,
            content: chunkText,
            embedding,
            projectId,
            organizationId,
          });
        }
      } catch (err) {
        console.error(`Failed to index file ${file}:`, err);
      }
    }

    console.log('✅ Ingestion complete!');
  }

  private scanDir(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const base = path.basename(filePath);
        if (['node_modules', '.git', 'dist', 'build', '.next', 'out'].includes(base)) {
          continue;
        }
        this.scanDir(filePath, fileList);
      } else {
        const ext = path.extname(filePath).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h'].includes(ext)) {
          fileList.push(filePath);
        }
      }
    }

    return fileList;
  }

  private generateSimulatedEmbedding(text: string, dimensions = 1536): number[] {
    const embedding: number[] = [];
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    for (let d = 0; d < dimensions; d++) {
      const seed = Math.sin(hash + d) * 10000;
      embedding.push(seed - Math.floor(seed));
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }
}
