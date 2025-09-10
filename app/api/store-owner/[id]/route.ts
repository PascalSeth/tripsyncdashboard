// app/api/store-owner/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Get store owner profile (if needed for individual store owner)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    // This would need a new backend endpoint or you could fetch from the list
    // For now, returning error as there's no specific GET endpoint for single owner
    return NextResponse.json({ 
      success: false, 
      error: "Single store owner fetch not implemented in backend" 
    }, { status: 501 });

  } catch (error) {
    console.error("Store owner fetch error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// PUT - Update store owner (verify/reject/status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Determine the action based on the request body
    let endpoint = '';
    let method = 'PUT';
    
    if (body.hasOwnProperty('isApproved')) {
      // Handle approval/rejection
      if (body.isApproved) {
        endpoint = `${process.env.API_URL}/api/stores/owners/${params.id}/verify`;
        // For verify endpoint, we typically don't send body data
        delete body.isApproved;
      } else {
        endpoint = `${process.env.API_URL}/api/stores/owners/${params.id}/reject`;
        // For reject, you might need to send a reason
        if (!body.reason) {
          body.reason = "Rejected by admin";
        }
      }
    } else {
      // This would be for general profile updates
      // Your backend has /stores/owners/profile but it's for the authenticated user
      // You might need a new endpoint for admin updates
      return NextResponse.json({ 
        success: false, 
        error: "General store owner updates not implemented in backend" 
      }, { status: 501 });
    }

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message || "Store owner updated successfully"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to update store owner"
      }, { status: response.status || 500 });
    }
  } catch (error) {
    console.error("Store owner update error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// DELETE - Delete store owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    // Your backend doesn't have a delete store owner endpoint
    // You might need to add one or use a different approach
    return NextResponse.json({ 
      success: false, 
      error: "Delete store owner not implemented in backend" 
    }, { status: 501 });

  } catch (error) {
    console.error("Store owner delete error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}