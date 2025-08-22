import React from 'react';

interface TextDiffViewerProps {
  markedText: string;
}

const TextDiffViewer: React.FC<TextDiffViewerProps> = ({ markedText }) => {
  if (!markedText) {
    return null;
  }

  // This regex splits the text by the <ch> tags (with or without attributes), keeping the delimiters.
  const parts = markedText.split(/(<ch.*?>.*?<\/ch>)/g);

  const diff = parts.map((part, index) => {
    if (part.startsWith('<ch') && part.endsWith('</ch>')) {
      const originalMatch = part.match(/data-original="(.*?)"/);
      // Decode the HTML attribute
      const originalWord = originalMatch ? originalMatch[1].replace(/&quot;/g, '"') : null;

      const contentMatch = part.match(/<ch.*?>(.*?)<\/ch>/);
      const content = contentMatch ? contentMatch[1] : '';
      
      const tooltipText = originalWord ? `${originalWord} → ${content}` : null;

      return (
        <span 
            key={index} 
            className="bg-green-500/20 text-green-800 dark:text-green-300 rounded px-1 cursor-help"
            title={tooltipText || undefined}
        >
          {content}
        </span>
      );
    }
    // This is an unchanged part.
    return <span key={index}>{part}</span>;
  });

  return <p className="whitespace-pre-wrap p-3">{diff}</p>;
};

export default TextDiffViewer;