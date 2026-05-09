import { useParams } from "react-router-dom";
import { Auth } from "@/components/auth";
import type { AuthView } from "@better-auth-ui/core";

const routeMap: Record<string, AuthView> = {
  signin: "signIn",
  "sign-in": "signIn",
  signIn: "signIn",

  signup: "signUp",
  "sign-up": "signUp",
  signUp: "signUp",

  forgotpassword: "forgotPassword",
  "forgot-password": "forgotPassword",
  forgotPassword: "forgotPassword",

  resetpassword: "resetPassword",
  "reset-password": "resetPassword",
  resetPassword: "resetPassword",

  signout: "signOut",
  "sign-out": "signOut",
  signOut: "signOut",
};

export default function AuthPage() {
  const { view } = useParams();

  const authView = view ? routeMap[view] : "signIn";

  return (
    <main className="flex h-[80vh] items-center justify-center p-6 dark">
      <Auth view={authView} />
    </main>
  );
}