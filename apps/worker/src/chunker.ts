export function chunkFile(content: string, maxWords = 300, overlapWords = 30): string[] {
  const words = content.split(/\s+/);
  const chunks: string[] = [];
  
  if (words.length <= maxWords) {
    return [content];
  }

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(' '));
    i += maxWords - overlapWords;
  }

  return chunks;
}
