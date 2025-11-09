/**
 * Generates a prompt for OpenAI to create property descriptions
 * @param {Object} propertyData - The property details
 * @returns {string} - The formatted prompt
 */
export function generatePrompt(propertyData) {
  const {
    houseName,
    address,
    location,
    bedrooms,
    bathrooms,
    size,
    price,
    features
  } = propertyData;

  return `You are a professional real estate listing writer. 
Your job is to take the following property details and write a clear, attractive, 
and professional description for a property marketplace. 

Details: 
- House Name: ${houseName || 'N/A'}
- Address: ${address || 'N/A'}
- Location: ${location || 'N/A'}
- Bedrooms: ${bedrooms || 'N/A'}
- Bathrooms: ${bathrooms || 'N/A'}
- Size: ${size || 'N/A'}
- Price: ${price || 'N/A'}
- Key Features: ${features || 'N/A'}

Guidelines: 
1. Write in a friendly but professional tone. 
2. Start with a strong opening sentence that highlights the property type and location. 
3. Emphasize key selling points like spacious rooms, modern design, and location benefits. 
4. Keep the description between 120–180 words. 
5. Avoid repeating the same words or sounding robotic. 
6. End with a short call-to-action like "Schedule a visit today to experience it yourself!" 

Please provide only the property description without any additional text or formatting.`;
}