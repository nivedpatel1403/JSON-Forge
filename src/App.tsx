import { useState, useEffect } from 'react';
import {
  FileJson,
  Trash2,
  Zap,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { Editor } from './components/Editor';
import { OutputPreview } from './components/OutputPreview';
import { formatJson } from './lib/json-utils';
import { cn } from './utils/cn';

type Tool = 'format';

export default function App() {
  const [input, setInput] = useState<string>(
    '{\n  "name": "JSON-Forge",\n  "version": "1.0.0",\n  "description": "The ultimate developer JSON utility",\n  "features": [\n    "Formatter",\n    "Minifier",\n    "YAML Conversion",\n    "TypeScript Interface Generation"\n  ],\n  "author": {\n    "name": "Arena Developer",\n    "role": "Expert Assistant"\n  }\n}'
  );
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const activeTool: Tool = 'format';

  useEffect(() => {
    handleProcess(activeTool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleProcess = (_tool: Tool) => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      setError(null);
      const result = formatJson(input);
      setOutput(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
      setOutput('');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    toast.success('Cleared!');
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      toast.success('Pasted from clipboard!');
    } catch {
      toast.error('Failed to paste');
    }
  };

  const loadSample = () => {
    const sample = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        age: 28,
        active: true,
        role: 'admin',
        department: 'Engineering',
      },
      {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@example.com',
        age: 34,
        active: false,
        role: 'editor',
        department: 'Marketing',
      },
      {
        id: 3,
        name: 'Carol Williams',
        email: 'carol@example.com',
        age: 22,
        active: true,
        role: 'viewer',
        department: 'Design',
      },
      {
        id: 4,
        name: 'Dave Brown',
        email: 'dave@example.com',
        age: 41,
        active: true,
        role: 'editor',
        department: 'Engineering',
      },
      {
        id: 5,
        name: 'Eve Davis',
        email: 'eve@example.com',
        age: 30,
        active: true,
        role: 'admin',
        department: 'HR',
      },
    ];
    setInput(JSON.stringify(sample, null, 2));
    toast.success('Sample loaded — try the Table, SQL & Markdown views!');
  };



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Toaster position="bottom-right" />

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FileJson size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              JSON-Forge
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
              Developer Utility
            </p>
          </div>
        </div>

      </header>

      {/* ── Main (Vertical Stack) ────────────────────────────── */}
      <main className="flex-grow flex flex-col p-4 md:p-5 gap-0 overflow-auto">
        {/* Top: Input */}
        <div className="flex flex-col h-[280px] md:h-[300px] shrink-0">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Input</span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                JSON
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadSample}
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              >
                Sample
              </button>
              <button
                onClick={pasteFromClipboard}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Paste from clipboard"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={clearAll}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <Editor
            value={input}
            onChange={setInput}
            placeholder="Paste your JSON here..."
            error={error}
          />
        </div>

        {/* Vertical Divider Arrow */}
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-grow h-px bg-slate-200" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <ChevronDown size={18} />
            </div>
            <div className="flex-grow h-px bg-slate-200" />
          </div>
        </div>

        {/* Bottom: Output Preview */}
        <div className="flex flex-col flex-grow min-h-[320px]">
          <OutputPreview rawOutput={output} jsonInput={input} activeTool={activeTool} />
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-5 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                error ? 'bg-red-400' : 'bg-green-400'
              )}
            />
            {error ? 'Invalid Input' : 'Valid JSON'}
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" />
            Browser-side processing
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>🔒 Your data never leaves your browser</span>
        </div>
      </footer>
    </div>
  );
}
