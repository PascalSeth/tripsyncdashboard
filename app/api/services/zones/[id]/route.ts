// app/api/services/zones/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// DELETE - Delete service zone
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if user has admin role
    if (!['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Service zone ID is required"
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/services/zones/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Service zone deletion response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Service zone deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to delete service zone"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Service zone deletion error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}