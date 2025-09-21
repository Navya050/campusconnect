import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome to Campus Connect!</Title>
          <Paragraph>You are successfully logged in.</Paragraph>
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
