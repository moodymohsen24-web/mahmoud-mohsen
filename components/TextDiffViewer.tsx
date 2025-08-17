
import React from 'react';

interface TextDiffViewerProps {
  markedText: string;
}

const TextDiffViewer: React.FC<TextDiffViewerProps> = ({ markedText }) => {
  if (!markedText) {
    return null;
  }

  // This regex splits the text by the <ch> and </ch> tags, keeping the delimiters.
  const parts = markedText.split(/(<ch>.*?<\/ch>)/g);

  const diff = parts.map((part, index) => {
    if (part.startsWith('<ch>') && part.endsWith('</ch>')) {
      // This is a changed part. Extract the content between the tags.
      const content = part.substring(4, part.length - 5);
      return (
        <span key={index} className="bg-green-500/20 text-green-800 dark:text-green-300 rounded px-1">
          {content}
        </span>
      );
    }
    // This is an unchanged part.
    return <span key={index}>{part}</span>;
  });

  return <p className="whitespace-pre-wrap">{diff}</p>;
};

export default TextDiffViewer;