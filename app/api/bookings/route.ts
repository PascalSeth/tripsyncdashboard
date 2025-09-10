// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(serviceType && { serviceType }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      include: 'serviceType,customer,provider'
    });

    const response = await fetch(`${process.env.API_URL}/api/bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Bookings fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination,
        message: data.message || "Bookings retrieved successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch bookings"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Bookings API error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}