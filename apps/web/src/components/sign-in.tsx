import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface SignInProps {
  className?: string;
}

export default function SignIn(props: SignInProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        <Spinner className="h-4 w-4" />
      </Button>
    );
  }
  if (session) {
    router.push("/dashboard");
  }

  return (
    <Button className={props.className} variant="outline" asChild>
      <Link
        href={{
          pathname: "/auth/sign-in",
        }}
      >
        Sign In
      </Link>
    </Button>
  );
}
