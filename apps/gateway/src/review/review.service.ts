import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AnalyzeCodeDto } from './dto/analyze-code.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly aiService: AiService) {}

  async analyzeCode(dto: AnalyzeCodeDto) {
    const lines = dto.code.split('\n');
    const loc = lines.length;
    const imports = lines.filter(line => line.trim().startsWith('import') || (line.trim().startsWith('const ') && line.includes('require('))).length;
    const functionsCount = (dto.code.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|\w+\([^)]*\)\s*\{/g) || []).length;
    const estimatedComplexity = Math.max(1, (dto.code.match(/if\s*\(|for\s*\(|while\s*\(|catch\s*\(|&&|\|\|/g) || []).length + 1);

    const staticMetrics = {
      linesOfCode: loc,
      importsCount: imports,
      functionsCount,
      cyclomaticComplexity: estimatedComplexity,
    };

    const prompt = `
You are a senior staff software engineer and security auditor.
Analyze the following code snippet and perform a code review.
You must return your response STRICTLY as a valid JSON object matching the following structure:
{
  "vulnerabilities": [{"line": 12, "type": "SQL_INJECTION", "description": "SQL Injection found due to raw string concatenation."}],
  "codeSmells": [{"line": 5, "type": "MAGIC_NUMBER", "description": "Port 3000 is hardcoded."}],
  "performanceIssues": [{"line": 20, "type": "SLOW_LOOP", "description": "Running synchronous tasks inside map function."}],
  "suggestions": "Review parameterized database inputs and move port configuration to an environment file."
}

Do not add markdown formatting, code block decorators, or explanation text outside the JSON. Return only the JSON object.

Language: ${dto.language}
Filename: ${dto.filename}

Code:
\`\`\`
${dto.code}
\`\`\`
`;

    const aiResponseText = await this.aiService.generateContent(prompt);
    let aiMetrics = {
      vulnerabilities: [],
      codeSmells: [],
      performanceIssues: [],
      suggestions: '',
    };

    try {
      const cleanJson = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiMetrics = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Failed to parse Gemini code review response:', err);
      aiMetrics.suggestions = aiResponseText;
    }

    return {
      filename: dto.filename,
      staticMetrics,
      ...aiMetrics,
    };
  }
}
