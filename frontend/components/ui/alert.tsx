import { Card, GetProps, styled, Text, XStack } from "tamagui";
import Icons from "./icons";

const AlertFrame = styled(Card, {
  px: "$4",
  py: "$3",
  bordered: true,
  variants: {
    variant: {
      default: {},
      error: {
        backgroundColor: "$red2",
        borderColor: "$red5",
      },
    },
  } as const,
});

const icons: Record<string, string> = {
  error: "alert-circle-outline",
};

type AlertProps = GetProps<typeof AlertFrame>;

const Alert = ({ children, variant = "default", ...props }: AlertProps) => {
  return (
    <AlertFrame variant={variant} {...props}>
      <XStack gap="$2">
        {icons[variant] != null && (
          <Icons name={icons[variant] as never} size={18} />
        )}

        <Text fontSize="$3" f={1}>
          {children}
        </Text>
      </XStack>
    </AlertFrame>
  );
};

type ErrorAlert = AlertProps & {
  error?: unknown | null;
};

export const ErrorAlert = ({ error, ...props }: ErrorAlert) => {
  if (!error) {
    return null;
  }

  const message = (error as any)?.message || "Something went wrong";
  return (
    <Alert variant="error" {...props}>
      {message}
    </Alert>
  );
};

export default Alert;
