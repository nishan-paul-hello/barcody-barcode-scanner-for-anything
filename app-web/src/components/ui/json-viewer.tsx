'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: unknown;
  name?: string;
  isExpanded?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  name,
  isExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const isObject = (item: unknown) => item !== null && typeof item === 'object';
  const isArray = Array.isArray(data);

  if (!isObject(data)) {
    let valueColor = 'text-green-400';
    if (typeof data === 'number') {
      valueColor = 'text-orange-400';
    } else if (typeof data === 'boolean') {
      valueColor = 'text-pink-400';
    } else if (data === null) {
      valueColor = 'text-white/40';
    }

    return (
      <div className="flex font-mono text-sm leading-6">
        {name && <span className="mr-2 text-cyan-300">{name}:</span>}
        <span className={valueColor}>
          {typeof data === 'string' ? `"${data}"` : String(data)}
        </span>
      </div>
    );
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return (
      <div className="flex font-mono text-sm leading-6">
        {name && <span className="mr-2 text-cyan-300">{name}:</span>}
        <span className="text-white/50">{isArray ? '[]' : '{}'}</span>
      </div>
    );
  }

  return (
    <div className="font-mono text-sm leading-6">
      <div
        className="-ml-1 flex cursor-pointer items-center rounded px-1 transition-colors select-none hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="mr-1 flex h-4 w-4 items-center justify-center text-white/40">
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
        {name && <span className="mr-2 text-cyan-300">{name}:</span>}
        <span className="text-white/50">
          {isArray ? '[' : '{'}
          {!expanded && ` ${keys.length} items ${isArray ? ']' : '}'}`}
        </span>
      </div>

      {expanded && (
        <div className="my-1 ml-[5px] border-l border-white/10 pl-4">
          {keys.map((key) => (
            <JsonViewer
              key={key}
              name={isArray ? undefined : key}
              data={(data as Record<string, unknown>)[key]}
              isExpanded={false}
            />
          ))}
        </div>
      )}
      {expanded && (
        <div className="ml-[5px] text-white/50">{isArray ? ']' : '}'}</div>
      )}
    </div>
  );
};
