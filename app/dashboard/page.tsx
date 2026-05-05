import { requireAuth } from "@/lib/auth/server";
import { signOut } from "next-auth/react";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bento Dashboard</h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirect: true, callbackUrl: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Welcome, {session.user?.firstName}!
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">
                  {session.user?.email}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {session.user?.firstName} {session.user?.lastName}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-lg font-medium text-gray-900">
                  {session.user?.id}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Token Status</p>
                <p className="text-lg font-medium text-green-600">Active</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                ✅ You are authenticated! Session tokens are automatically managed by NextAuth.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
