import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // This function runs if auth succeeds
    return undefined; // Allow request to continue
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
