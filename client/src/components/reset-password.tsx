"use client";

import { useAuth, useResetPassword } from "@better-auth-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { type ComponentType, type ReactNode, type SyntheticEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient as appAuthClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export type ResetPasswordProps = {
  className?: string;
};

type ResetPasswordContextShape = {
  authClient: typeof appAuthClient;
  basePaths: { auth: string };
  emailAndPassword?: {
    confirmPassword?: boolean;
    minPasswordLength?: number;
    maxPasswordLength?: number;
  };
  localization: {
    auth: {
      resetPassword: string;
      password: string;
      confirmPassword: string;
      newPasswordPlaceholder: string;
      confirmPasswordPlaceholder: string;
      hidePassword: string;
      showPassword: string;
      passwordResetSuccess: string;
      invalidResetPasswordToken: string;
      passwordsDoNotMatch: string;
      rememberYourPassword: string;
      signIn: string;
    };
  };
  viewPaths: {
    auth: {
      signIn: string;
    };
  };
  navigate: (args: { to: string; replace?: boolean }) => void;
  Link: ComponentType<{
    href: string;
    className?: string;
    children?: ReactNode;
  }>;
};

export function ResetPassword({ className }: ResetPasswordProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    viewPaths,
    navigate,
    Link,
  } = useAuth() as ResetPasswordContextShape;

  const { mutate: resetPassword, isPending } = useResetPassword(authClient, {
    onSuccess: () => {
      toast.success(localization.auth.passwordResetSuccess);
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
    },
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token") as string;

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken);
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
    }
  }, [
    basePaths.auth,
    localization.auth.invalidResetPasswordToken,
    viewPaths.auth.signIn,
    navigate,
  ]);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token") as string;

    if (!token) {
      toast.error(localization.auth.invalidResetPasswordToken);
      navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch);
      return;
    }

    resetPassword({ token, newPassword: password });
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.resetPassword}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.password}>
              <Label htmlFor="password">{localization.auth.password}</Label>

              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={localization.auth.newPasswordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  onChange={() => {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: (e.target as HTMLInputElement).validationMessage,
                    }));
                  }}
                  aria-invalid={!!fieldErrors.password}
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    title={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldError>{fieldErrors.password}</FieldError>
            </Field>

            {emailAndPassword?.confirmPassword && (
              <Field data-invalid={!!fieldErrors.confirmPassword}>
                <Label htmlFor="confirmPassword">
                  {localization.auth.confirmPassword}
                </Label>

                <InputGroup>
                  <InputGroupInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={localization.auth.confirmPasswordPlaceholder}
                    required
                    minLength={emailAndPassword?.minPasswordLength}
                    maxLength={emailAndPassword?.maxPasswordLength}
                    disabled={isPending}
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                    onInvalid={(e) => {
                      e.preventDefault();
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: (e.target as HTMLInputElement).validationMessage,
                      }));
                    }}
                    aria-invalid={!!fieldErrors.confirmPassword}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      title={
                        isConfirmPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onClick={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    >
                      {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              </Field>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {localization.auth.resetPassword}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <FieldDescription className="text-center">
            {localization.auth.rememberYourPassword}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  );
}