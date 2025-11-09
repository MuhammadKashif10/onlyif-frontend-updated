import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if Hugging Face API key is configured
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      console.error('HF_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Hugging Face API key not configured' },
        { status: 500 }
      );
    }

    console.log('Making request to Hugging Face API...');

    // Use a reliable and available model for text generation
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Generate a professional property description: ${prompt}`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      
      // Try a different approach with a simpler model
      if (response.status === 404) {
        console.log('Trying alternative model...');
        
        const fallbackResponse = await fetch('https://api-inference.huggingface.co/models/distilgpt2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Property Description: ${prompt}`,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.8,
              do_sample: true,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
            }
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          let description = '';
          
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            description = fallbackData[0].generated_text || '';
          } else if (fallbackData.generated_text) {
            description = fallbackData.generated_text;
          }

          if (description) {
            description = description.trim();
            return NextResponse.json({ description });
          }
        }
      }
      
      // If all else fails, provide a template-based description
      const templateDescription = generateTemplateDescription(prompt);
      return NextResponse.json({ description: templateDescription });
    }

    const data = await response.json();
    console.log('API Response:', data);

    let description = '';

    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      if (data[0].generated_text) {
        description = data[0].generated_text;
      } else if (data[0].text) {
        description = data[0].text;
      }
    } else if (data.generated_text) {
      description = data.generated_text;
    } else if (data.text) {
      description = data.text;
    }

    // If no description generated, create a template-based one
    if (!description || description.trim() === '') {
      description = generateTemplateDescription(prompt);
    }

    // Clean up and format the description
    description = description.trim();
    
    // Remove any unwanted prefixes
    if (description.toLowerCase().startsWith('property description:')) {
      description = description.substring('property description:'.length).trim();
    }

    console.log('Generated description:', description);

    return NextResponse.json({ description });

  } catch (error) {
    console.error('Error in generate-description API:', error);
    
    // Fallback to template description
    const templateDescription = generateTemplateDescription(request.prompt || 'this property');
    return NextResponse.json({ description: templateDescription });
  }
}

// Helper function to generate template-based descriptions
function generateTemplateDescription(prompt) {
  const templates = [
    "This exceptional property offers modern living at its finest. Featuring spacious rooms and premium finishes throughout, it provides the perfect blend of comfort and style. Located in a desirable neighborhood with easy access to amenities and transportation.",
    
    "Discover your dream home in this beautifully designed property. With thoughtful layouts and quality construction, every detail has been carefully considered. The prime location offers convenience while maintaining a peaceful residential atmosphere.",
    
    "Welcome to this stunning property that combines elegance with functionality. Boasting impressive features and a sought-after location, it represents an excellent opportunity for discerning buyers seeking quality and value.",
    
    "This remarkable property showcases contemporary design and superior craftsmanship. The well-appointed spaces create an inviting atmosphere perfect for both relaxation and entertainment. Situated in a thriving community with excellent local amenities."
  ];
  
  // Simple logic to vary the template based on prompt content
  const templateIndex = prompt.length % templates.length;
  return templates[templateIndex];
}