import type { ComponentProps, ReactNode } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { AuthProvider } from "@/components/auth-provider";
import { authClient } from "@/lib/auth-client";

type LinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  href: string;
};

const Link = ({ href, ...props }: LinkProps) => <RouterLink to={href} {...props} />;

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <AuthProvider authClient={authClient} navigate={navigate} Link={Link}>
      {children}
    </AuthProvider>
  );
}