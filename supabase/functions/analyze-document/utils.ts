export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const validateEnvironment = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing');
  }
  return { supabaseUrl, supabaseKey };
};

export const parseFileContent = async (fileData: Blob, fileExt: string | undefined) => {
  console.log('Parsing file with extension:', fileExt);
  
  try {
    const text = await fileData.text();
    
    if (fileExt === 'csv') {
      const rows = text.split('\n').map(row => row.split(','));
      return rows.slice(1); // Skip header row
    } else {
      // For text files, PDFs, etc., return lines of text
      return text.split('\n').filter(line => line.trim());
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error(`Failed to parse ${fileExt} file: ${error.message}`);
  }
};

export const analyzeWithRules = async (parsedData: any[]) => {
  console.log('Analyzing data with rule-based system');
  
  const transactions = [];
  const findings = [];
  let riskLevel = 'low';
  const recommendations = [];
  let confidenceScore = 0.85;

  // Basic pattern matching for financial data
  parsedData.forEach((line, index) => {
    if (Array.isArray(line)) {
      // CSV data analysis
      const [date, description, amount] = line;
      const numAmount = parseFloat(amount);
      
      if (!isNaN(numAmount)) {
        transactions.push({
          date,
          description,
          amount: numAmount,
          category: detectCategory(description),
          flagged: numAmount > 10000 // Flag large transactions
        });

        if (numAmount > 10000) {
          findings.push(`Large transaction detected: $${numAmount} on ${date}`);
          riskLevel = 'medium';
        }
      }
    } else if (typeof line === 'string') {
      // Text document analysis
      if (line.toLowerCase().includes('expense') || line.toLowerCase().includes('payment')) {
        const amount = extractAmount(line);
        if (amount) {
          transactions.push({
            description: line,
            amount,
            category: detectCategory(line),
            flagged: amount > 10000
          });
        }
      }
    }
  });

  // Generate recommendations based on findings
  if (findings.length > 0) {
    recommendations.push('Review all flagged transactions for compliance');
    recommendations.push('Consider implementing transaction limits');
  } else {
    recommendations.push('No immediate actions required');
    recommendations.push('Continue monitoring transactions regularly');
  }

  return {
    transactions,
    findings,
    risk_level: riskLevel,
    recommendations,
    confidence_score: confidenceScore
  };
};

function detectCategory(text: string): string {
  const lowercase = text.toLowerCase();
  if (lowercase.includes('salary') || lowercase.includes('payroll')) return 'Payroll';
  if (lowercase.includes('rent') || lowercase.includes('lease')) return 'Rent';
  if (lowercase.includes('equipment') || lowercase.includes('supplies')) return 'Equipment';
  if (lowercase.includes('utility') || lowercase.includes('electric')) return 'Utilities';
  return 'Other';
}

function extractAmount(text: string): number | null {
  const matches = text.match(/\$?\d+([,.]\d{2})?/);
  if (matches) {
    return parseFloat(matches[0].replace(/[$,]/g, ''));
  }
  return null;
}