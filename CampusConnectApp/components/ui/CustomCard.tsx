import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Button, Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface CustomCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  avatar?: string;
  actions?: Array<{
    label: string;
    onPress: () => void;
    mode?: "text" | "outlined" | "contained";
  }>;
  onPress?: () => void;
  style?: any;
  children?: React.ReactNode;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  iconColor = "#666",
  avatar,
  actions = [],
  onPress,
  style,
  children,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} style={style}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {avatar && (
                <Avatar.Text size={40} label={avatar} style={styles.avatar} />
              )}
              {icon && !avatar && (
                <Ionicons
                  name={icon as any}
                  size={24}
                  color={iconColor}
                  style={styles.icon}
                />
              )}
              <View style={styles.titleContainer}>
                <Title style={styles.title}>{title}</Title>
                {subtitle && (
                  <Paragraph style={styles.subtitle}>{subtitle}</Paragraph>
                )}
              </View>
            </View>
          </View>

          {description && (
            <Paragraph style={styles.description}>{description}</Paragraph>
          )}

          {children}
        </Card.Content>

        {actions.length > 0 && (
          <Card.Actions>
            {actions.map((action, index) => (
              <Button
                key={index}
                mode={action.mode || "text"}
                onPress={action.onPress}
                style={styles.actionButton}
              >
                {action.label}
              </Button>
            ))}
          </Card.Actions>
        )}
      </Card>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  header: {
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#2196F3",
    marginRight: 12,
  },
  icon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
});
