import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";

export const StudySpacePage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Explore Study</Title>
          <Paragraph>
            Discover what&lsquo;s happening on study groups!
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 20,
  },
});
