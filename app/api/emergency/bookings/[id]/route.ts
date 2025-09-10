// app/api/emergency/bookings/[id]/route.ts
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

    const { id } = params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({
        success: false,
        error: "Status is required"
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/emergency/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify({ status: body.status })
    });

    const data = await response.json();
    console.log("Emergency booking status update response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Emergency booking status updated successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to update emergency booking status"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Emergency booking status update error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const { id } = params;

    const response = await fetch(`${process.env.API_URL}/api/emergency/bookings/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Emergency booking deletion response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Emergency booking deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to delete emergency booking"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Emergency booking deletion error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}