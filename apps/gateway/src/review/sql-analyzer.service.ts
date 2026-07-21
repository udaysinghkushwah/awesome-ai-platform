import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AnalyzeSqlDto } from './dto/analyze-sql.dto';

@Injectable()
export class SqlAnalyzerService {
  constructor(private readonly aiService: AiService) {}

  async analyzeSql(dto: AnalyzeSqlDto) {
    const prompt = `
You are a senior database administrator and Postgres performance tuning expert.
Analyze the following SQL query and schema definitions to identify performance issues, sequential table scans, missing indexes, or join bottlenecks.
You must return your response STRICTLY as a valid JSON object matching the following structure:
{
  "tableScans": ["Sequential scan detected on table 'users' because 'status' column is queried without index."],
  "missingIndexes": ["CREATE INDEX idx_users_status ON users(status);"],
  "rewrittenQuery": "SELECT id, email FROM users WHERE status = 'ACTIVE' LIMIT 10;",
  "explanation": "Adding an index on 'status' avoids a sequential scan of the full users table."
}

Do not add markdown formatting, code block decorators, or explanation text outside the JSON. Return only the JSON object.

SQL Query:
${dto.query}

Optional DB Schema Context:
${dto.schema || 'No schema details provided.'}
`;

    const aiResponseText = await this.aiService.generateContent(prompt);
    let results = {
      tableScans: [],
      missingIndexes: [],
      rewrittenQuery: dto.query,
      explanation: '',
    };

    try {
      const cleanJson = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      results = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Failed to parse Gemini SQL review response:', err);
      results.explanation = aiResponseText;
    }

    return results;
  }
}
