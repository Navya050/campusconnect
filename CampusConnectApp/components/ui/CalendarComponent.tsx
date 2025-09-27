import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, Button, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "study" | "meeting" | "deadline" | "other";
  description?: string;
}

interface CalendarComponentProps {
  events: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  style?: any;
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({
  events,
  onEventPress,
  onAddEvent,
  style,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "study":
        return "#4CAF50";
      case "meeting":
        return "#2196F3";
      case "deadline":
        return "#FF5722";
      default:
        return "#9E9E9E";
    }
  };

  const getEventTypeIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "study":
        return "library-outline";
      case "meeting":
        return "people-outline";
      case "deadline":
        return "alarm-outline";
      default:
        return "calendar-outline";
    }
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    return events.reduce((groups, event) => {
      const date = event.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);
  };

  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Title style={styles.title}>Calendar</Title>
        {onAddEvent && (
          <Button
            mode="contained"
            onPress={onAddEvent}
            style={styles.addButton}
          >
            Add Event
          </Button>
        )}
      </View>

      <ScrollView style={styles.eventsContainer}>
        {sortedDates.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>
                No events scheduled
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Title style={styles.dateTitle}>{formatDate(date)}</Title>
              {groupedEvents[date].map((event) => (
                <Card
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => onEventPress?.(event)}
                >
                  <Card.Content>
                    <View style={styles.eventHeader}>
                      <View style={styles.eventInfo}>
                        <Ionicons
                          name={getEventTypeIcon(event.type) as any}
                          size={20}
                          color={getEventTypeColor(event.type)}
                          style={styles.eventIcon}
                        />
                        <View style={styles.eventDetails}>
                          <Title style={styles.eventTitle}>{event.title}</Title>
                          <Paragraph style={styles.eventTime}>
                            {event.time}
                          </Paragraph>
                        </View>
                      </View>
                      <Chip
                        style={[
                          styles.typeChip,
                          { backgroundColor: getEventTypeColor(event.type) },
                        ]}
                        textStyle={styles.typeChipText}
                      >
                        {event.type}
                      </Chip>
                    </View>
                    {event.description && (
                      <Paragraph style={styles.eventDescription}>
                        {event.description}
                      </Paragraph>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#2196F3",
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    backgroundColor: "white",
    elevation: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingLeft: 4,
  },
  eventCard: {
    backgroundColor: "white",
    elevation: 1,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventIcon: {
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
  },
  typeChip: {
    height: 28,
  },
  typeChipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
