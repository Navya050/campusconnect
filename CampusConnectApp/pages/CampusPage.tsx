import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";

export const CampusPage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Explore Campus</Title>
          <Paragraph>Discover what&apos;s happening on campus!</Paragraph>
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
