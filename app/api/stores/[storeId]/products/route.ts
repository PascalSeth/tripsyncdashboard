// app/api/stores/[storeId]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET - Fetch products for a specific store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json({
        success: false,
        message: "Store ID is required"
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const subcategoryId = searchParams.get('subcategoryId') || '';
    const inStock = searchParams.get('inStock') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category }),
      ...(subcategoryId && { subcategoryId }),
      ...(inStock && { inStock })
    });

    const response = await fetch(`${process.env.API_URL}/api/stores/${storeId}/products?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Products retrieved successfully",
        data: data.data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to fetch products"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process request",
      error: "Internal server error"
    }, { status: 500 });
  }
}

// POST - Add new product to a store
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

    // Check user role (assuming session.user.role exists)
    const userRole = (session.user as any)?.role;
    if (!userRole || !['STORE_OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized to perform this action"
      }, { status: 403 });
    }

    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json({
        success: false,
        message: "Store ID is required"
      }, { status: 400 });
    }

    const formData = await request.formData();

    // Debug: log incoming multipart form-data (fields + files)
    try {
      const incoming: any[] = [];
      for (const [key, value] of (formData as any).entries()) {
        // File may not be defined in some runtimes; guard accordingly
        if (typeof File !== 'undefined' && value instanceof File) {
          incoming.push({ key, type: 'File', name: value.name, size: value.size, mime: value.type });
        } else {
          incoming.push({ key, value: String(value) });
        }
      }
      console.log('Products API POST -> incoming formData', incoming);
    } catch (e) {
      console.warn('Products API POST -> incoming formData debug failed', e);
    }

    // Extract form data
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const subcategoryId = formData.get('subcategoryId') as string;
    const inStock = formData.get('inStock') as string;
    const stockQuantity = formData.get('stockQuantity') as string;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "name", message: "Product name is required" }]
      }, { status: 400 });
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "price", message: "Price must be a positive number" }]
      }, { status: 400 });
    }

    if (!categoryId || !categoryId.trim()) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "categoryId", message: "Category ID is required" }]
      }, { status: 400 });
    }

    if (stockQuantity && (isNaN(parseInt(stockQuantity)) || parseInt(stockQuantity) < 0)) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "stockQuantity", message: "Stock quantity must be a non-negative number" }]
      }, { status: 400 });
    }

    // Validate images (max 5, supported formats, max 5MB each)
    if (images && images.length > 5) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "images", message: "Maximum 5 images allowed" }]
      }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (images) {
      for (const image of images) {
        if (!allowedTypes.includes(image.type)) {
          return NextResponse.json({
            success: false,
            message: "Validation failed",
            errors: [{ field: "images", message: `Unsupported file type: ${image.type}` }]
          }, { status: 400 });
        }
        if (image.size > maxSize) {
          return NextResponse.json({
            success: false,
            message: "Validation failed",
            errors: [{ field: "images", message: "Image size must be less than 5MB" }]
          }, { status: 400 });
        }
      }
    }

    // Create FormData for backend API
    const backendFormData = new FormData();
    backendFormData.append('name', name);
    backendFormData.append('price', price);
    backendFormData.append('categoryId', categoryId);
  
    if (description) backendFormData.append('description', description);
    if (subcategoryId) backendFormData.append('subcategoryId', subcategoryId);
    if (inStock) backendFormData.append('inStock', inStock);
    if (stockQuantity) backendFormData.append('stockQuantity', stockQuantity);
  
    if (images) {
      images.forEach((image, index) => {
        backendFormData.append('images', image);
      });
    }

    // Debug: log outgoing payload that will be sent to backend
    try {
      const outgoing: any[] = [];
      for (const [key, value] of (backendFormData as any).entries()) {
        if (typeof File !== 'undefined' && value instanceof File) {
          outgoing.push({ key, type: 'File', name: value.name, size: value.size, mime: value.type });
        } else {
          outgoing.push({ key, value: String(value) });
        }
      }
      console.log('Products API POST -> outgoing backendFormData', outgoing);
    } catch (e) {
      console.warn('Products API POST -> outgoing backendFormData debug failed', e);
    }
  
    const response = await fetch(`${process.env.API_URL}/api/stores/${storeId}/products`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.token}`
      },
      body: backendFormData
    });

    // Debug: backend raw response body (first 2KB)
    try {
      const responseClone = response.clone();
      const raw = await responseClone.text();
      console.log('Products API POST -> backend response', { status: response.status, body: raw?.slice(0, 2000) });
    } catch (e) {
      console.warn('Products API POST -> response debug failed', e);
    }

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Product added successfully",
        data: data.data
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to add product"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process request",
      error: "Internal server error"
    }, { status: 500 });
  }
}