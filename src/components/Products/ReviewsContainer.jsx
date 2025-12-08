import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteReview, postReview } from "../../store/slices/productSlice";
import { Star, Trash2 } from "lucide-react";

const ReviewsContainer = ({ product, productReviews }) => {
  const { authUser } = useSelector((state) => state.auth);
  const { isReviewDeleting, isPostingReview } = useSelector(
    (state) => state.product
  );

  const dispatch = useDispatch();

  // Load user's review if exists
  const userReview = productReviews?.find(
    (rev) => rev.reviewer?.id === authUser?.id
  );

  const [rating, setRating] = useState(userReview?.rating || 1);
  const [comment, setComment] = useState(userReview?.comment || "");

  // When reviews load, update form values
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    }
  }, [userReview]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("rating", rating);
    data.append("comment", comment);

    dispatch(
      postReview({
        productId: product.id,
        review: data,
      })
    );
  };

  return (
    <>
      {/* ⭐ ALWAYS SHOW FORM — NEW OR UPDATE */}
      {authUser && (
        <form onSubmit={handleReviewSubmit} className="mb-8 space-y-4">
          <h4 className="text-lg font-semibold">
            {userReview ? "Update Your Review" : "Leave a Review"}
          </h4>

          {/* Stars */}
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className={`text-2xl ${
                  i < rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your review..."
            className="w-full p-3 rounded-md border border-border bg-background text-foreground"
          />

          <button
            type="submit"
            disabled={isPostingReview}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:glow-on-hover animate-smooth disabled:opacity-50"
          >
            {isPostingReview
              ? "Submitting..."
              : userReview
              ? "Update Review"
              : "Submit Review"}
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold text-foreground mb-6">
        Customer Reviews
      </h3>

      {productReviews && productReviews.length > 0 ? (
        <div className="space-y-6">
          {productReviews.map((review) => (
            <div
              key={review.id}
              className="relative glass-card p-6 rounded-xl border border-border shadow-md hover:shadow-lg transition-all"
            >
              {/* Delete only if it is user's review */}
              {authUser?.id === review?.reviewer?.id && (
                <button
                  onClick={() =>
                    dispatch(
                      deleteReview({
                        productId: product.id,
                        reviewId: review.review_id,
                      })
                    )
                  }
                  className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 
                             hover:bg-red-500/20 transition flex items-center justify-center"
                >
                  {isReviewDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              )}

              <div className="flex items-center space-x-4">
                <img
                  src={review?.reviewer?.avatar?.url || "/avatar-holder.avif"}
                  alt={review?.reviewer?.name}
                  className="w-12 h-12 rounded-full object-cover shadow-md"
                />

                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-lg">
                    {review?.reviewer?.name}
                  </h4>

                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(review.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mt-4 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No reviews yet. Be the first one to review this product.
        </p>
      )}
    </>
  );
};

export default ReviewsContainer;
