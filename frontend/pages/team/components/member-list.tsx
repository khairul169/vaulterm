import React, { useMemo, useState } from "react";
import { Avatar, Button, ListItem, View, YGroup } from "tamagui";
import MenuButton from "@/components/ui/menu-button";
import Icons from "@/components/ui/icons";
import SearchInput from "@/components/ui/search-input";

type Props = {
  members?: any[];
  allowWrite?: boolean;
};

const MemberList = ({ members, allowWrite }: Props) => {
  const [search, setSearch] = useState("");

  const memberList = useMemo(() => {
    let items = members || [];

    if (search) {
      items = items.filter((item: any) => {
        const q = search.toLowerCase();
        return (
          item.user?.name.toLowerCase().includes(q) ||
          item.user?.username.toLowerCase().includes(q) ||
          item.user?.email.toLowerCase().includes(q)
        );
      });
    }

    return items;
  }, [members, search]);

  return (
    <View mt="$4">
      <SearchInput
        placeholder="Search member.."
        value={search}
        onChangeText={setSearch}
      />

      <YGroup bordered mt="$4">
        {memberList?.map((member: any) => (
          <YGroup.Item key={member.userId}>
            <ListItem
              hoverTheme
              title={member.user?.name}
              subTitle={member.role}
              pr="$2"
              icon={
                <Avatar size="$3" circular>
                  <Avatar.Fallback bg="$blue5" />
                </Avatar>
              }
              iconAfter={
                allowWrite ? <MemberActionButton member={member} /> : undefined
              }
            />
          </YGroup.Item>
        ))}
      </YGroup>
    </View>
  );
};

type MemberActionButtonProps = {
  member: any;
};

const MemberActionButton = ({ member }: MemberActionButtonProps) => (
  <MenuButton
    size="$1"
    placement="bottom-end"
    trigger={
      <Button
        icon={<Icons name="dots-vertical" size={20} />}
        circular
        bg="$colorTransparent"
      />
    }
  >
    <MenuButton.Item icon={<Icons name="account-key" size={16} />}>
      Change Role
    </MenuButton.Item>
    <MenuButton.Item color="$red10" icon={<Icons name="trash-can" size={16} />}>
      Remove Member
    </MenuButton.Item>
  </MenuButton>
);

export default MemberList;
