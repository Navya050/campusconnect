import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { config } from "@/shared/config";
import storage from "@/shared/utils/storage";

const API_URL = config.API_URL;

// Types
interface StudyGroup {
  _id: string;
  name: string;
  description: string;
  category: string;
  educationLevel: string;
  graduationYear: string;
  studentCount: number;
  maxCapacity: number;
  isFull: boolean;
  isJoined: boolean;
  createdAt: string;
}

interface GroupFilters {
  category?: string;
  educationLevel?: string;
  graduationYear?: string;
  userId?: string;
}

// API functions (business logic separated from UI)
const studyGroupsAPI = {
  getAll: async (filters: GroupFilters = {}): Promise<StudyGroup[]> => {
    const token = await storage.getItem("token");
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.append("category", filters.category);
    if (filters.educationLevel)
      queryParams.append("educationLevel", filters.educationLevel);
    if (filters.graduationYear)
      queryParams.append("graduationYear", filters.graduationYear);
    if (filters.userId) queryParams.append("userId", filters.userId);

    const response = await fetch(
      `${API_URL}/groups?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch groups");
    }

    const result = await response.json();
    return result.data;
  },

  getById: async (id: string): Promise<StudyGroup> => {
    const token = await storage.getItem("token");
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Study group not found");
    }

    const result = await response.json();
    return result.data;
  },

  join: async (groupId: string, userId: string): Promise<void> => {
    const token = await storage.getItem("token");
    const response = await fetch(`${API_URL}/groups/${groupId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.data || "Failed to join group");
    }

    return response.json();
  },

  leave: async (groupId: string, userId: string): Promise<void> => {
    const token = await storage.getItem("token");
    const response = await fetch(`${API_URL}/groups/${groupId}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.data || "Failed to leave group");
    }

    return response.json();
  },
};

// Query keys
const studyGroupsKeys = {
  all: ["studyGroups"] as const,
  lists: () => [...studyGroupsKeys.all, "list"] as const,
  list: (filters: string) => [...studyGroupsKeys.lists(), { filters }] as const,
  details: () => [...studyGroupsKeys.all, "detail"] as const,
  detail: (id: string) => [...studyGroupsKeys.details(), id] as const,
};

// Custom hooks
export const useStudyGroups = (filters: GroupFilters = {}) => {
  return useQuery({
    queryKey: studyGroupsKeys.list(JSON.stringify(filters)),
    queryFn: () => studyGroupsAPI.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudyGroup = (id: string) => {
  return useQuery({
    queryKey: studyGroupsKeys.detail(id),
    queryFn: () => studyGroupsAPI.getById(id),
    enabled: !!id,
  });
};

export const useJoinStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      studyGroupsAPI.join(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupsKeys.lists() });
    },
  });
};

export const useLeaveStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: any; userId: string }) =>
      studyGroupsAPI.leave(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupsKeys.lists() });
    },
  });
};

// Export types
export type { StudyGroup, GroupFilters };
