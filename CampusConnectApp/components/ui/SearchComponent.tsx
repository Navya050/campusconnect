import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Searchbar, Chip } from "react-native-paper";

interface SearchComponentProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    count?: number;
  }>;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  style?: any;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder = "Search...",
  onSearch,
  filters = [],
  selectedFilter = "all",
  onFilterChange,
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <View style={[styles.container, style]}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />

      {filters.length > 0 && (
        <View style={styles.filtersContainer}>
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              selected={selectedFilter === filter.key}
              onPress={() => onFilterChange?.(filter.key)}
              style={styles.filterChip}
            >
              {filter.label} {filter.count ? `(${filter.count})` : ""}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
});
