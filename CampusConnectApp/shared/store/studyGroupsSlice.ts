import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StudyGroup {
  _id: string;
  name: string;
  description: string;
  category: string;
  educationLevel: string;
  graduationYear: string;
  maxCapacity: number;
  studentCount: number;
  isJoined: boolean;
  isFull: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudyGroupsState {
  groups: StudyGroup[];
  joinedGroups: StudyGroup[];
  otherGroups: StudyGroup[];
  filteredGroups: StudyGroup[];
  filteredOtherGroups: StudyGroup[];
  searchQuery: string;
  selectedGroup: StudyGroup | null;
  showOtherGroups: boolean;
  isLoading: boolean;
  isOtherGroupsLoading: boolean;
  error: string | null;
}

const initialState: StudyGroupsState = {
  groups: [],
  joinedGroups: [],
  otherGroups: [],
  filteredGroups: [],
  filteredOtherGroups: [],
  searchQuery: "",
  selectedGroup: null,
  showOtherGroups: false,
  isLoading: false,
  isOtherGroupsLoading: false,
  error: null,
};

// Async thunk for fetching study groups
export const fetchStudyGroups = createAsyncThunk(
  "studyGroups/fetchStudyGroups",
  async (
    params: {
      educationLevel?: string;
      category?: string;
      graduationYear?: string;
      userId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with your actual API call
      const response = await fetch(
        `/api/groups?educationLevel=${params.educationLevel || ""}&category=${
          params.category || ""
        }&graduationYear=${params.graduationYear || ""}&userId=${
          params.userId || ""
        }`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch study groups");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch study groups");
    }
  }
);

// Async thunk for fetching other groups
export const fetchOtherGroups = createAsyncThunk(
  "studyGroups/fetchOtherGroups",
  async (
    params: {
      educationLevel?: string;
      category?: string;
      graduationYear?: string;
      userId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/groups/other?educationLevel=${
          params.educationLevel || ""
        }&category=${params.category || ""}&graduationYear=${
          params.graduationYear || ""
        }&userId=${params.userId || ""}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch other groups");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch other groups");
    }
  }
);

const studyGroupsSlice = createSlice({
  name: "studyGroups",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredGroups = filterGroups(state.groups, action.payload);
      state.filteredOtherGroups = filterGroups(
        state.otherGroups,
        action.payload
      );
    },
    setSelectedGroup: (state, action: PayloadAction<StudyGroup | null>) => {
      state.selectedGroup = action.payload;
    },
    setShowOtherGroups: (state, action: PayloadAction<boolean>) => {
      state.showOtherGroups = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateGroupJoinStatus: (
      state,
      action: PayloadAction<{ groupId: string; isJoined: boolean }>
    ) => {
      const { groupId, isJoined } = action.payload;

      // Update in main groups array
      const groupIndex = state.groups.findIndex((g) => g._id === groupId);
      if (groupIndex !== -1) {
        state.groups[groupIndex].isJoined = isJoined;
        if (isJoined) {
          state.groups[groupIndex].studentCount += 1;
        } else {
          state.groups[groupIndex].studentCount -= 1;
        }
      }

      // Update in other groups array
      const otherGroupIndex = state.otherGroups.findIndex(
        (g) => g._id === groupId
      );
      if (otherGroupIndex !== -1) {
        state.otherGroups[otherGroupIndex].isJoined = isJoined;
        if (isJoined) {
          state.otherGroups[otherGroupIndex].studentCount += 1;
        } else {
          state.otherGroups[otherGroupIndex].studentCount -= 1;
        }
      }

      // Recalculate joined and filtered groups
      state.joinedGroups = [...state.groups, ...state.otherGroups].filter(
        (g) => g.isJoined
      );
      state.filteredGroups = filterGroups(state.groups, state.searchQuery);
      state.filteredOtherGroups = filterGroups(
        state.otherGroups,
        state.searchQuery
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch study groups
      .addCase(fetchStudyGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudyGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
        state.joinedGroups = action.payload.filter(
          (group: StudyGroup) => group.isJoined
        );
        state.filteredGroups = filterGroups(action.payload, state.searchQuery);
        state.error = null;
      })
      .addCase(fetchStudyGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch other groups
      .addCase(fetchOtherGroups.pending, (state) => {
        state.isOtherGroupsLoading = true;
      })
      .addCase(fetchOtherGroups.fulfilled, (state, action) => {
        state.isOtherGroupsLoading = false;
        state.otherGroups = action.payload;
        state.filteredOtherGroups = filterGroups(
          action.payload,
          state.searchQuery
        );
        // Update joined groups to include any from other groups
        state.joinedGroups = [...state.groups, ...action.payload].filter(
          (g) => g.isJoined
        );
      })
      .addCase(fetchOtherGroups.rejected, (state, action) => {
        state.isOtherGroupsLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function to filter groups
function filterGroups(groups: StudyGroup[], searchQuery: string): StudyGroup[] {
  if (!searchQuery.trim()) return groups;

  const query = searchQuery.toLowerCase().trim();
  return groups.filter(
    (group) =>
      group.name.toLowerCase().includes(query) ||
      group.description.toLowerCase().includes(query) ||
      group.category.toLowerCase().includes(query) ||
      group.graduationYear.toString().includes(query)
  );
}

export const {
  setSearchQuery,
  setSelectedGroup,
  setShowOtherGroups,
  clearError,
  updateGroupJoinStatus,
} = studyGroupsSlice.actions;

export default studyGroupsSlice.reducer;
