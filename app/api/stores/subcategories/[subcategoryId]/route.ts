import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

// PUT - Update existing subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) {
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

    const { subcategoryId } = await params

    if (!subcategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory ID is required",
        },
        { status: 400 },
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

    // Validate required fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory name cannot be empty",
        },
        { status: 400 },
      )
    }

    if (categoryId !== undefined && (!categoryId || !categoryId.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID cannot be empty",
        },
        { status: 400 },
      )
    }

    const backendFormData = new FormData()
    if (name !== undefined) backendFormData.append("name", name.trim())
    if (categoryId !== undefined) backendFormData.append("categoryId", categoryId.trim())
    if (description !== undefined && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/subcategories/${subcategoryId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: backendFormData,
    })

    const data = await response.json()
    console.log("Subcategory update response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Subcategory updated successfully",
        data: data.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to update subcategory",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Subcategory update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) {
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

    const { subcategoryId } = await params

    if (!subcategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Subcategory ID is required",
        },
        { status: 400 },
      )
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/subcategories/${subcategoryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })

    const data = await response.json()
    console.log("Subcategory delete response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Subcategory deleted successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to delete subcategory",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Subcategory delete error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}