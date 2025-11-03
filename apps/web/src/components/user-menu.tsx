import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        <Spinner className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{session.user.name}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/");
                      },
                    },
                  });
                }}
              >
                Sign Out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" asChild>
          <Link
            href={{
              pathname: "/auth/sign-in",
            }}
          >
            Sign In
          </Link>
        </Button>
      )}
    </>
  );
}
