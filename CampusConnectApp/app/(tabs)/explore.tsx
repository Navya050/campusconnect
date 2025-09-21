import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Explore Campus</Title>
          <Paragraph>Discover what's happening on campus!</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
  },
});