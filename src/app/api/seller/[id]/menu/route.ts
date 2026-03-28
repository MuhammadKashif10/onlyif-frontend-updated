import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/:id/menu
export async function GET(
  request: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    const sellerId = params._id;
    
    // In a real application, you would:
    // 1. Verify the seller's authentication
    // 2. Check if the seller has access to this menu
    // 3. Fetch menu configuration from database based on seller's permissions/role
    
    // For now, returning the standard seller menu configuration
    const menuConfig = {
      menu: [
        {
          label: "Dashboard",
          path: "/dashboards/seller",
          icon: "Home"
        },
        {
          label: "My Listings",
          path: "/dashboards/seller/listings",
          icon: "Building"
        },
        {
          label: "Offers",
          path: "/dashboards/seller/offers",
          icon: "FileText"
        },
        {
          label: "Analytics",
          path: "/dashboards/seller/analytics",
          icon: "BarChart3"
        },
        {
          label: "Account Settings",
          path: "/dashboards/seller/account",
          icon: "Settings"
        }
      ]
    };

    return NextResponse.json(menuConfig);
  } catch (error) {
    console.error('Error fetching seller menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu configuration' },
      { status: 500 }
    );
  }
}