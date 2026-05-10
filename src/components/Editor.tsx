import React from 'react';
import { cn } from '../utils/cn';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  label?: string;
  error?: string | null;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  label,
  error
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      {label && (
        <label className="text-sm font-medium text-slate-700 mb-1.5 flex justify-between items-center">
          {label}
          {error && <span className="text-xs text-red-500 font-normal">{error}</span>}
        </label>
      )}
      <div className={cn(
        "relative flex-grow flex flex-col rounded-lg border overflow-hidden transition-all duration-200 shadow-sm",
        error ? "border-red-300 ring-1 ring-red-100 bg-red-50/10" : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 bg-white",
        readOnly && "bg-slate-50/50"
      )}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(
            "flex-grow p-4 font-mono text-sm resize-none outline-none bg-transparent text-slate-800 placeholder:text-slate-400",
            readOnly && "cursor-default"
          )}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
