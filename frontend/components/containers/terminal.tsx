import React, { ComponentPropsWithoutRef } from "react";
import XTermJs, { XTermRef } from "./xtermjs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, Text, TextStyle, View } from "tamagui";
import Pressable from "../ui/pressable";
import Icons from "../ui/icons";
import useThemeStore from "@/stores/theme";

const Keys = {
  ArrowLeft: "\x1b[D",
  ArrowRight: "\x1b[C",
  ArrowUp: "\x1b[A",
  ArrowDown: "\x1b[B",
  Enter: "\x0D",
  Escape: "\x1b",
  Home: "\x1b[H",
  End: "\x1b[F",
  PageUp: "\x1b[5~",
  PageDown: "\x1b[6~",
  Alt: "\x1b",
  Tab: "\x09",
};

type XTermJsProps = {
  client?: "xtermjs";
  url: string;
};

type TerminalProps = ComponentPropsWithoutRef<typeof View> & XTermJsProps;

const Terminal = ({ client = "xtermjs", style, ...props }: TerminalProps) => {
  const xtermRef = React.useRef<XTermRef>(null);
  const theme = useThemeStore((i) => i.theme);

  const send = (data: string) => {
    switch (client) {
      case "xtermjs":
        xtermRef.current?.send(data);
        break;
    }
  };

  return (
    <View flex={1} bg="$background" {...props}>
      {client === "xtermjs" && (
        <XTermJs
          ref={xtermRef}
          dom={{ scrollEnabled: false }}
          wsUrl={props.url}
          colorScheme={theme}
        />
      )}

      <ScrollView
        horizontal
        flexGrow={0}
        contentContainerStyle={{ flexDirection: "row" }}
      >
        <TerminalButton
          title={<Icons name="swap-horizontal" size={16} />}
          // onPress={() => send(Keys.Tab)}
        />
        <TerminalButton title="ESC" onPress={() => send(Keys.Escape)} />
        <TerminalButton
          title={<Icons name="home" size={16} />}
          onPress={() => send(Keys.Home)}
        />
        <TerminalButton
          title={<Icons name="arrow-left" size={18} />}
          onPress={() => send(Keys.ArrowLeft)}
        />
        <TerminalButton
          title={<Icons name="arrow-up" size={18} />}
          onPress={() => send(Keys.ArrowUp)}
        />
        <TerminalButton
          title={<Icons name="arrow-down" size={18} />}
          onPress={() => send(Keys.ArrowDown)}
        />
        <TerminalButton
          title={<Icons name="arrow-right" size={18} />}
          onPress={() => send(Keys.ArrowRight)}
        />
        <TerminalButton title="Enter" onPress={() => send(Keys.Enter)} />
        <TerminalButton title="End" onPress={() => send(Keys.End)} />
        <TerminalButton title="PgUp" onPress={() => send(Keys.PageUp)} />
        <TerminalButton title="PgDn" onPress={() => send(Keys.PageDown)} />
        {/* <TerminalButton title="Alt" onPress={() => send(Keys.Alt)} /> */}
        <TerminalButton title="^C" onPress={() => send("\x03")} />
        <TerminalButton title="^D" onPress={() => send("\x04")} />
        <TerminalButton title="^Q" onPress={() => send("\x11")} />
        <TerminalButton title="^V" onPress={() => send("\x11")} />
        <TerminalButton title="^S" onPress={() => send("\x13")} />
        <TerminalButton title="^W" onPress={() => send("\x18")} />
        <TerminalButton title="^X" onPress={() => send("\x18")} />
        <TerminalButton title="^Z" onPress={() => send("\x1a")} />
      </ScrollView>
    </View>
  );
};

const TerminalButton = ({
  title,
  textStyle,
  ...props
}: ComponentPropsWithoutRef<typeof Pressable> & {
  title: string | React.ReactNode;
  textStyle?: TextStyle;
}) => (
  <Pressable px="$4" py="$3" $hover={{ bg: "$blue3" }} {...props}>
    {typeof title === "string" ? <Text {...textStyle}>{title}</Text> : title}
  </Pressable>
);

export default Terminal;
