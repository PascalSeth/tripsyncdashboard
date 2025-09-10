// app/api/stores/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Fetch specific store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Store ID is required" 
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Store fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to fetch store" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Store fetch error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// PUT - Update existing store
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Store ID is required" 
      }, { status: 400 });
    }

    const formData = await request.formData();

    // Debug: Log all received form data
    console.log('=== BACKEND: Received FormData for store update ===');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Extract form data
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const description = formData.get('description') as string;
    const businessHours = formData.get('businessHours') as string;
    const imageFile = formData.get('image') as File;

    // Debug: Log parsed business hours
    if (businessHours) {
      try {
        const parsedBusinessHours = JSON.parse(businessHours);
        console.log('Parsed businessHours:', parsedBusinessHours);
      } catch (error) {
        console.log('Error parsing businessHours:', error);
      }
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Store name is required" 
      }, { status: 400 });
    }

    if (!type || !type.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Store type is required" 
      }, { status: 400 });
    }

    if (!latitude || !longitude) {
      return NextResponse.json({ 
        success: false, 
        error: "Location coordinates are required" 
      }, { status: 400 });
    }

    if (!address || !address.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Address is required" 
      }, { status: 400 });
    }

    // Create FormData for backend API
    const backendFormData = new FormData();
    backendFormData.append('name', name);
    backendFormData.append('type', type);
    backendFormData.append('latitude', latitude);
    backendFormData.append('longitude', longitude);
    backendFormData.append('address', address);
    
    if (city) backendFormData.append('city', city);
    if (state) backendFormData.append('state', state);
    if (zipCode) backendFormData.append('zipCode', zipCode);
    if (phone) backendFormData.append('phone', phone);
    if (email) backendFormData.append('email', email);
    if (description) backendFormData.append('description', description);
    if (businessHours) backendFormData.append('businessHours', businessHours);
    if (imageFile && imageFile.size > 0) {
      backendFormData.append('image', imageFile);
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${session.token}`
      },
      body: backendFormData
    });

    const data = await response.json();
    console.log("Store update response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Store updated successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to update store" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Store update error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// DELETE - Remove store
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Store ID is required" 
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Store deletion response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Store deleted successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to delete store" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Store deletion error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}