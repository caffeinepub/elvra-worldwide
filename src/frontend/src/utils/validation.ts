export const DESCRIPTION_MAX_WORDS = 1000;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).filter(w => w.length > 0).length;
}

export function validateDescription(description: string): { isValid: boolean; message?: string } {
  const wordCount = countWords(description);
  
  if (wordCount === 0) {
    return {
      isValid: false,
      message: 'Please write at least something about your requirement.'
    };
  }
  
  if (wordCount > DESCRIPTION_MAX_WORDS) {
    return {
      isValid: false,
      message: 'Maximum 1000 words allowed.'
    };
  }
  
  return { isValid: true };
}

export { countWords };
