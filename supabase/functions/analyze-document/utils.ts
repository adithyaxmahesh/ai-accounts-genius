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

export const parseFileContent = async (fileData: Blob, fileExt: string) => {
  console.log('Parsing file with extension:', fileExt);
  
  try {
    if (fileExt === 'csv') {
      const text = await fileData.text();
      const rows = text.split('\n').map(row => row.split(','));
      return rows.slice(1); // Skip header row
    } else if (['xls', 'xlsx'].includes(fileExt)) {
      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(firstSheet);
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a financial document analyzer. Analyze this data sample and provide:
            1) Summary of transactions/entries
            2) Potential anomalies or suspicious patterns
            3) Tax implications
            4) Compliance concerns
            5) Risk assessment
            Format response as JSON with these sections.`
        },
        {
          role: 'user',
          content: `Analyze this data:\n${JSON.stringify(sampleData, null, 2)}`
        }
      ],
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