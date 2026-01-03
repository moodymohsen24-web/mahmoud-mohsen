
/**
 * Splits text into chunks based on character limits and sentence boundaries.
 * 
 * @param text The full text to split
 * @param minChars Minimum characters per chunk (soft limit)
 * @param maxChars Maximum characters per chunk (hard limit)
 * @returns Array of text chunks
 */
export const splitText = (text: string, minChars: number = 450, maxChars: number = 500): string[] => {
    if (!text || text.trim().length === 0) return [];
    
    // Safety check for invalid ranges
    const safeMin = Math.max(1, minChars);
    const safeMax = Math.max(safeMin + 1, maxChars);

    if (safeMin >= safeMax) return [text];

    const chunks: string[] = [];
    let remainingText = text.trim();

    while (remainingText.length > 0) {
        // If the remaining text fits in one chunk, just take it
        if (remainingText.length <= safeMax) {
            chunks.push(remainingText);
            break;
        }

        let splitPos = -1;

        // 1. Look for sentence-ending punctuation within the allowed range (working backwards)
        // We look between minChars and maxChars
        const searchEnd = Math.min(safeMax, remainingText.length - 1);
        const searchStart = Math.min(searchEnd, safeMin);

        for (let i = searchEnd; i >= searchStart; i--) {
            // Check for common sentence terminators (Arabic & English)
            if (/[.؟!؟\n]/.test(remainingText[i])) {
                splitPos = i + 1; // Include the punctuation
                break;
            }
        }

        // 2. If no punctuation found, look for the last space within the range
        if (splitPos === -1) {
            const lastSpace = remainingText.lastIndexOf(' ', safeMax);
            if (lastSpace !== -1 && lastSpace >= safeMin) {
                splitPos = lastSpace + 1;
            }
        }

        // 3. If strictly no split point found, force split at maxChars
        if (splitPos === -1) {
            splitPos = safeMax;
        }

        chunks.push(remainingText.substring(0, splitPos).trim());
        remainingText = remainingText.substring(splitPos).trim();
    }

    // Optimization: Merge the last two chunks if the final one is too small (orphaned)
    if (chunks.length > 1) {
        const lastChunk = chunks[chunks.length - 1];
        const secondLastChunk = chunks[chunks.length - 2];
        
        // If last chunk is smaller than minChars and merging doesn't exceed 1.5x max (safety buffer)
        if (lastChunk.length > 0 && lastChunk.length < safeMin) {
            if ((secondLastChunk.length + lastChunk.length) < (safeMax * 1.5)) {
                chunks[chunks.length - 2] = secondLastChunk + ' ' + lastChunk;
                chunks.pop();
            }
        }
    }

    return chunks.filter(chunk => chunk.length > 0);
};
