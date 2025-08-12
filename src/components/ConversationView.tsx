import { ClaudeEntry } from '../types';
import { MessageBubble } from './MessageBubble';

interface ConversationViewProps {
  messages: ClaudeEntry[];
  onEdit: (uuid: string, newContent: string) => void;
  onDelete: (uuid: string) => void;
  onCopy: (content: string) => void;
}

export function ConversationView({ messages, onEdit, onDelete, onCopy }: ConversationViewProps) {
  return (
    <div class="conversation-view">
      <h2>Conversation</h2>
      <div class="messages-container">
        {messages.map((entry) => (
          <MessageBubble
            key={entry.uuid}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}