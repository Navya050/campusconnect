import React from "react";
import { View, Text } from "react-native";

// This component will never be rendered since we intercept the tab press
// But it needs to exist for the tab structure
export default function LogoutScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Logging out...</Text>
    </View>
  );
}
