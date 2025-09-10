// app/api/store-owner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - Fetch all store owners
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const businessType = searchParams.get('businessType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build query parameters for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      order,
      ...(search && { search }),
      ...(status && status !== 'all' && { status }),
      ...(businessType && businessType !== 'all' && { businessType })
    });

    // Match your backend route: /stores/owners/all
    const response = await fetch(`${process.env.API_URL}/api/stores/owners/all?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Store owners fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data || [],
        pagination: data.pagination || {
          currentPage: parseInt(page),
          totalPages: Math.ceil((data.count || 0) / parseInt(limit)),
          totalItems: data.count || 0,
          itemsPerPage: parseInt(limit)
        },
        count: data.count
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to fetch store owners",
        data: []
      }, { status: response.status || 500 });
    }
  } catch (error) {
    console.error("Store owners API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      data: []
    }, { status: 500 });
  }
}

// POST - Store owner onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Match your backend route: /stores/owners/onboard
    const response = await fetch(`${process.env.API_URL}/api/stores/owners/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Store owner onboarding response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Store owner onboarded successfully"
      }, { status: 201 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to onboard store owner" 
      }, { status: response.status || 500 });
    }
  } catch (error) {
    console.error("Store owner onboarding error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}