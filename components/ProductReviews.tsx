import { getReviewsForProduct, getAverageRating, getRatingBreakdown } from '@/lib/reviews';

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  );
}

export default function ProductReviews({ productName }: { productName: string }) {
  const reviews = getReviewsForProduct(productName);
  if (reviews.length === 0) return null;

  const average = getAverageRating(reviews);
  const breakdown = getRatingBreakdown(reviews);

  return (
    <section className="product-reviews">
      <h2 className="product-reviews-title">Ratings &amp; Reviews</h2>

      <div className="rating-summary">
        <div className="rating-score">
          <span className="rating-average">{average.toFixed(1)}</span>
          <Stars rating={average} />
          <span className="rating-count">
            Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="rating-bars">
          {breakdown.map((b) => (
            <div className="rating-bar-row" key={b.stars}>
              <span className="rating-bar-label">{b.stars} ★</span>
              <div className="rating-bar-track">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${(b.count / reviews.length) * 100}%` }}
                />
              </div>
              <span className="rating-bar-count">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="product-review-list">
        {reviews.map((r, i) => (
          <div className="product-review-card" key={i}>
            <div className="product-review-head">
              <Stars rating={r.rating} />
              <span className="product-review-date">{r.date}</span>
            </div>
            <p className="product-review-text">&quot;{r.text}&quot;</p>
            <div className="product-review-meta">
              <span className="product-review-name">{r.name}</span>
              <span className="product-review-city">· {r.city}</span>
              <span className="verified-badge">✓ Verified Buyer</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
