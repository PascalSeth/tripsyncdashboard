// app/api/places/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if user has appropriate role
    if (!['SUPER_ADMIN', 'CITY_ADMIN', 'PLACE_OWNER'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(categoryId && { categoryId }),
      ...(search && { search })
    });

    const response = await fetch(`${process.env.API_URL}/api/places?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Places fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination,
        message: data.message || "Places retrieved successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to fetch places"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Places API error:", error);
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

    // Check if user has appropriate role
    if (!['SUPER_ADMIN', 'CITY_ADMIN', 'PLACE_OWNER'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    // Check Content-Type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';

    let body: any;
    let headers: Record<string, string>;
    let requestBody: string | FormData;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await request.formData();
      console.log("Received FormData with keys:", Array.from(formData.keys()));

      // Convert FormData to JSON for the backend API
      const formDataObject: Record<string, any> = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // For files, we'll need to handle them differently
          // For now, let's log what we have
          console.log(`File field: ${key}, filename: ${value.name}, size: ${value.size}`);
          formDataObject[key] = value;
        } else {
          formDataObject[key] = value;
        }
      }

      // For file uploads, we need to forward the FormData as-is
      headers = {
        "Authorization": `Bearer ${session.token}`
        // Don't set Content-Type for FormData - let fetch set it automatically
      };
      requestBody = formData;
      body = formDataObject; // For logging purposes
    } else {
      // Handle JSON
      body = await request.json();
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      };
      requestBody = JSON.stringify(body);
    }

    console.log("Parsed request body:", body);

    const response = await fetch(`${process.env.API_URL}/api/places`, {
      method: "POST",
      headers,
      body: requestBody
    });

    const data = await response.json();
    console.log("Place creation response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Place created successfully"
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to create place"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Place creation error:", error);
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

    // Check if user has appropriate role
    if (!['SUPER_ADMIN', 'CITY_ADMIN', 'PLACE_OWNER'].includes(session.user.role)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient permissions"
      }, { status: 403 });
    }

    // Check Content-Type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';

    let body: any;
    let id: string;
    let headers: Record<string, string>;
    let requestBody: string | FormData;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await request.formData();
      console.log("Received FormData for update with keys:", Array.from(formData.keys()));

      // Extract ID from FormData
      id = formData.get('id') as string;
      if (!id) {
        return NextResponse.json({
          success: false,
          error: "Place ID is required"
        }, { status: 400 });
      }

      // Remove id from formData before sending
      const formDataToSend = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key !== 'id') {
          formDataToSend.append(key, value);
        }
      }

      headers = {
        "Authorization": `Bearer ${session.token}`
      };
      requestBody = formDataToSend;
      body = Object.fromEntries(formData.entries()); // For logging
    } else {
      // Handle JSON
      body = await request.json();
      id = body.id;
      const { id: _, ...updateData } = body;

      if (!id) {
        return NextResponse.json({
          success: false,
          error: "Place ID is required"
        }, { status: 400 });
      }

      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      };
      requestBody = JSON.stringify(updateData);
    }

    console.log("Parsed update request body:", body);

    const response = await fetch(`${process.env.API_URL}/api/places/${id}`, {
      method: "PUT",
      headers,
      body: requestBody
    });

    const data = await response.json();
    console.log("Place update response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Place updated successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to update place"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Place update error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}