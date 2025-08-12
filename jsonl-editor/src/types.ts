export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text: string }>;
}

export interface ClaudeEntry {
  type: 'summary' | 'user' | 'assistant';
  uuid: string;
  parentUuid?: string | null;
  timestamp: string;
  sessionId?: string;
  cwd?: string;
  version?: string;
  gitBranch?: string;
  isSidechain?: boolean;
  userType?: string;
  message?: ClaudeMessage;
  requestId?: string;
  summary?: string;
  leafUuid?: string;
}

export interface ParsedConversation {
  entries: ClaudeEntry[];
  summaries: ClaudeEntry[];
  messages: ClaudeEntry[];
}