// app/api/emergency/responders/route.ts
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
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status })
    });

    const response = await fetch(`${process.env.API_URL}/api/emergency/responders?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Emergency responders fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination,
        message: data.message || "Emergency responders retrieved successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch emergency responders"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Emergency responders API error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const response = await fetch(`${process.env.API_URL}/api/emergency/responders/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Emergency responder onboard response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Emergency responder onboarded successfully"
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to onboard emergency responder"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Emergency responder onboard error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}