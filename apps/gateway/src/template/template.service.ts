import { Injectable, NotFoundException } from '@nestjs/common';

export interface Template {
  id: string;
  name: string;
  description: string;
  language: string;
  files: { path: string; content: string }[];
}

@Injectable()
export class TemplateService {
  private templates: Map<string, Template> = new Map();

  constructor() {
    this.seedTemplates();
  }

  private seedTemplates() {
    this.templates.set('nestjs-crud-api', {
      id: 'nestjs-crud-api',
      name: 'NestJS DB CRUD Service',
      description: 'Standard NestJS service with Prisma CRUD mappings and routes.',
      language: 'typescript',
      files: [
        {
          path: 'src/main.ts',
          content: 'import { NestFactory } from "@nestjs/core";\nimport { AppModule } from "./app.module";\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  await app.listen(3000);\n}\nbootstrap();',
        },
        {
          path: 'src/todo/todo.service.ts',
          content: 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class TodoService {\n  private todos = [];\n  findAll() { return this.todos; }\n  create(title: string) { const t = { id: Date.now().toString(), title }; this.todos.push(t); return t; }\n}',
        },
      ],
    });

    this.templates.set('nextjs-dashboard-ui', {
      id: 'nextjs-dashboard-ui',
      name: 'Next.js Premium Dashboard Layout',
      description: 'Stunning modern tailwind dashboard boilerplate layout.',
      language: 'typescript',
      files: [
        {
          path: 'app/layout.tsx',
          content: 'export default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html>\n      <body className="bg-slate-950 text-slate-100 min-h-screen">{children}</body>\n    </html>\n  );\n}',
        },
        {
          path: 'app/page.tsx',
          content: 'export default function Dashboard() {\n  return (\n    <main className="p-8">\n      <h1 className="text-2xl font-bold tracking-tight">System Metrics</h1>\n    </main>\n  );\n}',
        },
      ],
    });
  }

  async listTemplates() {
    return Array.from(this.templates.values()).map(({ id, name, description, language }) => ({
      id,
      name,
      description,
      language,
    }));
  }

  async getTemplate(id: string) {
    const template = this.templates.get(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }
}
