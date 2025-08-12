import { useState, useEffect } from 'preact/hooks';
import type { ParsedConversation } from './types';
import { parseJSONL, serializeJSONL } from './utils/jsonlParser';
import { ConversationView } from './components/ConversationView';
import './app.css';

export function App() {
  const [conversation, setConversation] = useState<ParsedConversation | null>(null);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isServerMode, setIsServerMode] = useState(false);
  const [serverPort, setServerPort] = useState(3001);
  
  const findServerPort = async () => {
    // 複数のポートを試す（3001から3010まで）
    for (let port = 3001; port <= 3010; port++) {
      try {
        const response = await fetch(`http://localhost:${port}/api/config`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          console.log(`[Client] Found server on port ${port}`);
          return port;
        }
      } catch (error) {
        // このポートでは応答なし、次を試す
        console.log(`[Client] Port ${port} not available:`, (error as Error).message);
      }
    }
    return null;
  };

  const checkServerMode = async () => {
    console.log('[Client] Checking for server mode...');
    
    const serverPort = await findServerPort();
    
    if (!serverPort) {
      console.log('[Client] No server found on ports 3001-3010, using client-only mode');
      return;
    }
    
    console.log(`[Client] Server detected on port ${serverPort}`);
    
    try {
      const response = await fetch(`http://localhost:${serverPort}/api/config`);
      const config = await response.json();
      if (!config.error) {
        console.log('[Client] Server mode detected, switching to file system operations');
        setIsServerMode(true);
        setServerPort(serverPort);
        loadAvailableFiles(serverPort);
      } else {
        console.log('[Client] Server responded but no file path configured:', config.error);
      }
    } catch (error) {
      console.log('[Client] Failed to connect to server:', error);
    }
  };
  
  const loadAvailableFiles = async (port = serverPort) => {
    console.log('[Client] Loading available files from server...');
    try {
      const response = await fetch(`http://localhost:${port}/api/files`);
      const data = await response.json();
      setAvailableFiles(data.files || []);
      console.log(`[Client] Found ${data.files?.length || 0} files`);
      if (data.files && data.files.length > 0) {
        console.log(`[Client] Auto-loading first file: ${data.files[0].name}`);
        loadFileFromServer(data.files[0].name, port);
      }
    } catch (error) {
      console.error('[Client] Failed to load files:', error);
    }
  };
  
  const loadFileFromServer = async (filename: string, port = serverPort) => {
    console.log(`[Client] Loading file from server: ${filename}`);
    try {
      const response = await fetch(`http://localhost:${port}/api/files/${filename}`);
      const data = await response.json();
      const parsed = parseJSONL(data.content);
      console.log(`[Client] File loaded successfully: ${parsed.messages.length} messages found`);
      setConversation(parsed);
      setCurrentFile(filename);
    } catch (error) {
      console.error(`[Client] Failed to load file ${filename}:`, error);
    }
  };
  
  const saveFileToServer = async () => {
    if (!conversation || !currentFile) {
      console.warn('[Client] Cannot save: no conversation or current file');
      return;
    }
    
    console.log(`[Client] Saving file to server: ${currentFile}`);
    try {
      const content = serializeJSONL(conversation.entries);
      console.log(`[Client] Sending ${content.length} characters to server`);
      
      const response = await fetch(`http://localhost:${serverPort}/api/files/${currentFile}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Client] Server response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        console.log('[Client] File saved successfully');
        alert('File saved successfully!');
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error(`[Client] Failed to save file ${currentFile}:`, error);
      alert('Failed to save file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const loadSampleFile = async () => {
    try {
      const response = await fetch('/samples/sample.jsonl');
      const content = await response.text();
      const parsed = parseJSONL(content);
      setConversation(parsed);
      setCurrentFile(null);
    } catch (error) {
      console.error('Failed to load sample file:', error);
    }
  };
  
  useEffect(() => {
    // サーバーが起動するまで少し待つ
    setTimeout(() => {
      checkServerMode();
    }, 1000);
    
    // 追加で5秒後にも再チェック（デバッグ用）
    setTimeout(() => {
      console.log('[Client] Rechecking server mode...');
      checkServerMode();
    }, 5000);
  }, []);
  
  const handleFileLoad = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseJSONL(content);
      setConversation(parsed);
      setCurrentFile(null);
    };
    reader.readAsText(file);
  };
  
  const handleEdit = (uuid: string, newContent: string) => {
    if (!conversation) return;
    
    const updatedEntries = conversation.entries.map(entry => {
      if (entry.uuid === uuid && entry.message) {
        return {
          ...entry,
          message: {
            ...entry.message,
            content: newContent
          }
        };
      }
      return entry;
    });
    
    setConversation({
      ...conversation,
      entries: updatedEntries,
      messages: updatedEntries.filter(e => e.type === 'user' || e.type === 'assistant')
    });
  };
  
  const handleDelete = (uuid: string) => {
    if (!conversation) return;
    
    const updatedEntries = conversation.entries.filter(entry => entry.uuid !== uuid);
    setConversation({
      ...conversation,
      entries: updatedEntries,
      messages: updatedEntries.filter(e => e.type === 'user' || e.type === 'assistant')
    });
  };
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };
  
  const handleExport = () => {
    if (!conversation) return;
    
    const jsonlContent = serializeJSONL(conversation.entries);
    const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited-conversation.jsonl';
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  return (
    <div class="app">
      <header>
        <h1>Claude Code JSONL Editor</h1>
        <div class="controls">
          <span class="debug-info">
            {isServerMode ? `Server: ${serverPort}` : 'Client-only'}
          </span>
          {!isServerMode && (
            <button onClick={checkServerMode} class="reconnect-btn">Reconnect</button>
          )}
          {isServerMode ? (
            <>
              {availableFiles.length > 0 && (
                <select 
                  onChange={(e) => loadFileFromServer((e.target as HTMLSelectElement).value)}
                  value={currentFile || ''}
                >
                  {availableFiles.map(file => (
                    <option key={file.name} value={file.name}>{file.name}</option>
                  ))}
                </select>
              )}
              {conversation && currentFile && (
                <button onClick={saveFileToServer} class="save-btn">Save to File</button>
              )}
            </>
          ) : (
            <>
              <button onClick={loadSampleFile}>Load Sample</button>
              <input
                type="file"
                accept=".jsonl"
                onChange={handleFileLoad}
              />
            </>
          )}
          {conversation && (
            <button onClick={handleExport}>Export</button>
          )}
        </div>
      </header>
      
      {conversation ? (
        <ConversationView
          messages={conversation.messages}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      ) : (
        <div class="empty-state">
          <p>Load a JSONL file to start editing</p>
          <button onClick={loadSampleFile} class="sample-button">
            Try with Sample Data
          </button>
        </div>
      )}
    </div>
  );
}
