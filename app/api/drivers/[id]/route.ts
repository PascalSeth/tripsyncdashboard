// app/api/drivers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();

    let endpoint = '';
    if (body.action === 'verify') {
      endpoint = `/api/drivers/${id}/verify`;
    } else if (body.action === 'suspend') {
      endpoint = `/api/drivers/${id}/suspend`;
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid action"
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Driver action response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || `Driver ${body.action}d successfully`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || `Failed to ${body.action} driver`
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Driver action error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    const response = await fetch(`${process.env.API_URL}/api/drivers/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Driver deletion response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Driver deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to delete driver"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Driver deletion error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}