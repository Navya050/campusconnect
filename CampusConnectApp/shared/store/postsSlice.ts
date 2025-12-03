import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  mode: "marketplace" | "general";
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface PostsState {
  posts: Post[];
  filteredPosts: Post[];
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  selectedPost: Post | null;
}

const initialState: PostsState = {
  posts: [],
  filteredPosts: [],
  selectedCategory: "All",
  searchQuery: "",
  isLoading: false,
  error: null,
  selectedPost: null,
};

// Async thunk for fetching posts (this would normally call your API)
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (
    params: { category?: string; userId?: string },
    { rejectWithValue }
  ) => {
    try {
      // This would be replaced with your actual API call
      // For now, we'll simulate the API call
      const response = await fetch(
        `/api/posts/marketplace?category=${params.category || ""}&userId=${
          params.userId || ""
        }`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch posts");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.filteredPosts = filterPosts(
        state.posts,
        action.payload,
        state.searchQuery
      );
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredPosts = filterPosts(
        state.posts,
        state.selectedCategory,
        action.payload
      );
    },
    setSelectedPost: (state, action: PayloadAction<Post | null>) => {
      state.selectedPost = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
      state.filteredPosts = filterPosts(
        state.posts,
        state.selectedCategory,
        state.searchQuery
      );
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(
        (post) => post._id === action.payload._id
      );
      if (index !== -1) {
        state.posts[index] = action.payload;
        state.filteredPosts = filterPosts(
          state.posts,
          state.selectedCategory,
          state.searchQuery
        );
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
      state.filteredPosts = filterPosts(
        state.posts,
        state.selectedCategory,
        state.searchQuery
      );
    },
    addComment: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>
    ) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.comments.push(action.payload.comment);
      }
      if (
        state.selectedPost &&
        state.selectedPost._id === action.payload.postId
      ) {
        state.selectedPost.comments.push(action.payload.comment);
      }
    },
    removeComment: (
      state,
      action: PayloadAction<{ postId: string; commentId: string }>
    ) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.comments = post.comments.filter(
          (c) => c._id !== action.payload.commentId
        );
      }
      if (
        state.selectedPost &&
        state.selectedPost._id === action.payload.postId
      ) {
        state.selectedPost.comments = state.selectedPost.comments.filter(
          (c) => c._id !== action.payload.commentId
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        state.filteredPosts = filterPosts(
          action.payload,
          state.selectedCategory,
          state.searchQuery
        );
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function to filter posts
function filterPosts(
  posts: Post[],
  category: string,
  searchQuery: string
): Post[] {
  let filtered = posts;

  // Filter by category
  if (category !== "All") {
    filtered = filtered.filter((post) => post.category === category);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}

export const {
  setSelectedCategory,
  setSearchQuery,
  setSelectedPost,
  clearError,
  addPost,
  updatePost,
  deletePost,
  addComment,
  removeComment,
} = postsSlice.actions;

export default postsSlice.reducer;
