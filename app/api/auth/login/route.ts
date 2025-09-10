import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Your existing login logic here
    // This should return a response with the token
    
    const response = await fetch(`${process.env.API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    console.log("Backend response:", data)
    
    if (data.success && data.data) {
      // Extract the nested data structure
      const { user, token } = data.data
      
      return NextResponse.json({
        success: true,
        data: {
          token: token,
          user: user
        }
      })
    } else {
      // Return the error message from backend if available
      return NextResponse.json({ 
        success: false, 
        error: data.message || data.error || "Invalid credentials" 
      }, { status: 401 })
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Login failed" 
    }, { status: 500 })
  }
}