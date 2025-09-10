// app/api/stores/[storeId]/low-stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET - Fetch low stock products
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threshold = searchParams.get('threshold') || '10';

    // Validate threshold
    if (isNaN(parseInt(threshold)) || parseInt(threshold) < 0) {
      return NextResponse.json({
        success: false,
        error: "Threshold must be a non-negative number"
      }, { status: 400 });
    }

    const queryParams = new URLSearchParams({
      threshold
    });

    const response = await fetch(`${process.env.API_URL}/api/stores/${params.storeId}/low-stock?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Low stock products fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Low stock products retrieved successfully",
        data: data.data || []
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch low stock products"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Low stock products API error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}