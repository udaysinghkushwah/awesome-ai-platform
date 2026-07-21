import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterPluginDto } from './dto/register-plugin.dto';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: string;
  installCount: number;
}

@Injectable()
export class PluginService {
  private plugins: Map<string, Plugin> = new Map();
  private projectInstallations: Map<string, string[]> = new Map(); // projectId -> pluginIds[]

  constructor() {
    this.seedPlugins();
  }

  private seedPlugins() {
    const defaultPlugins: Plugin[] = [
      {
        id: 'github-sync',
        name: 'GitHub Repository Sync',
        description: 'Auto-sync code branches and index PR details.',
        author: 'Awesome AI Team',
        version: '1.0.0',
        category: 'AI Integration',
        installCount: 142,
      },
      {
        id: 'postgres-tuner',
        name: 'PostgreSQL Query Tuner',
        description: 'Scans query performance logs and flags slow tables.',
        author: 'DBA Master',
        version: '0.9.1',
        category: 'Database',
        installCount: 68,
      },
      {
        id: 'dependency-scanner',
        name: 'Security Dependency Auditor',
        description: 'Scans package files for outdated and vulnerable dependencies.',
        author: 'SecOps Team',
        version: '1.2.0',
        category: 'Security',
        installCount: 195,
      },
    ];

    for (const plugin of defaultPlugins) {
      this.plugins.set(plugin.id, plugin);
    }
  }

  async listPlugins() {
    return Array.from(this.plugins.values());
  }

  async registerPlugin(dto: RegisterPluginDto) {
    const id = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (this.plugins.has(id)) {
      throw new ConflictException('Plugin with this name already registered in marketplace');
    }

    const newPlugin: Plugin = {
      id,
      name: dto.name,
      description: dto.description,
      author: dto.author,
      version: dto.version,
      category: dto.category,
      installCount: 0,
    };

    this.plugins.set(id, newPlugin);
    return newPlugin;
  }

  async installPlugin(projectId: string, pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new NotFoundException('Plugin not found in marketplace');
    }

    const installed = this.projectInstallations.get(projectId) || [];
    if (installed.includes(pluginId)) {
      return { success: true, message: 'Plugin already installed in this project', plugin };
    }

    installed.push(pluginId);
    this.projectInstallations.set(projectId, installed);
    plugin.installCount += 1;

    return { success: true, message: 'Plugin installed successfully', plugin };
  }

  async listProjectPlugins(projectId: string) {
    const installedIds = this.projectInstallations.get(projectId) || [];
    return installedIds.map(id => this.plugins.get(id)).filter(Boolean);
  }
}
