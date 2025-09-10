// app/api/drivers/earnings/route.ts
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

    // Check if user has appropriate role (driver or admin)
    if (!['SUPER_ADMIN', 'CITY_ADMIN', 'DRIVER'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const driverId = searchParams.get('driverId');

    const queryParams = new URLSearchParams();
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (driverId) queryParams.append('driverId', driverId);

    const response = await fetch(`${process.env.API_URL}/api/drivers/earnings?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Drivers earnings fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Drivers earnings retrieved successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch drivers earnings"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Drivers earnings API error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}