'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

function MermaidChart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, chart).then(({ svg }) => setSvg(svg)).catch(() => {});
  }, [chart]);

  return (
    <div
      ref={ref}
      className="flex justify-center my-6 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-y-auto bg-white border border-gray-300 rounded-md p-6">
      {content ? (
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-4 prose-p:text-gray-900 prose-li:text-gray-900 prose-td:text-gray-900 prose-pre:bg-gray-900 text-gray-900">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match?.[1] === 'mermaid') {
                  return <MermaidChart chart={String(children).trim()} />;
                }
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: '1.5rem 0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600" {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="leading-relaxed my-4">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">
                    {children}
                  </blockquote>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full divide-y divide-gray-300 border">{children}</table>
                  </div>
                );
              },
              th({ children }) {
                return <th className="px-4 py-3 bg-gray-100 text-left text-sm font-semibold text-gray-900 border">{children}</th>;
              },
              td({ children }) {
                return <td className="px-4 py-3 text-sm text-gray-700 border">{children}</td>;
              },
              hr() {
                return <hr className="my-8 border-t-2 border-gray-300" />;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>내용을 입력하면 여기에 미리보기가 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
