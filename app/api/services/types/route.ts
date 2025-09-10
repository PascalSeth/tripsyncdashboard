// app/api/services/types/route.ts
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
    if (!['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const queryParams = new URLSearchParams({
      page,
      limit
    });

    const response = await fetch(`${process.env.API_URL}/api/services/types?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Service types fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination,
        message: data.message || "Service types retrieved successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch service types"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Service types API error:", error);
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
    if (!['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || ""
    let name: string
    let description: string
    let image: File | null = null

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await request.formData()
      name = formData.get("name") as string
      description = formData.get("description") as string
      image = formData.get("image") as File | null
    } else {
      // Handle JSON request
      const body = await request.json()
      name = body.name
      description = body.description
    }

    console.log("Received service type data:", {
      name: name || "(missing)",
      description: description || "(missing)",
      hasImage: !!image,
      imageSize: image?.size || 0,
      contentType,
    })

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: "Service type name is required"
      }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("name", name.trim())
    if (description && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/services/types`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.token}`
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: backendFormData
    });

    const data = await response.json();
    console.log("Service type creation response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Service type created successfully"
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to create service type"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Service type creation error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

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

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

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

export async function PUT(request: NextRequest) {
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

    const contentType = request.headers.get("content-type") || ""
    let id: string
    let name: string
    let description: string
    let image: File | null = null

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await request.formData()
      id = formData.get("id") as string
      name = formData.get("name") as string
      description = formData.get("description") as string
      image = formData.get("image") as File | null
    } else {
      // Handle JSON request
      const body = await request.json()
      id = body.id
      name = body.name
      description = body.description
    }

    // Validate required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Service type ID is required"
      }, { status: 400 })
    }

    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: "Service type name is required"
      }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("name", name.trim())
    if (description && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/services/types/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${session.token}`
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: backendFormData
    });

    const data = await response.json();
    console.log("Service type update response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Service type updated successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to update service type"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Service type update error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}