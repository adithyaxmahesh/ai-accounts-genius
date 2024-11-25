import { parse } from 'date-fns';

export const extractDateFromDocument = async (file: File): Promise<string | null> => {
  // This is a simple implementation. You might want to enhance this based on your needs
  try {
    const text = await file.text();
    
    // Look for common date formats in the document
    const dateRegex = /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g;
    const matches = text.match(dateRegex);
    
    if (matches && matches.length > 0) {
      // Try to parse the first found date
      const date = parse(matches[0], 'yyyy-MM-dd', new Date());
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting date from document:", error);
    return null;
  }
};