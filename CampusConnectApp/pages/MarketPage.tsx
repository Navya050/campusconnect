import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Chip,
  Searchbar,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

// Image mapping for local assets
const imageMap: { [key: string]: any } = {
  "calculas textbook.jpg": require("../assets/images/calculas textbook.jpg"),
  "macbook pro.jpg": require("../assets/images/macbook pro.jpg"),
  "chemistry guide.jpg": require("../assets/images/chemistry guide.jpg"),
  "calculator.jpg": require("../assets/images/calculator.jpg"),
  "mini fridge.jpg": require("../assets/images/mini fridge.jpg"),
  "psychology textbook.jpg": require("../assets/images/psychology textbook.jpg"),
};

interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Like New" | "Good" | "Fair";
  seller: string;
  imageId: string; // Reference to image in assets/images folder
  author?: string; // For books
  isbn?: string; // For books
}

const marketItems: MarketItem[] = [
  {
    id: "1",
    title: "Calculus Textbook - 8th Edition",
    description:
      "Essential calculus textbook in excellent condition. All pages intact, minimal highlighting.",
    price: 45.0,
    category: "Books",
    condition: "Like New",
    seller: "Sarah M.",
    imageId: "calculas textbook.jpg",
    author: "James Stewart",
    isbn: "978-1285740621",
    
  },
  {
    id: "2",
    title: "MacBook Pro 13-inch (2019)",
    description:
      "Reliable laptop perfect for students. Includes charger and protective case.",
    price: 850.0,
    category: "Electronics",
    condition: "Good",
    seller: "Alex K.",
    imageId: "macbook pro.jpg",
  
  },
  {
    id: "3",
    title: "Organic Chemistry Study Guide",
    description:
      "Comprehensive study guide with practice problems and solutions.",
    price: 25.0,
    category: "Books",
    condition: "New",
    seller: "Emma L.",
    imageId: "chemistry guide.jpg",
    author: "David R. Klein",
    isbn: "978-1118083383",
    
  },
  {
    id: "4",
    title: "Scientific Calculator TI-84",
    description:
      "Graphing calculator required for advanced math courses. Barely used.",
    price: 75.0,
    category: "Electronics",
    condition: "Like New",
    seller: "Mike R.",
    imageId: "calculator.jpg",
    
  },
  {
    id: "5",
    title: "Dorm Room Mini Fridge",
    description:
      "Compact refrigerator perfect for dorm rooms. Energy efficient and quiet.",
    price: 120.0,
    category: "Appliances",
    condition: "Good",
    seller: "Jessica T.",
    imageId: "mini fridge.jpg",
    
  },
  {
    id: "6",
    title: "Psychology Textbook Bundle",
    description:
      "Complete set of psychology textbooks for intro and advanced courses.",
    price: 95.0,
    category: "Books",
    condition: "Good",
    seller: "David W.",
    imageId: "psychology textbook.jpg",
    author: "David G. Myers",
    isbn: "978-1464140815",
    
  },
];

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
  const [filteredItems, setFilteredItems] = useState(marketItems);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterItems(query, selectedCategory);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterItems(searchQuery, category);
  };

  const filterItems = (query: string, category: string) => {
    let filtered = marketItems;

    if (category !== "All") {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (query.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) 
      );
    }

    setFilteredItems(filtered);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New":
        return "#4CAF50";
      case "Like New":
        return "#8BC34A";
      case "Good":
        return "#FF9800";
      case "Fair":
        return "#FF5722";
      default:
        return "#757575";
    }
  };

  const renderMarketItem = (item: MarketItem) => (
    <Card key={item.id} style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Image
            source={imageMap[item.imageId]}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.itemInfo}>
            <Title style={styles.itemTitle}>{item.title}</Title>
            {item.author && (
              <Text style={styles.authorText}>by {item.author}</Text>
            )}
            {item.isbn && (
              <Text style={styles.isbnText}>ISBN: {item.isbn}</Text>
            )}
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <Chip
            style={[
              styles.conditionChip,
              { backgroundColor: getConditionColor(item.condition) },
            ]}
            textStyle={styles.conditionText}
          >
            {item.condition}
          </Chip>
        </View>

        <Paragraph style={styles.itemDescription}>{item.description}</Paragraph>

        <View style={styles.itemMeta}>
          <View style={styles.sellerInfo}>
            <MaterialIcons name="person" size={16} color={Colors.light.icon} />
            <Text style={styles.sellerText}>Sold by {item.seller}</Text>
          </View>
          <View style={styles.categoryInfo}>
            <MaterialIcons
              name="category"
              size={16}
              color={Colors.light.icon}
            />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>


        <View style={styles.itemActions}>
          <Button
            mode="contained"
            style={styles.contactButton}
            onPress={() => {}}
          >
            Contact Seller
          </Button>
          <Button
            mode="outlined"
            style={styles.favoriteButton}
            onPress={() => {}}
            icon="heart-outline"
          >
            Save
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

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
                onPress={() => handleCategorySelect(category)}
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

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}{" "}
          found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <MaterialIcons name="sort" size={20} color={Colors.light.tint} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsList}>
        {filteredItems.map(renderMarketItem)}
      </View>

      {filteredItems.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="search-off"
            size={60}
            color={Colors.light.icon}
          />
          <Title style={styles.emptyTitle}>No items found</Title>
          <Paragraph style={styles.emptyDescription}>
            Try adjusting your search or browse different categories
          </Paragraph>
        </View>
      )}
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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
  authorText: {
    fontSize: 14,
    color: Colors.light.icon,
    fontStyle: "italic",
    marginBottom: 2,
  },
  isbnText: {
    fontSize: 12,
    color: Colors.light.icon,
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
