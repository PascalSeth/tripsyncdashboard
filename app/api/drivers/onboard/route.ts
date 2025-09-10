// app/api/drivers/onboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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

    const response = await fetch(`${process.env.API_URL}/api/drivers/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Driver onboard response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Driver onboarded successfully"
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to onboard driver"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Driver onboard error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}