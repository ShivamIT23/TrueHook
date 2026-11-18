import {
  Button as BaseButton,
  buttonVariants as baseButtonVariants,
} from "@truehook/ui/components/ui/button";
import * as React from "react";

export type ButtonProps = React.ComponentProps<typeof BaseButton>;

export function Button({ variant = "secondary", ...props }: ButtonProps) {
  const resolvedVariant =
    !variant || variant === "default" ? "secondary" : variant;
  return <BaseButton variant={resolvedVariant} {...props} />;
}

export const buttonVariants: typeof baseButtonVariants = (props) => {
  const variant =
    !props?.variant || props.variant === "default"
      ? "secondary"
      : props.variant;
  return baseButtonVariants({ ...props, variant });
};
