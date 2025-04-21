import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
              PromptPal
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <span className="text-sm font-medium hover:text-indigo-600 transition-colors">
                Home
              </span>
            </Link>
            <Link href="/dashboard">
              <span className="text-sm font-medium hover:text-indigo-600 transition-colors">
                Dashboard
              </span>
            </Link>
            <Link href="/pricing">
              <span className="text-sm font-medium hover:text-indigo-600 transition-colors">
                Pricing
              </span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium mr-2">
                {user.username}
                {user.isPremium && (
                  <span className="ml-2 text-xs font-medium bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                    PRO
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}