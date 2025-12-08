import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAll",
  async (
    {
      availability = "",
      price = "0-10000",
      category = "",
      ratings = "",
      search = "",
      page = 1,
    },
    thunkAPI
  ) => {
    try {
      const params = new URLSearchParams();
      // add params here if needed
      if (category) params.append("category", category);
      if (price) params.append("price", price);
      if (search) params.append("search", search);
      if (ratings) params.append("ratings", ratings);
      if (availability) params.append("availability", availability);
      if (page) params.append("page", page);

      const res = await axiosInstance.get(`/product?${params.toString()}`);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response.data.message || "Failed to fetch products."
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "product/singleProduct",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product/singleProduct/${id}`);
      return res.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details."
      );
    }
  }
);

export const postReview = createAsyncThunk(
  "product/post-new/review",
  async ({ productId, review }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/product/post-new/review/${productId}`,
        review
      );

      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post review.");

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to post review."
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "product/delete/review",
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/product/delete/review/${productId}`
      );

      toast.success(res.data.message);

      return {
        reviewId,
        product: res.data.product,
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review.");

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete review."
      );
    }
  }
);

export const fetchProductWithAI = createAsyncThunk(
  "product/ai-search",
  async (userPrompt, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/product/ai-search`, {
        userPrompt,
      });

      // Backend ALWAYS returns { products: [] }
      return res.data ?? { products: [] };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to fetch AI filtered products.";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    isPostingReview: false,
    productReviews: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.newProducts = action.payload.newProducts;
        state.topRatedProducts = action.payload.topRatedProducts;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
        state.productReviews = action.payload.reviews;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(postReview.pending, (state) => {
        state.isPostingReview = true;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.isPostingReview = false;
        const { review, product } = action.payload;

        // Check if this user already reviewed
        const existingIndex = state.productReviews.findIndex(
          (r) => r.reviewer?.id === review.user_id
        );

        if (existingIndex !== -1) {
          state.productReviews[existingIndex] = {
            ...state.productReviews[existingIndex],
            ...review,
          };
        } else {
          state.productReviews = [review, ...state.productReviews];
        }

        // Update product rating instantly
        if (product && product.ratings !== undefined) {
          state.productDetails.ratings = product.ratings;
        }
      })

      .addCase(postReview.rejected, (state) => {
        state.isPostingReview = false;
      })
      .addCase(deleteReview.pending, (state) => {
        state.isReviewDeleting = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isReviewDeleting = false;

        const { reviewId, product } = action.payload;

        // Remove the deleted review
        state.productReviews = state.productReviews.filter(
          (review) => review.review_id !== reviewId
        );

        // Update product rating instantly
        if (product && product.ratings !== undefined) {
          state.productDetails.ratings = product.ratings;
        }
      })
      .addCase(deleteReview.rejected, (state) => {
        state.isReviewDeleting = false;
      })
      .addCase(fetchProductWithAI.pending, (state) => {
        state.aiSearching = true;
      })
      .addCase(fetchProductWithAI.fulfilled, (state, action) => {
        state.aiSearching = false;

        const aiProducts = action.payload.products || [];

        state.products = aiProducts;
        state.totalProducts = aiProducts.length;
      })

      .addCase(fetchProductWithAI.rejected, (state) => {
        state.aiSearching = false;
      });
  },
});

export default productSlice.reducer;
