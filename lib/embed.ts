import { AzureOpenAI } from 'openai';

// Retrieve Azure-specific environment variables
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Ensure all necessary environment variables are set
if (!endpoint || !apiKey || !deploymentName) {
  throw new Error('Azure OpenAI environment variables are not properly configured.');
}


let azureOpenAIClient: AzureOpenAI | null = null;

function getAzureOpenAIClient(): AzureOpenAI {
    if (!azureOpenAIClient) {
        azureOpenAIClient = new AzureOpenAI({
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            apiVersion: "2025-01-01-preview"
        });
    }
    return azureOpenAIClient;
}

// Initialize the dedicated Azure OpenAI Client
const client = getAzureOpenAIClient();

export async function embed(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0 || !deploymentName) {
    throw new Error('Embedding text cannot be empty');
  }

  const input = text.replace(/\n/g, ' ');
  try {
    const response = await client.embeddings.create({model: deploymentName, input: [input]});
    
    // The response contains a list of embeddings, we just need the first one
    if (response.data && response.data.length > 0) {
      return response.data[0].embedding;
    } else {
      throw new Error('Received an empty embedding response from Azure OpenAI.');
    }

  } catch (e) {
    console.error('Error creating embedding with @azure/openai SDK:', e);
    throw e;
  }
}