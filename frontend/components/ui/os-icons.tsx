import { ComponentPropsWithoutRef } from "react";
import Icons from "./icons";

/*
var osMap = map[string]string{
	"arch":     "arch",
	"ubuntu":   "ubuntu",
	"kali":     "kali",
	"raspbian": "raspbian",
	"pop":      "pop",
	"debian":   "debian",
	"fedora":   "fedora",
	"centos":   "centos",
	"alpine":   "alpine",
	"mint":     "mint",
	"suse":     "suse",
	"darwin":   "macos",
	"windows":  "windows",
	"msys":     "windows",
	"linux":    "linux",
}
*/

const icons: Record<string, { name: string; color?: string }> = {
  ubuntu: { name: "ubuntu" },
  debian: { name: "debian" },
  arch: { name: "arch" },
  mint: { name: "linux-mint" },
  raspbian: { name: "raspberry-pi" },
  fedora: { name: "fedora" },
  centos: { name: "centos" },
  macos: { name: "apple" },
  windows: { name: "microsoft-windows" },
  linux: { name: "linux" },
};

type OSIconsProps = Omit<ComponentPropsWithoutRef<typeof Icons>, "name"> & {
  name?: string | null;
  fallback?: string;
};

const OSIcons = ({ name, fallback, ...props }: OSIconsProps) => {
  const icon = icons[name || ""];

  if (!icon) {
    return fallback ? <Icons name={fallback as never} {...props} /> : null;
  }

  return (
    <Icons
      name={icon.name as never}
      color={icon.color || "$color"}
      {...props}
    />
  );
};

export default OSIcons;
