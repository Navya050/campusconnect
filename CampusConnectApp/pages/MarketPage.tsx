import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import {
  Chip,
  Paragraph,
  Searchbar,
  Title
} from "react-native-paper";
import { Colors } from "../constants/theme";

const categories = [
  "All",
  "Books",
  "Electronics",
  "Appliances",
  "Furniture",
  "Clothing",
];

export const MarketPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSearch = () => {
    console.log("hello");
  };

  const handleCategorySelect = () => {
    console.log("hello");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="storefront" size={40} color={Colors.light.tint} />
        <Title style={styles.headerTitle}>Campus Market</Title>
        <Paragraph style={styles.headerSubtitle}>
          Buy and sell items with fellow students
        </Paragraph>
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search items..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategorySelect()}
              >
                <Chip
                  selected={selectedCategory === category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category &&
                      styles.selectedCategoryChip,
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.selectedCategoryChipText,
                  ]}
                >
                  {category}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: "center",
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: "white",
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "white",
  },
  selectedCategoryChip: {
    backgroundColor: Colors.light.tint,
  },
  categoryChipText: {
    color: Colors.light.text,
  },
  selectedCategoryChipText: {
    color: "white",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: "500",
  },
  itemsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: "white",
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  conditionChip: {
    height: 28,
  },
  conditionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    height: 24,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.text,
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
  },
  favoriteButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: "center",
    marginTop: 8,
  },
});
