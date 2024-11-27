// This is a placeholder OCR client implementation
// In production, this would integrate with a real OCR service like Tesseract, Google Cloud Vision, etc.

export const createOCRClient = () => {
  return {
    processImage: async (imageData: Blob): Promise<string> => {
      // Placeholder implementation
      // In production, this would send the image to an OCR service
      console.log('Processing image with OCR client...');
      
      // Return dummy text for now
      return `Invoice #1234
Amount: $1,234.56
Date: 2024-03-20
Description: Office Supplies`;
    }
  };
};