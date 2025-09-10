import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

// PUT - Update business hours for a specific store
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Store ID is required",
        },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { businessHours } = body

    // Validate business hours format
    if (!businessHours || !Array.isArray(businessHours)) {
      return NextResponse.json(
        {
          success: false,
          error: "businessHours must be an array",
        },
        { status: 400 },
      )
    }

    // Validate each business hour entry
    for (const hours of businessHours) {
      if (typeof hours.dayOfWeek !== 'number' || hours.dayOfWeek < 0 || hours.dayOfWeek > 6) {
        return NextResponse.json(
          {
            success: false,
            error: "dayOfWeek must be a number between 0 and 6",
          },
          { status: 400 },
        )
      }

      if (!hours.openTime || !hours.closeTime) {
        return NextResponse.json(
          {
            success: false,
            error: "openTime and closeTime are required for each business hour entry",
          },
          { status: 400 },
        )
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(hours.openTime) || !timeRegex.test(hours.closeTime)) {
        return NextResponse.json(
          {
            success: false,
            error: "openTime and closeTime must be in HH:MM format",
          },
          { status: 400 },
        )
      }
    }

    const response = await fetch(`${process.env.API_URL}/api/stores/${id}/business-hours`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ businessHours }),
    })

    const data = await response.json()
    console.log("Business hours update response:", data)

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Business hours updated successfully",
        data: data.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to update business hours",
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("Business hours update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}