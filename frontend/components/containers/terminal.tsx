import React, { ComponentPropsWithoutRef } from "react";
import XTermJs, { XTermRef } from "./xtermjs";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from "react-native";

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

type TerminalProps = ComponentPropsWithoutRef<typeof View> & {
  wsUrl: string;
};

const Terminal = ({ wsUrl, style, ...props }: TerminalProps) => {
  const ref = React.useRef<XTermRef>(null);

  const send = (data: string) => {
    ref.current?.send(data);
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <XTermJs ref={ref} dom={{ scrollEnabled: false }} wsUrl={wsUrl} />

      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.buttons}
      >
        <TerminalButton
          title={<Ionicons name="swap-horizontal" color="white" size={16} />}
          onPress={() => send(Keys.Tab)}
        />
        <TerminalButton title="ESC" onPress={() => send(Keys.Escape)} />
        <TerminalButton
          title={<Ionicons name="home" color="white" size={16} />}
          onPress={() => send(Keys.Home)}
        />
        <TerminalButton
          title={<Ionicons name="arrow-back" color="white" size={18} />}
          onPress={() => send(Keys.ArrowLeft)}
        />
        <TerminalButton
          title={<Ionicons name="arrow-up" color="white" size={18} />}
          onPress={() => send(Keys.ArrowUp)}
        />
        <TerminalButton
          title={<Ionicons name="arrow-down" color="white" size={18} />}
          onPress={() => send(Keys.ArrowDown)}
        />
        <TerminalButton
          title={<Ionicons name="arrow-forward" color="white" size={18} />}
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
  textStyle?: StyleProp<TextStyle>;
}) => (
  <Pressable
    style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
    {...props}
  >
    {typeof title === "string" ? (
      <Text style={[styles.btnText, textStyle]}>{title}</Text>
    ) : (
      title
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#232323",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#232323",
  },
  btn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  btnPressed: {
    backgroundColor: "#3a3a3a",
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
});

export default Terminal;
