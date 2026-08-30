import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentTable: string[] = [];
  let inTable = false;

  const renderFormattedText = (text: string): React.ReactNode => {
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      let firstMatch = null;
      let matchType = null;

      if (boldMatch && boldMatch.index !== undefined) {
        firstMatch = boldMatch;
        matchType = 'bold';
      }

      if (codeMatch && codeMatch.index !== undefined) {
        if (!firstMatch || (codeMatch.index < (firstMatch.index ?? 0))) {
          firstMatch = codeMatch;
          matchType = 'code';
        }
      }

      if (firstMatch && firstMatch.index !== undefined && matchType) {
        if (firstMatch.index > 0) {
          parts.push(<span key={keyIdx++}>{remaining.substring(0, firstMatch.index)}</span>);
        }

        if (matchType === 'bold') {
          parts.push(
            <strong key={keyIdx++} className="font-bold text-[#172033]">
              {firstMatch[1]}
            </strong>
          );
        } else if (matchType === 'code') {
          parts.push(
            <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-[13px] border border-[#E7E9F0]">
              {firstMatch[1]}
            </code>
          );
        }

        remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
      } else {
        parts.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }
    }

    return <>{parts}</>;
  };

  const flushTable = (tableLines: string[], index: number) => {
    if (tableLines.length === 0) return null;

    const validRows = tableLines.filter(l => !l.match(/^\|\s*[-:]+[-|\s:]*\|$/));
    if (validRows.length === 0) return null;

    const headers = validRows[0].split('|').map(s => s.trim()).filter(Boolean);
    const bodyRows = validRows.slice(1).map(row => row.split('|').map(s => s.trim()).filter(Boolean));

    return (
      <div key={`table_${index}`} className="my-2.5 overflow-x-auto rounded-xl border border-[#E7E9F0] bg-white">
        <table className="w-full text-left text-[13.5px] border-collapse">
          <thead>
            <tr className="border-b border-[#E7E9F0] bg-[#F8F9FC] text-[#172033] font-semibold">
              {headers.map((h, i) => (
                <th key={i} className="p-2.5">
                  {renderFormattedText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-slate-700">
            {bodyRows.map((r, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#F8F9FC] transition-colors">
                {r.map((cell, cellIdx) => (
                  <td key={cellIdx} className="p-2.5">
                    {renderFormattedText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      currentTable.push(line.trim());
      continue;
    } else if (inTable) {
      inTable = false;
      renderedElements.push(flushTable(currentTable, i));
      currentTable = [];
    }

    if (!line.trim()) {
      renderedElements.push(<div key={`sp_${i}`} className="h-1.5" />);
      continue;
    }

    // Section Header keywords
    if (
      line.trim() === 'BOTTOM LINE' ||
      line.trim() === 'ANALYSIS' ||
      line.trim() === 'ANALYSIS & CALCULATION' ||
      line.trim() === 'CALCULATION' ||
      line.trim() === 'RECOMMENDATION' ||
      line.trim() === 'RECOMMENDED ALLOCATION' ||
      line.trim() === 'RISKS' ||
      line.trim() === 'KEY RISKS' ||
      line.trim() === 'WHY' ||
      line.trim() === 'NEXT STEP' ||
      line.trim() === 'PORTFOLIO SELECTION RATIONALE' ||
      line.trim() === 'FIDUCIARY DIRECT-PLAN ADVANTAGE'
    ) {
      renderedElements.push(
        <div
          key={`sec_${i}`}
          className="text-[12.5px] font-bold text-teal-800 tracking-wider uppercase pt-2.5 pb-1 border-b border-[#E7E9F0]"
        >
          {line.trim()}
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3_${i}`} className="text-[15.5px] font-bold text-[#172033] mt-2.5 mb-1">
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={`h4_${i}`} className="text-[14px] font-semibold text-teal-700 mt-2 mb-0.5">
          {renderFormattedText(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const text = line.trim().replace(/^[*|-]\s+/, '');
      renderedElements.push(
        <div key={`li_${i}`} className="flex items-start gap-2 pl-1 py-0.5 text-slate-700 text-[14px]">
          <span className="text-teal-600 font-bold shrink-0 mt-0.5 text-[13px]">•</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(text)}</div>
        </div>
      );
      continue;
    }

    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num_${i}`} className="flex items-start gap-2 pl-1 py-0.5 text-slate-700 text-[14px]">
          <span className="text-teal-600 font-bold shrink-0 text-[13px]">{numMatch[1]}.</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      renderedElements.push(<hr key={`hr_${i}`} className="my-2 border-[#E7E9F0]" />);
      continue;
    }

    renderedElements.push(
      <p key={`p_${i}`} className="leading-relaxed text-[#172033] text-[14px]">
        {renderFormattedText(line)}
      </p>
    );
  }

  if (inTable && currentTable.length > 0) {
    renderedElements.push(flushTable(currentTable, lines.length));
  }

  return <div className={`space-y-1.5 text-[14px] leading-relaxed ${className}`}>{renderedElements}</div>;
};
