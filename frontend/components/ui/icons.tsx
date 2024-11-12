import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import IoniconsIcon from "@expo/vector-icons/Ionicons";
import { styled } from "tamagui";

export const Icons = styled(MaterialCommunityIcons, {
  color: "$color",
});
export const Ionicons = styled(IoniconsIcon, {
  color: "$color",
});

export default Icons;
