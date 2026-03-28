import PropertyCard from './PropertyCard';

interface Property {
  id: string;
  image: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  size: number;
  featured?: boolean;
}

interface SimilarPropertiesProps {
  properties: Property[];
  currentPropertyId: string;
  className?: string;
}

export default function SimilarProperties({
  properties,
  currentPropertyId,
  className = ""
}: SimilarPropertiesProps) {
  // Add null check for properties array
  if (!properties || !Array.isArray(properties)) {
    return null;
  }

  // Filter out the current property and limit to 4 similar properties
  const similarProperties = properties
    .filter(property => property.id !== currentPropertyId)
    .slice(0, 4);

  if (similarProperties.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Similar Properties
          </h2>
          <p className="text-gray-600">
            Discover other properties you might be interested in
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProperties.map((property) => (
            <PropertyCard
              key={property.id}
              // ... rest of PropertyCard props
            />
          ))}
        </div>
      </div>
    </section>
  );
}