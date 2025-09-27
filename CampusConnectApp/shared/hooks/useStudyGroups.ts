import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  courseCode: string;
  level: "undergraduate" | "graduate";
  type: "public" | "private";
  members: number;
  maxMembers: number;
  description: string;
  tags: string[];
  lastActivity: string;
  nextMeeting: string;
}

// API functions (business logic separated from UI)
const studyGroupsAPI = {
  getAll: async (): Promise<StudyGroup[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: "1",
        name: "Data Structures & Algorithms",
        subject: "Computer Science",
        courseCode: "CS201",
        level: "undergraduate",
        type: "public",
        members: 12,
        maxMembers: 15,
        description:
          "Weekly study sessions for DS&A concepts and coding practice",
        tags: ["Programming", "Algorithms", "Problem Solving"],
        lastActivity: "2 hours ago",
        nextMeeting: "Tomorrow 3:00 PM",
      },
      {
        id: "2",
        name: "Calculus Study Group",
        subject: "Mathematics",
        courseCode: "MATH101",
        level: "undergraduate",
        type: "public",
        members: 8,
        maxMembers: 10,
        description: "Collaborative learning for Calculus I concepts",
        tags: ["Mathematics", "Calculus", "Problem Sets"],
        lastActivity: "5 hours ago",
        nextMeeting: "Friday 2:00 PM",
      },
    ];
  },

  getById: async (id: string): Promise<StudyGroup> => {
    const groups = await studyGroupsAPI.getAll();
    const group = groups.find((g) => g.id === id);
    if (!group) throw new Error("Study group not found");
    return group;
  },

  create: async (data: Omit<StudyGroup, "id">): Promise<StudyGroup> => {
    // Mock implementation - replace with actual API call
    return {
      ...data,
      id: Date.now().toString(),
    };
  },

  join: async (groupId: string): Promise<void> => {
    // Mock implementation - replace with actual API call
    console.log(`Joining group ${groupId}`);
  },

  leave: async (groupId: string): Promise<void> => {
    // Mock implementation - replace with actual API call
    console.log(`Leaving group ${groupId}`);
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
export const useStudyGroups = (filters?: string) => {
  return useQuery({
    queryKey: studyGroupsKeys.list(filters || ""),
    queryFn: studyGroupsAPI.getAll,
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

export const useCreateStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studyGroupsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupsKeys.lists() });
    },
  });
};

export const useJoinStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studyGroupsAPI.join,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupsKeys.lists() });
    },
  });
};

export const useLeaveStudyGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studyGroupsAPI.leave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupsKeys.lists() });
    },
  });
};

// Export types
export type { StudyGroup };
