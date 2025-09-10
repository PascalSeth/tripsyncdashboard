// app/api/services/types/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// DELETE - Delete service type
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
        error: "Service type ID is required"
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/services/types/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Service type deletion response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Service type deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to delete service type"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Service type deletion error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}