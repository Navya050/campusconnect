import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { config } from "../config/environment";
import storage from "../utils/storage";
import { Post } from "../../components/PostComponent";
import { PostFormData } from "../../components/PostCreateForm";

// API functions
const fetchPosts = async (params: {
  mode?: string;
  groupId?: string;
  category?: string;
  userId?: string;
}): Promise<Post[]> => {
  const token = await storage.getItem("token");
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await fetch(
    `${config.API_URL}/posts?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch posts");
  }

  return response.json();
};

const fetchPostById = async (postId: string): Promise<Post> => {
  const token = await storage.getItem("token");

  const response = await fetch(`${config.API_URL}/posts/${postId}/full`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch post");
  }

  return response.json();
};

const createPost = async (postData: PostFormData): Promise<Post> => {
  const token = await storage.getItem("token");

  const response = await fetch(`${config.API_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }

  return response.json();
};

const addComment = async (postId: string, content: string): Promise<Post> => {
  const token = await storage.getItem("token");

  const response = await fetch(`${config.API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add comment");
  }

  return response.json();
};

const deleteComment = async (
  postId: string,
  commentId: string
): Promise<Post> => {
  const token = await storage.getItem("token");

  const response = await fetch(
    `${config.API_URL}/posts/${postId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete comment");
  }

  return response.json();
};

// Hooks
export const usePosts = (params: {
  mode?: string;
  groupId?: string;
  category?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate all posts queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      addComment(postId, content),
    onSuccess: (updatedPost) => {
      // Update the specific post in cache
      queryClient.setQueryData(["post", updatedPost._id], updatedPost);
      // Invalidate posts lists to refresh comment counts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => deleteComment(postId, commentId),
    onSuccess: (updatedPost) => {
      // Update the specific post in cache
      queryClient.setQueryData(["post", updatedPost._id], updatedPost);
      // Invalidate posts lists to refresh comment counts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Marketplace specific hooks
export const useMarketplacePosts = (category?: string, userId?: string) => {
  return usePosts({
    mode: "marketplace",
    category,
    userId,
  });
};

// Study group specific hooks
export const useStudyGroupPosts = (groupId?: string, userId?: string) => {
  return usePosts({
    mode: "study-group",
    groupId,
    userId,
  });
};
