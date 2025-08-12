import { useState } from 'preact/hooks';
import { ClaudeEntry } from '../types';
import { extractMessageContent } from '../utils/jsonlParser';

interface MessageBubbleProps {
  entry: ClaudeEntry;
  onEdit: (uuid: string, newContent: string) => void;
  onDelete: (uuid: string) => void;
  onCopy: (content: string) => void;
}

export function MessageBubble({ entry, onEdit, onDelete, onCopy }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  const content = extractMessageContent(entry.message);
  const isUser = entry.type === 'user';
  
  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onEdit(entry.uuid, editContent);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };
  
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-header">
        <span className="role">{entry.type}</span>
        <span className="timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</span>
      </div>
      
      {isEditing ? (
        <div className="edit-mode">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent((e.target as HTMLTextAreaElement).value)}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="message-content">
          <pre>{content}</pre>
        </div>
      )}
      
      <div className="message-actions">
        <button onClick={handleEdit} disabled={isEditing}>Edit</button>
        <button onClick={() => onCopy(content)}>Copy</button>
        <button onClick={() => onDelete(entry.uuid)} className="delete">Delete</button>
      </div>
    </div>
  );
}