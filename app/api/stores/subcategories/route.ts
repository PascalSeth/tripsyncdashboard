import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// GET - Fetch all subcategories
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
    const category = searchParams.get("category") || ""

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category }),
    })

    const response = await fetch(`${process.env.API_URL}/api/stores/subcategories?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })

    const data = await response.json()
    console.log("Subcategories fetch response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Subcategories retrieved successfully",
        data: data.data,
        pagination: data.pagination,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to fetch subcategories",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Subcategories API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new subcategory
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
    let categoryId: string
    let image: File | null = null

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData request
      const formData = await request.formData()
      name = formData.get("name") as string
      description = formData.get("description") as string
      categoryId = formData.get("categoryId") as string
      image = formData.get("image") as File | null
    } else {
      // Handle JSON request
      const body = await request.json()
      name = body.name
      description = body.description
      categoryId = body.categoryId
      // Note: JSON requests cannot include files
    }

    console.log("Received subcategory data:", {
      name: name || "(missing)",
      description: description || "(missing)",
      categoryId: categoryId || "(missing)",
      hasImage: !!image,
      imageSize: image?.size || 0,
      contentType,
    })

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory name is required",
        },
        { status: 400 },
      )
    }

    if (!categoryId || !categoryId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    const backendFormData = new FormData()
    backendFormData.append("name", name.trim())
    backendFormData.append("categoryId", categoryId.trim())
    if (description && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/subcategories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: backendFormData,
    })

    const data = await response.json()
    console.log("Subcategory creation response:", data)

    if (data.success) {
      return NextResponse.json(
        {
          success: true,
          message: data.message || "Subcategory created successfully",
          data: data.data,
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to create subcategory",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Subcategory creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}