// app/api/places/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const order = searchParams.get('order') || 'asc';

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      order,
      ...(search && { search }),
      ...(status && { status })
    });

    const response = await fetch(`${process.env.API_URL}/api/places/categories/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Categories fetch response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination,
        count: data.count
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to fetch categories" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields on frontend before sending
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Category name is required" 
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/places/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Category creation response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Category created successfully"
      }, { status: 201 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to create category" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// PUT - Update existing category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Category ID is required" 
      }, { status: 400 });
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Category name is required" 
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/places/categories/${body.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Category update response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Category updated successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to update category" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// DELETE - Remove category
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Category ID is required" 
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/places/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();
    console.log("Category deletion response:", data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Category deleted successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to delete category" 
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}