// In the PropertyGrid component, ensure safe array operations
const safeAllProperties = Array.isArray(allProperties) ? allProperties : [];
const filteredProperties = safeAllProperties.filter(property => {
  // ... existing filter logic ...
});

// In the JSX rendering:
{Array.isArray(paginatedProperties) && paginatedProperties.length > 0 ? (
  paginatedProperties.map(property => (
    <PropertyCard key={property.id} property={property} />
  ))
) : (
  <div className="text-center py-8">
    <p className="text-gray-500">No properties found</p>
  </div>
)}