// app/api/places/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Fetch single place by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const response = await fetch(`${process.env.API_URL}/api/places/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log(`Place ${id} fetch response:`, data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Place not found"
      }, { status: response.status });
    }
  } catch (error) {
    console.error(`Place ${id} fetch error:`, error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

// PUT - Update place by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.API_URL}/api/places/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log(`Place ${id} update response:`, data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to update place"
      }, { status: response.status });
    }
  } catch (error) {
    console.error(`Place ${id} update error:`, error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

// DELETE - Delete place by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const response = await fetch(`${process.env.API_URL}/api/places/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log(`Place ${id} delete response:`, data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Place deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to delete place"
      }, { status: response.status });
    }
  } catch (error) {
    console.error(`Place ${id} delete error:`, error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}