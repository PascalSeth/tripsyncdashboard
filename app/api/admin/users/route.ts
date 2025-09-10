// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if user has admin role
    if (!['SUPER_ADMIN', 'CITY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '';
    const limit = searchParams.get('limit') || '';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') || '';

    // Build query parameters for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      sortOrder,
      ...(type && { type }),
      ...(search && { search }),
      ...(status && { status })
    });

    // Use the appropriate backend endpoint based on type
    let backendUrl = `${process.env.API_URL}/api/admin/users`;
    if (type === 'DRIVER') {
      backendUrl = `${process.env.API_URL}/api/drivers/all`;
    } else if (type === 'TAXI_DRIVER') {
      backendUrl = `${process.env.API_URL}/api/taxi-drivers/all`;
    } else if (type === 'STORE_OWNER') {
      backendUrl = `${process.env.API_URL}/api/stores/owners/all`;
    } else if (type === 'USER') {
      backendUrl = `${process.env.API_URL}/api/admin/users`;
    } else if (type === 'DISPATCHER') {
      backendUrl = `${process.env.API_URL}/api/dispatchers/all`;
    } else if (type === 'PLACE_OWNER') {
      backendUrl = `${process.env.API_URL}/api/places/owners/all`;
    } else if (type === 'EMERGENCY_RESPONDER') {
      backendUrl = `${process.env.API_URL}/api/emergency/responders/all`;
    }

    const response = await fetch(`${backendUrl}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Users fetch response:", data);

    if (data.success) {
      // The backend already returns the correct structure, just pass it through
      // with updated filters to reflect the current request
      const responseData = {
        success: true,
        message: data.message || "Users retrieved successfully",
        data: {
          ...data.data,
          filters: {
            type: type || null,
            search: search || null,
            status: status || null
          }
        }
      };

      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch users"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}