export interface AutoDescriptionInput {
  houseName?: string;
  address: string;
  location?: string;
  bedrooms: number | string;
  bathrooms: number | string;
  size?: string;
  price?: string;
  features?: string;
}

// Lightweight, local description generator so the feature works without external AI services.
export async function createPropertyDescription(data: AutoDescriptionInput): Promise<string> {
  const {
    houseName,
    address,
    location,
    bedrooms,
    bathrooms,
    size,
    price,
    features,
  } = data;

  const namePart = houseName?.trim() || 'this property';
  const locationPart = location?.trim() || address.trim();

  const sizePart = size && size.trim().length > 0 ? ` offering approximately ${size.trim()}` : '';
  const pricePart = price && price.trim().length > 0 ? ` with an Only If price of ${price.trim()}` : '';

  const featureText =
    features && features.trim().length > 0
      ? features.trim()
      : 'modern finishes, practical layout and a convenient position close to local amenities';

  const firstParagraph = `${namePart} at ${address} is a well-presented home in ${locationPart}. Featuring ${bedrooms} bedrooms and ${bathrooms} bathrooms${sizePart}, it has been designed for comfortable everyday living and easy entertaining.`;

  const secondParagraph = `Inside, you will find ${featureText}. The flexible floorplan suits a range of buyers, from first-home purchasers and upsizers to investors looking for a low-maintenance opportunity.`;

  const thirdParagraph = `Located in a popular pocket of ${locationPart}, you are within easy reach of shopping, schools, parks and public transport${pricePart}. This is a great opportunity to secure a quality home in a sought-after area.`;

  return [firstParagraph, '', secondParagraph, '', thirdParagraph].join('\n');
}

