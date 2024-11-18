export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const validateEnvironment = () => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  return openAIApiKey;
};

export const parseFileContent = async (fileData: Blob, fileExt: string | undefined) => {
  console.log('Parsing file with extension:', fileExt);
  
  try {
    const text = await fileData.text();
    
    if (fileExt === 'csv') {
      const rows = text.split('\n').map(row => row.split(','));
      return rows.slice(1); // Skip header row
    } else if (['xls', 'xlsx'].includes(fileExt || '')) {
      throw new Error('Excel files not supported yet');
    } else {
      // For text files, PDFs, etc., return lines of text
      return text.split('\n').filter(line => line.trim());
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error(`Failed to parse ${fileExt} file: ${error.message}`);
  }
};

export const analyzeWithAI = async (openAIApiKey: string, parsedData: any[]) => {
  console.log('Sending data to OpenAI for analysis');
  
  // Limit data sent to OpenAI to avoid token limits
  const sampleData = parsedData.slice(0, 50);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a financial document analyzer. Analyze this data and provide a structured response with:
            1. transactions: Array of identified transactions with amounts, categories, and whether they should be flagged
            2. findings: Array of key findings or issues identified
            3. risk_level: Overall risk assessment (low, medium, high)
            4. recommendations: Array of actionable recommendations
            5. confidence_score: Number between 0 and 1 indicating analysis confidence
            Format response as JSON with these exact sections.`
        },
        {
          role: 'user',
          content: `Analyze this financial data:\n${JSON.stringify(sampleData, null, 2)}`
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    console.error('OpenAI API error:', await response.text());
    throw new Error('Failed to analyze document with OpenAI');
  }

  const aiResponse = await response.json();
  console.log('Received analysis from OpenAI');
  
  try {
    return JSON.parse(aiResponse.choices[0].message.content);
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Invalid response format from OpenAI');
  }
};