import { NextRequest, NextResponse } from 'next/server';
import { USE_MOCKS } from '@/utils/mockWrapper';

// Mock property data (same as in the main properties route)
const mockProperties = [
  {
    id: '1',
    title: 'Modern Downtown Condo',
    address: '123 Main St, Austin, TX 78701',
    price: 450000,
    beds: 2,
    baths: 2,
    size: 1200,
    featured: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-5c9a0c9a0c9a?w=800&h=600&fit=crop',
    ],
    description: 'Beautiful modern condo in the heart of downtown Austin. Features open floor plan, high ceilings, and stunning city views.',
    yearBuilt: 2018,
    lotSize: 0.1,
    propertyType: 'Condo',
    status: 'For Sale',
    features: [
      'Open floor plan',
      'High ceilings',
      'City views',
      'Balcony',
      'In-unit laundry',
      'Central AC',
      'Hardwood floors',
      'Modern kitchen'
    ],
    agent: {
      name: 'Sarah Johnson',
      phone: '(512) 555-0123',
      email: 'sarah.johnson@realestate.com',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    seller: {
      id: 'seller-1',
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com'
    },
    amenities: [
      'Pool',
      'Gym',
      'Parking',
      'Security',
      'Rooftop deck'
    ]
  },
  {
    id: '2',
    title: 'Spacious Family Home',
    address: '456 Oak Ave, Austin, TX 78702',
    price: 750000,
    beds: 4,
    baths: 3,
    size: 2800,
    featured: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    description: 'Perfect family home with large backyard, updated kitchen, and plenty of storage space.',
    yearBuilt: 2015,
    lotSize: 0.3,
    propertyType: 'Single Family',
    status: 'For Sale',
    features: [
      'Large backyard',
      'Updated kitchen',
      'Storage space',
      'Fireplace',
      'Central AC',
      'Hardwood floors',
      'Garage',
      'Fenced yard'
    ],
    agent: {
      name: 'Mike Chen',
      phone: '(512) 555-0456',
      email: 'mike.chen@realestate.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    seller: {
      id: 'seller-2',
      name: 'Emily Davis',
      email: 'emily.davis@example.com'
    },
    amenities: [
      'Backyard',
      'Garage',
      'Fireplace',
      'Storage'
    ]
  },
  {
    id: '3',
    title: 'Luxury Townhouse',
    address: '789 Pine St, Austin, TX 78703',
    price: 650000,
    beds: 3,
    baths: 2.5,
    size: 2100,
    featured: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-5c9a0c9a0c9a?w=800&h=600&fit=crop',
    ],
    description: 'Elegant townhouse with modern amenities, private garage, and community pool.',
    yearBuilt: 2020,
    lotSize: 0.15,
    propertyType: 'Townhouse',
    status: 'For Sale',
    features: [
      'Modern amenities',
      'Private garage',
      'Community pool',
      'Balcony',
      'Central AC',
      'Hardwood floors',
      'Modern kitchen',
      'Walk-in closets'
    ],
    agent: {
      name: 'Emily Rodriguez',
      phone: '(512) 555-0789',
      email: 'emily.rodriguez@realestate.com',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    seller: {
      id: 'seller-3',
      name: 'Jennifer Smith',
      email: 'jennifer.smith@example.com'
    },
    amenities: [
      'Pool',
      'Garage',
      'Balcony',
      'Community amenities'
    ]
  },
  {
    id: '4',
    title: 'Cozy Bungalow',
    address: '321 Elm St, Austin, TX 78704',
    price: 380000,
    beds: 2,
    baths: 1,
    size: 1100,
    featured: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    description: 'Charming bungalow with character, updated kitchen, and fenced backyard.',
    yearBuilt: 1950,
    lotSize: 0.2,
    propertyType: 'Single Family',
    status: 'For Sale',
    features: [
      'Character',
      'Updated kitchen',
      'Fenced backyard',
      'Fireplace',
      'Hardwood floors',
      'Original details',
      'Garden',
      'Patio'
    ],
    agent: {
      name: 'David Kim',
      phone: '(512) 555-0321',
      email: 'david.kim@realestate.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    seller: {
      id: 'seller-4',
      name: 'Robert Thompson',
      email: 'robert.thompson@example.com'
    },
    amenities: [
      'Backyard',
      'Garden',
      'Patio',
      'Fireplace'
    ]
  },
  {
    id: '5',
    title: 'Waterfront Condo',
    address: '654 Lake Dr, Austin, TX 78705',
    price: 850000,
    beds: 3,
    baths: 2,
    size: 1800,
    featured: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-5c9a0c9a0c9a?w=800&h=600&fit=crop',
    ],
    description: 'Stunning waterfront condo with lake views, balcony, and resort-style amenities.',
    yearBuilt: 2019,
    lotSize: 0.05,
    propertyType: 'Condo',
    status: 'For Sale',
    features: [
      'Lake views',
      'Balcony',
      'Resort-style amenities',
      'High-end finishes',
      'Central AC',
      'Hardwood floors',
      'Modern kitchen',
      'Walk-in closets'
    ],
    agent: {
      name: 'Lisa Thompson',
      phone: '(512) 555-0654',
      email: 'lisa.thompson@realestate.com',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    amenities: [
      'Pool',
      'Gym',
      'Spa',
      'Boat dock',
      'Security'
    ]
  },
  {
    id: '6',
    title: 'Historic Victorian',
    address: '987 Heritage Ln, Austin, TX 78706',
    price: 1200000,
    beds: 5,
    baths: 4,
    size: 3500,
    featured: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    description: 'Magnificent Victorian home with original details, grand staircase, and carriage house.',
    yearBuilt: 1890,
    lotSize: 0.5,
    propertyType: 'Single Family',
    status: 'For Sale',
    features: [
      'Original details',
      'Grand staircase',
      'Carriage house',
      'High ceilings',
      'Period features',
      'Large rooms',
      'Historic charm',
      'Mature landscaping'
    ],
    agent: {
      name: 'Robert Wilson',
      phone: '(512) 555-0987',
      email: 'robert.wilson@realestate.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    amenities: [
      'Historic features',
      'Large lot',
      'Carriage house',
      'Mature trees'
    ]
  },
  {
    id: '7',
    title: 'Modern Loft',
    address: '147 Industrial Blvd, Austin, TX 78707',
    price: 520000,
    beds: 1,
    baths: 1,
    size: 900,
    featured: false,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-5c9a0c9a0c9a?w=800&h=600&fit=crop',
    ],
    description: 'Industrial-chic loft with exposed brick, high ceilings, and urban location.',
    yearBuilt: 2017,
    lotSize: 0.08,
    propertyType: 'Loft',
    status: 'For Sale',
    features: [
      'Exposed brick',
      'High ceilings',
      'Urban location',
      'Industrial design',
      'Open floor plan',
      'Modern fixtures',
      'City views',
      'Concrete floors'
    ],
    agent: {
      name: 'Jessica Martinez',
      phone: '(512) 555-0147',
      email: 'jessica.martinez@realestate.com',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    amenities: [
      'Urban location',
      'Industrial design',
      'City access',
      'Modern amenities'
    ]
  },
  {
    id: '8',
    title: 'Suburban Ranch',
    address: '258 Country Rd, Austin, TX 78708',
    price: 680000,
    beds: 3,
    baths: 2,
    size: 2200,
    featured: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    description: 'Spacious ranch-style home with large lot, mature trees, and peaceful setting.',
    yearBuilt: 2005,
    lotSize: 0.4,
    propertyType: 'Single Family',
    status: 'For Sale',
    features: [
      'Large lot',
      'Mature trees',
      'Peaceful setting',
      'Ranch style',
      'Single level',
      'Open layout',
      'Covered patio',
      'Landscaped yard'
    ],
    agent: {
      name: 'Thomas Anderson',
      phone: '(512) 555-0258',
      email: 'thomas.anderson@realestate.com',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    amenities: [
      'Large lot',
      'Mature landscaping',
      'Peaceful location',
      'Single level living'
    ]
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (USE_MOCKS) {
    try {
      const { id } = params;

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));

      // Find the property by ID
      const property = mockProperties.find(p => p.id === id);

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      // Find similar properties (same property type, similar price range)
      const similarProperties = mockProperties
        .filter(p => 
          p.id !== id && 
          p.propertyType === property.propertyType &&
          Math.abs(p.price - property.price) / property.price < 0.3
        )
        .slice(0, 4);

      return NextResponse.json({
        property,
        similarProperties
      });

    } catch (error) {
      console.error('Error fetching property details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch property details' },
        { status: 500 }
      );
    }
  } else {
    // Real API implementation would go here
    return NextResponse.json(
      { error: 'Real API not implemented yet' },
      { status: 501 }
    );
  }
}