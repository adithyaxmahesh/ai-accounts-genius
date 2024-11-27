import { createOCRClient } from './ocrClient.ts';

export async function processImage(fileData: Blob) {
  const text = await performOCR(fileData);
  const lines = text.split('\n');
  
  const transactions = [];
  const findings = [];
  let confidenceScore = 0.85;

  // Process OCR results
  for (const line of lines) {
    const amountMatch = line.match(/\$?\d{1,3}(,\d{3})*(\.\d{2})?/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[0].replace(/[$,]/g, ''));
      if (!isNaN(amount)) {
        transactions.push({
          amount,
          description: line.trim(),
          type: amount > 0 ? 'revenue' : 'expense',
          confidence: 0.85
        });

        findings.push(`Detected transaction: $${Math.abs(amount)} - ${line.trim()}`);
      }
    }
  }

  return {
    transactions,
    findings,
    riskLevel: 'low',
    recommendations: [
      "Review extracted transactions for accuracy",
      "Verify all amounts and descriptions",
      "Check for missing transactions"
    ],
    writeOffs: [],
    confidenceScore
  };
}

async function performOCR(imageData: Blob): Promise<string> {
  const ocrClient = createOCRClient();
  return await ocrClient.processImage(imageData);
}