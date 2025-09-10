import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Return true if user is authorized to access the page
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/protected/:path*"]
}