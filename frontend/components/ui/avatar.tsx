import React from "react";
import { GetProps, Avatar as BaseAvatar } from "tamagui";
import Icons from "./icons";

type AvatarProps = GetProps<typeof BaseAvatar> & {
  src?: string;
  $image?: GetProps<typeof BaseAvatar.Image>;
};

const Avatar = ({ src, $image, ...props }: AvatarProps) => {
  return (
    <BaseAvatar circular {...props}>
      {src ? <BaseAvatar.Image src={src} {...$image} /> : null}
      <BaseAvatar.Fallback
        bg="$blue4"
        alignItems="center"
        justifyContent="center"
      >
        <Icons name="account" size={16} />
      </BaseAvatar.Fallback>
    </BaseAvatar>
  );
};

export default Avatar;
