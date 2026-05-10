import { useState, useMemo } from 'react';
import { cn } from '../utils/cn';
import { flattenJson, jsonToSql, jsonToMarkdownTable, isValidJson } from '../lib/json-utils';
import { Table2, Database, FileText, Code2, Copy, Check, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

type ViewMode = 'table' | 'sql' | 'markdown' | 'raw';

interface OutputPreviewProps {
  rawOutput: string;
  jsonInput: string;
  activeTool: string;
}

export const OutputPreview: React.FC<OutputPreviewProps> = ({ rawOutput, jsonInput, activeTool }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [copied, setCopied] = useState(false);

  const canParseJson = useMemo(() => isValidJson(jsonInput), [jsonInput]);

  const tableData = useMemo(() => {
    if (!canParseJson) return null;
    try {
      return flattenJson(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput, canParseJson]);

  const sqlOutput = useMemo(() => {
    if (!canParseJson) return '';
    try {
      return jsonToSql(jsonInput);
    } catch {
      return '';
    }
  }, [jsonInput, canParseJson]);

  const markdownOutput = useMemo(() => {
    if (!canParseJson) return '';
    try {
      return jsonToMarkdownTable(jsonInput);
    } catch {
      return '';
    }
  }, [jsonInput, canParseJson]);

  const currentText = viewMode === 'sql' ? sqlOutput : viewMode === 'markdown' ? markdownOutput : rawOutput;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadOutput = () => {
    if (!currentText) return;
    const extensions: Record<ViewMode, string> = {
      table: 'txt',
      sql: 'sql',
      markdown: 'md',
      raw: activeTool === 'yaml' ? 'yaml' : activeTool === 'typescript' ? 'ts' : activeTool === 'go' ? 'go' : 'json'
    };
    const blob = new Blob([currentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forge-output.${extensions[viewMode]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

  const viewModes: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'table', label: 'Table', icon: <Table2 size={14} /> },
    { key: 'sql', label: 'SQL', icon: <Database size={14} /> },
    { key: 'markdown', label: 'Markdown', icon: <FileText size={14} /> },
    { key: 'raw', label: 'Raw', icon: <Code2 size={14} /> },
  ];

  return (
    <div className="flex flex-col flex-grow min-h-0">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Output</span>
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all',
                  viewMode === mode.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={downloadOutput}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            onClick={copyToClipboard}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all',
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Output Body */}
      <div className="flex-grow rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {viewMode === 'table' && tableData ? (
          <TableView columns={tableData.columns} rows={tableData.rows} />
        ) : viewMode === 'sql' ? (
          <CodeBlock value={sqlOutput} language="sql" />
        ) : viewMode === 'markdown' ? (
          <CodeBlock value={markdownOutput} language="markdown" />
        ) : (
          <CodeBlock value={rawOutput} language="json" />
        )}
      </div>
    </div>
  );
};

// ─── Table View ────────────────────────────────────────────────────────────────

interface TableViewProps {
  columns: string[];
  rows: Record<string, string>[];
}

const TableView: React.FC<TableViewProps> = ({ columns, rows }) => {
  if (columns.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-slate-400 text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-auto">
      <table className="w-full border-collapse text-sm font-mono">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 text-left border-r border-indigo-500 w-10">
              #
            </th>
            {columns.map((col, i) => (
              <th
                key={col}
                className={cn(
                  'bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 text-left',
                  i < columns.length - 1 && 'border-r border-indigo-500'
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                'border-b border-slate-200 transition-colors hover:bg-indigo-50/40',
                rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
              )}
            >
              <td className="px-4 py-2.5 text-slate-400 text-xs border-r border-slate-200 font-semibold">
                {rowIdx + 1}
              </td>
              {columns.map((col, i) => (
                <td
                  key={col}
                  className={cn(
                    'px-4 py-2.5 text-slate-700 max-w-[300px] truncate',
                    i < columns.length - 1 && 'border-r border-slate-200'
                  )}
                  title={row[col] ?? ''}
                >
                  <CellValue value={row[col] ?? ''} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
        <span>{rows.length} row{rows.length !== 1 ? 's' : ''} × {columns.length} column{columns.length !== 1 ? 's' : ''}</span>
        <span className="text-slate-400">Scroll to view more →</span>
      </div>
    </div>
  );
};

const CellValue: React.FC<{ value: string }> = ({ value }) => {
  if (value === 'null') {
    return <span className="text-slate-400 italic text-xs bg-slate-100 px-1.5 py-0.5 rounded">NULL</span>;
  }
  if (value === 'true') {
    return <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-xs">TRUE</span>;
  }
  if (value === 'false') {
    return <span className="text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded text-xs">FALSE</span>;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return <span className="text-amber-600 font-semibold">{value}</span>;
  }
  return <span>{value}</span>;
};

// ─── Code Block ────────────────────────────────────────────────────────────────

interface CodeBlockProps {
  value: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ value, language }) => {
  if (!value) {
    return (
      <div className="flex-grow flex items-center justify-center text-slate-400 text-sm">
        Result will appear here...
      </div>
    );
  }

  const lines = value.split('\n');

  // syntax colour helpers
  const colorizeLine = (line: string, lang: string): React.ReactNode => {
    if (lang === 'sql') return colorizeSql(line);
    if (lang === 'markdown') return colorizeMarkdown(line);
    return colorizeGeneric(line);
  };

  return (
    <div className="flex-grow overflow-auto">
      <div className="flex text-[13px] font-mono leading-relaxed min-w-max">
        {/* Line numbers */}
        <div className="flex flex-col bg-slate-50 border-r border-slate-200 select-none shrink-0 sticky left-0 z-[1]">
          {lines.map((_, i) => (
            <span key={i} className="px-3 py-[1px] text-slate-400 text-right text-[11px] leading-relaxed">
              {i + 1}
            </span>
          ))}
        </div>
        {/* Code */}
        <pre className="flex-grow p-3 overflow-x-auto whitespace-pre">
          {lines.map((line, i) => (
            <div key={i} className="leading-relaxed hover:bg-indigo-50/30 px-1 -mx-1 rounded">
              {colorizeLine(line, language)}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

// ─── Syntax colours (lightweight, no deps) ────────────────────────────────────

function colorizeSql(line: string): React.ReactNode {
  const keywords = /\b(CREATE|TABLE|INSERT|INTO|VALUES|TEXT|INTEGER|REAL|BOOLEAN|NULL|TRUE|FALSE|VARCHAR|NOT|PRIMARY|KEY)\b/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(keywords.source, 'gi');
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{colorizeStrings(line.slice(lastIndex, match.index))}</span>
      );
    }
    parts.push(
      <span key={`k-${match.index}`} className="text-indigo-600 font-semibold">
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(<span key={`e-${lastIndex}`}>{colorizeStrings(line.slice(lastIndex))}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <span>{line}</span>;
}

function colorizeStrings(text: string): React.ReactNode {
  const regex = /'([^']*)'/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`p-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <span key={`s-${match.index}`} className="text-emerald-600">
        '{match[1]}'
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`r-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <span>{text}</span>;
}

function colorizeMarkdown(line: string): React.ReactNode {
  if (line.startsWith('|') && /^\|[\s-|]+\|$/.test(line)) {
    return <span className="text-slate-400">{line}</span>;
  }
  if (line.startsWith('|')) {
    const cells = line.split('|').filter(Boolean);
    return (
      <span>
        <span className="text-slate-400">|</span>
        {cells.map((cell, i) => (
          <span key={i}>
            <span className="text-slate-700">{cell}</span>
            <span className="text-slate-400">|</span>
          </span>
        ))}
      </span>
    );
  }
  return <span>{line}</span>;
}

function colorizeGeneric(line: string): React.ReactNode {
  // Colour JSON-ish keys, strings, numbers, booleans
  const parts: React.ReactNode[] = [];
  const regex = /("(?:[^"\\]|\\.)*")\s*(:)?|(\b\d+\.?\d*\b)|\b(true|false|null)\b/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`g-${lastIndex}`}>{line.slice(lastIndex, match.index)}</span>);
    }
    if (match[1] && match[2]) {
      // key
      parts.push(<span key={`k-${match.index}`} className="text-indigo-600">{match[1]}</span>);
      parts.push(<span key={`c-${match.index}`} className="text-slate-500">{match[2]}</span>);
    } else if (match[1]) {
      // string value
      parts.push(<span key={`s-${match.index}`} className="text-emerald-600">{match[1]}</span>);
    } else if (match[3]) {
      parts.push(<span key={`n-${match.index}`} className="text-amber-600">{match[3]}</span>);
    } else if (match[4]) {
      parts.push(
        <span key={`b-${match.index}`} className="text-rose-500 font-semibold">
          {match[4]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(<span key={`e-${lastIndex}`}>{line.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : <span>{line}</span>;
}
