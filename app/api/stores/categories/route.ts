import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "50"
    const search = searchParams.get("search") || ""
    const storeType = searchParams.get("storeType") || ""

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(storeType && { storeType }),
    })

    const response = await fetch(`${process.env.API_URL}/api/stores/categories?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })

    const data = await response.json()
    console.log("Categories fetch response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        pagination: data.pagination,
        count: data.count,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to fetch categories",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const contentType = request.headers.get("content-type") || ""
    let name: string
    let description: string
    let storeTypes: string[]
    let image: File | null = null

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await request.formData()
      name = formData.get("name") as string
      description = formData.get("description") as string
      // Handle multiple storeTypes form fields
      const storeTypesValues = formData.getAll("storeTypes") as string[]
      storeTypes = storeTypesValues.length > 0 ? storeTypesValues : []
      image = formData.get("image") as File | null
    } else {
      // Handle JSON request
      const body = await request.json()
      name = body.name
      description = body.description
      storeTypes = body.storeTypes || []
      // Note: JSON requests cannot include files
    }

    console.log("Received category data:", {
      name: name || "(missing)",
      description: description || "(missing)",
      storeTypes: storeTypes || "(missing)",
      hasImage: !!image,
      imageSize: image?.size || 0,
      contentType,
    })

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 },
      )
    }

    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "storeTypes is required and must be a non-empty array",
        },
        { status: 400 },
      )
    }

    // Validate store types
    const validStoreTypes = ["GROCERY", "PHARMACY", "RESTAURANT", "RETAIL", "ELECTRONICS", "OTHER"]
    const invalidTypes = storeTypes.filter(type => !validStoreTypes.includes(type))
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid store type: ${invalidTypes.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const backendFormData = new FormData()
    backendFormData.append("name", name.trim())
    backendFormData.append("storeTypes", JSON.stringify(storeTypes))
    if (description && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: backendFormData,
    })

    const data = await response.json()
    console.log("Category creation response:", data)

    if (data.success) {
      return NextResponse.json(
        {
          success: true,
          data: data.data,
          message: data.message || "Category created successfully",
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to create category",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Category creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update existing category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const contentType = request.headers.get("content-type") || ""
    let id: string
    let name: string
    let description: string
    let storeTypes: string[]
    let image: File | null = null

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await request.formData()
      id = formData.get("id") as string
      name = formData.get("name") as string
      description = formData.get("description") as string
      // Handle multiple storeTypes form fields
      const storeTypesValues = formData.getAll("storeTypes") as string[]
      storeTypes = storeTypesValues.length > 0 ? storeTypesValues : []
      image = formData.get("image") as File | null
    } else {
      // Handle JSON request
      const body = await request.json()
      id = body.id
      name = body.name
      description = body.description
      storeTypes = body.storeTypes || []
      // Note: JSON requests cannot include files
    }

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 },
      )
    }

    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "storeTypes is required and must be a non-empty array",
        },
        { status: 400 },
      )
    }

    // Validate store types
    const validStoreTypes = ["GROCERY", "PHARMACY", "RESTAURANT", "RETAIL", "ELECTRONICS", "OTHER"]
    const invalidTypes = storeTypes.filter(type => !validStoreTypes.includes(type))
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid store type: ${invalidTypes.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const backendFormData = new FormData()
    backendFormData.append("name", name.trim())
    backendFormData.append("storeTypes", JSON.stringify(storeTypes))
    if (description && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/categories/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: backendFormData,
    })

    const data = await response.json()
    console.log("Category update response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Category updated successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to update category",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Category update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Remove category
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })

    const data = await response.json()
    console.log("Category deletion response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Category deleted successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to delete category",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Category deletion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}