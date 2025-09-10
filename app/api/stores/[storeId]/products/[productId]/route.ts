// app/api/stores/[storeId]/products/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";

// PUT - Update existing product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

    // Check user role
    const userRole = (session.user as any)?.role;
    if (!userRole || !['STORE_OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized to perform this action"
      }, { status: 403 });
    }

    const { storeId, productId } = await params;

    if (!storeId || !productId) {
      return NextResponse.json({
        success: false,
        message: "Store ID and Product ID are required"
      }, { status: 400 });
    }

    const formData = await request.formData();

    // Debug: log incoming multipart form-data (fields + files)
    try {
      const incoming: any[] = [];
      for (const [key, value] of (formData as any).entries()) {
        if (typeof File !== 'undefined' && value instanceof File) {
          incoming.push({ key, type: 'File', name: value.name, size: value.size, mime: value.type });
        } else {
          incoming.push({ key, value: String(value) });
        }
      }
      console.log('Products API PUT -> incoming formData', incoming);
    } catch (e) {
      console.warn('Products API PUT -> incoming formData debug failed', e);
    }

    // Extract form data (all optional for update)
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const subcategoryId = formData.get('subcategoryId') as string;
    const inStock = formData.get('inStock') as string;
    const stockQuantity = formData.get('stockQuantity') as string;
    const images = formData.getAll('images') as File[];

    // Validate fields if provided
    if (price && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "price", message: "Price must be a positive number" }]
      }, { status: 400 });
    }

    if (stockQuantity && (isNaN(parseInt(stockQuantity)) || parseInt(stockQuantity) < 0)) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "stockQuantity", message: "Stock quantity must be a non-negative number" }]
      }, { status: 400 });
    }

    // Validate images if provided
    if (images && images.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

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
    if (name) backendFormData.append('name', name);
    if (price) backendFormData.append('price', price);
    if (categoryId) backendFormData.append('categoryId', categoryId);
    if (description) backendFormData.append('description', description);
    if (subcategoryId) backendFormData.append('subcategoryId', subcategoryId);
    if (inStock) backendFormData.append('inStock', inStock);
    if (stockQuantity) backendFormData.append('stockQuantity', stockQuantity);

    if (images && images.length > 0) {
      images.forEach((image) => {
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
      console.log('Products API PUT -> outgoing backendFormData', outgoing);
    } catch (e) {
      console.warn('Products API PUT -> outgoing backendFormData debug failed', e);
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/${storeId}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${session.token}`
      },
      body: backendFormData
    });

    // Debug: backend raw response body (first 2KB)
    try {
      const responseClone = response.clone();
      const raw = await responseClone.text();
      console.log('Products API PUT -> backend response', { status: response.status, body: raw?.slice(0, 2000) });
    } catch (e) {
      console.warn('Products API PUT -> response debug failed', e);
    }
  
    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Product updated successfully",
        data: data.data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to update product"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process request",
      error: "Internal server error"
    }, { status: 500 });
  }
}

// DELETE - Remove product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

    // Check user role
    const userRole = (session.user as any)?.role;
    if (!userRole || !['STORE_OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized to perform this action"
      }, { status: 403 });
    }

    const { storeId, productId } = await params;

    if (!storeId || !productId) {
      return NextResponse.json({
        success: false,
        message: "Store ID and Product ID are required"
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/${storeId}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Product deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to delete product"
      }, { status: response.status });
    }
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process request",
      error: "Internal server error"
    }, { status: 500 });
  }
}