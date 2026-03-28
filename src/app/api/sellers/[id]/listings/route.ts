import { NextRequest, NextResponse } from 'next/server';

// GET /api/sellers/:id/listings - Get seller's listings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sellerId = params.id;
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  try {
    const response = await fetch(`${backendApiUrl}/sellers/${sellerId}/listings`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw backend response:", data); // Added console log for debugging

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching data from backend:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}