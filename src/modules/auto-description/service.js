/**
 * Service to call OpenAI API and generate property descriptions
 */

/**
 * Calls OpenAI API to generate property description
 * @param {string} prompt - The formatted prompt
 * @returns {Promise<string>} - The generated description
 */
export async function generateDescription(prompt) {
  try {
    const response = await fetch('/api/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.description;
  } catch (error) {
    console.error('Error generating description:', error);
    throw new Error('Failed to generate description. Please try again.');
  }
}

/**
 * Main function to generate property description from property data
 * @param {Object} propertyData - The property details
 * @returns {Promise<string>} - The generated description
 */
export async function createPropertyDescription(propertyData) {
  const { generatePrompt } = await import('./generatePrompt.js');
  const prompt = generatePrompt(propertyData);
  return await generateDescription(prompt);
}