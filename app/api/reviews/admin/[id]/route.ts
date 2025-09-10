// app/api/reviews/admin/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const body = await request.json();

    if (!body.action) {
      return NextResponse.json({
        success: false,
        error: "Action is required"
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/reviews/admin/${id}/moderate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify({ action: body.action, reason: body.reason })
    });

    const data = await response.json();
    console.log("Review moderation response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Review moderated successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to moderate review"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Review moderation error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}