import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";

export const HomePage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Explore Feed</Title>
          <Paragraph>Discover what&lsquo;s happening on campus!</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 20,
  },
});
