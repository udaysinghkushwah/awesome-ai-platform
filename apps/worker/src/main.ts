import { IngestionService } from './ingestion.service';

async function main() {
  const args = process.argv.slice(2);
  const dirIndex = args.indexOf('--dir');
  const projectIndex = args.indexOf('--project');
  const orgIndex = args.indexOf('--org');

  if (dirIndex === -1 || projectIndex === -1 || orgIndex === -1) {
    console.error('Usage: node dist/main.js --dir <path> --project <id> --org <id>');
    process.exit(1);
  }

  const dir = args[dirIndex + 1];
  const project = args[projectIndex + 1];
  const org = args[orgIndex + 1];

  const service = new IngestionService();
  await service.indexDirectory(dir, project, org);
}

main().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
