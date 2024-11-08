import { createTamagui } from "@tamagui/core";
import { config } from "@tamagui/config/v3";

// you usually export this from a tamagui.config.ts file
const tamaguiConfig = createTamagui(config);

// TypeScript types across all Tamagui APIs
type Conf = typeof tamaguiConfig;
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
