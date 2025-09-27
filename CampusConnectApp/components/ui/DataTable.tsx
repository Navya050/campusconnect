import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { DataTable as PaperDataTable } from "react-native-paper";

interface Column {
  key: string;
  title: string;
  numeric?: boolean;
  sortable?: boolean;
  width?: number;
}

interface DataTableProps {
  columns: Column[];
  data: Array<Record<string, any>>;
  onRowPress?: (item: any) => void;
  sortBy?: string;
  sortDirection?: "ascending" | "descending";
  onSort?: (column: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  style?: any;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRowPress,
  sortBy,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = "No data available",
  style,
}) => {
  const handleSort = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <PaperDataTable>
          <PaperDataTable.Header>
            {columns.map((column) => (
              <PaperDataTable.Title
                key={column.key}
                numeric={column.numeric}
                sortDirection={
                  sortBy === column.key ? sortDirection : undefined
                }
                onPress={() => handleSort(column)}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.title}
              </PaperDataTable.Title>
            ))}
          </PaperDataTable.Header>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading...</Text>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text>{emptyMessage}</Text>
            </View>
          ) : (
            data.map((item, index) => (
              <PaperDataTable.Row
                key={index}
                onPress={() => onRowPress?.(item)}
              >
                {columns.map((column) => (
                  <PaperDataTable.Cell
                    key={column.key}
                    numeric={column.numeric}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {item[column.key]}
                  </PaperDataTable.Cell>
                ))}
              </PaperDataTable.Row>
            ))
          )}
        </PaperDataTable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});
