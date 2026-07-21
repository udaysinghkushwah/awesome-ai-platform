import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService implements OnModuleInit {
  private ai!: GoogleGenerativeAI;
  private hasApiKey = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenerativeAI(apiKey);
      this.hasApiKey = true;
    } else {
      console.warn('⚠️ GEMINI_API_KEY not set. Embedding service will run in fallback simulation mode.');
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (this.hasApiKey) {
      try {
        const model = this.ai.getGenerativeModel({ model: 'text-embedding-004' });
        const response = await model.embedContent(text);
        
        if (response.embedding?.values) {
          return response.embedding.values;
        }
      } catch (err) {
        console.error('Error generating Gemini embedding, falling back to simulation:', err);
      }
    }

    return this.generateSimulatedEmbedding(text, 1536);
  }

  async generateContent(prompt: string): Promise<string> {
    if (this.hasApiKey) {
      try {
        const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const response = await model.generateContent(prompt);
        return response.response.text();
      } catch (err) {
        console.error('Error generating Gemini content:', err);
      }
    }

    if (prompt.toLowerCase().includes('sql') || prompt.toLowerCase().includes('select')) {
      return JSON.stringify({
        vulnerabilities: [
          { line: 5, type: 'SQL_INJECTION', description: 'Found potential SQL injection pattern.' }
        ],
        codeSmells: [
          { line: 3, type: 'MAGIC_NUMBER', description: 'Hardcoded connection port.' }
        ],
        performanceIssues: [
          { line: 8, type: 'SEQUENTIAL_LOOP_QUERIES', description: 'Executing SQL queries inside a loop.' }
        ],
        suggestions: 'Consider parameterized inputs and indexing.'
      });
    }

    return JSON.stringify({
      vulnerabilities: [],
      codeSmells: [
        { line: 2, type: 'MISSING_COMMENTS', description: 'Exported function lacks documentation.' }
      ],
      performanceIssues: [],
      suggestions: 'Add function comments.'
    });
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
