import { ClaudeEntry, ParsedConversation } from '../types';

export function parseJSONL(content: string): ParsedConversation {
  const lines = content.trim().split('\n').filter(line => line.trim());
  const entries: ClaudeEntry[] = [];
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as ClaudeEntry;
      entries.push(entry);
    } catch (error) {
      console.error('Failed to parse line:', line, error);
    }
  }
  
  const summaries = entries.filter(entry => entry.type === 'summary');
  const messages = entries.filter(entry => entry.type === 'user' || entry.type === 'assistant');
  
  return { entries, summaries, messages };
}

export function serializeJSONL(entries: ClaudeEntry[]): string {
  return entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
}

export function extractMessageContent(message: ClaudeEntry['message']): string {
  if (!message) return '';
  
  if (typeof message.content === 'string') {
    return message.content;
  }
  
  if (Array.isArray(message.content)) {
    return message.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('');
  }
  
  return '';
}