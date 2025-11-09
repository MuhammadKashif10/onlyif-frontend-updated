export const formatPropertyAddress = (address: any): string => {
  if (typeof address === 'string') {
    return address;
  }
  
  if (address && typeof address === 'object') {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    return parts.join(', ') || 'Address not available';
  }
  
  return 'Address not available';
};

// Add this function to safely get searchable address text
export const getSearchableAddress = (address: string | { street: string; city: string; state: string; zipCode: string; country: string } | undefined): string => {
  if (!address) return '';
  
  if (typeof address === 'string') {
    return address;
  }
  
  // If it's an object, combine the fields
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(' ');
};