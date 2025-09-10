import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

// PUT - Update existing category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
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

    const { categoryId } = await params
    console.log("PUT Category - Extracted categoryId:", categoryId)
    console.log("PUT Category - Params object:", await params)

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
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
      storeTypes = body.storeTypes
      // Note: JSON requests cannot include files
    }

    // Validate required fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name cannot be empty",
        },
        { status: 400 },
      )
    }

    if (storeTypes !== undefined && (!Array.isArray(storeTypes) || storeTypes.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "storeTypes must be a non-empty array",
        },
        { status: 400 },
      )
    }

    // Validate store types if provided
    if (storeTypes && storeTypes.length > 0) {
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
    }

    const backendFormData = new FormData()
    if (name !== undefined) backendFormData.append("name", name.trim())
    if (storeTypes !== undefined) backendFormData.append("storeTypes", JSON.stringify(storeTypes))
    if (description !== undefined && description.trim()) {
      backendFormData.append("description", description.trim())
    }
    if (image && image.size > 0) {
      backendFormData.append("image", image)
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/categories/${categoryId}`, {
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

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
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

    const { categoryId } = await params
    console.log("DELETE Category - Extracted categoryId:", categoryId)
    console.log("DELETE Category - Params object:", await params)

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    })

    const data = await response.json()
    console.log("Category delete response:", data)

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
    console.error("Category delete error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}