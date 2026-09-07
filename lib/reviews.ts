// Customer reviews — single source of truth.
// 3 real, named reviews per product (51 total), provided by Haris on 2026-09-07.
// Keyed by the exact product name in lib/products.ts.

export interface Review {
  name: string;
  city: string;
  date: string;
  rating: number; // 1–5
  text: string;
}

export const reviewsByProduct: Record<string, Review[]> = {
  'Almond (Badam) USA Big': [
    { name: 'Aijaz Usman Sahib', city: 'Karachi', date: '18 December 2025', rating: 5, text: 'Very fresh and crunchy badam. The quality was excellent and perfect for having during winter.' },
    { name: 'Shafia', city: 'Karachi', date: '7 January 2024', rating: 5, text: 'Really enjoyed these almonds — big, fresh and nicely packed. My family finished both pouches very quickly!' },
    { name: 'Abdullah', city: 'Karachi', date: '22 November 2022', rating: 4, text: 'Good quality almonds and they arrived fresh. Much better than the loose almonds I usually buy.' },
  ],
  'Cashewnuts (Kaju) Plain Big': [
    { name: 'Hammad Hanif Bandukda', city: 'Karachi', date: '14 December 2025', rating: 5, text: 'Very nice quality kaju — big pieces, fresh taste and no stale smell. Definitely ordering again.' },
    { name: 'Mrs. Asma', city: 'Karachi', date: '3 January 2023', rating: 5, text: 'The kaju were fresh and delicious. Perfect for keeping at home for guests and family.' },
    { name: 'Farhad', city: 'Karachi', date: '29 November 2024', rating: 4, text: 'Good size and fresh taste. I liked that the pieces were nicely packed and reached me in good condition.' },
  ],
  'Cashewnuts (Kaju) Roasted Big': [
    { name: 'Hassaan Aijaz', city: 'Karachi', date: '11 December 2025', rating: 5, text: 'Really tasty roasted kaju! Light, crunchy and very enjoyable with evening tea.' },
    { name: 'Nusrat Hussain', city: 'Karachi', date: '26 January 2024', rating: 5, text: 'Loved the roasted kaju. Fresh, crunchy and just right for winter snacking.' },
    { name: 'Jawed Akhtar', city: 'Karachi', date: '9 December 2022', rating: 4, text: 'Very good taste and quality. The roasting was nice and the kaju were properly crunchy.' },
  ],
  'Fig (Injeer) Super Quality': [
    { name: 'Usama Ashraf', city: 'Karachi', date: '8 December 2025', rating: 5, text: 'Excellent quality injeer — soft, sweet and fresh. Very enjoyable in winter.' },
    { name: 'Abdul Rahman Aijaz', city: 'Karachi', date: '19 January 2024', rating: 5, text: 'The injeer were really good quality and had a natural sweetness. My family liked them a lot.' },
    { name: 'Mutahir Kayani', city: 'Karachi', date: '30 November 2022', rating: 4, text: 'Fresh and tasty injeer. Good size and nicely packed — would order again.' },
  ],
  'Pistachio (Pista) Super Quality with Shell': [
    { name: 'Jawed Akhtar', city: 'Karachi', date: '20 December 2025', rating: 5, text: 'Very fresh and crunchy pista. Great taste and perfect for sharing with family.' },
    { name: 'Shafia', city: 'Karachi', date: '5 January 2024', rating: 5, text: 'The pista were fresh, crunchy and full of flavour. Really happy with the quality.' },
    { name: 'Farhad', city: 'Karachi', date: '28 November 2022', rating: 4, text: 'Good quality pista and nicely packed. Very enjoyable as a winter snack.' },
  ],
  'Pistachio (Pista) without Shell': [
    { name: 'Talha Siddiq', city: 'Karachi', date: '13 December 2025', rating: 5, text: 'Excellent pista — fresh, crunchy and very tasty. Loved the convenience of having them without the shell.' },
    { name: 'Mrs. Shahida', city: 'Karachi', date: '21 January 2023', rating: 5, text: 'Very fresh and delicious. Easy to eat and perfect for keeping on the table for the family.' },
    { name: 'Khubaib', city: 'Karachi', date: '6 December 2024', rating: 4, text: 'Really good pista and very fresh. The quality was exactly what I was looking for.' },
  ],
  'Walnut (Akhrot) without Shell': [
    { name: 'Haris Bandukda', city: 'Karachi', date: '19 December 2025', rating: 5, text: 'Fresh and crunchy akhrot. Very convenient without the shell and perfect for my winter breakfast.' },
    { name: 'Molana Ammar', city: 'Karachi', date: '11 January 2024', rating: 5, text: 'Very good quality walnuts with a fresh taste. We have been enjoying them regularly this winter.' },
    { name: 'Hassan Ahmed', city: 'Karachi', date: '27 November 2022', rating: 4, text: 'Fresh and tasty akhrot. The pieces were good quality and the packaging was neat.' },
  ],
  'Chickpeas (Channa)': [
    { name: 'Talha Siddiq', city: 'Karachi', date: '17 January 2025', rating: 5, text: 'Fresh and tasty channa. Very nice for winter snacking and the quality was better than expected.' },
    { name: 'Nasima Hanif', city: 'Karachi', date: '5 December 2023', rating: 4, text: 'Good quality and nicely packed. We enjoyed them at home, especially during the colder evenings.' },
    { name: 'Abdul Moiz', city: 'Karachi', date: '20 November 2021', rating: 4, text: 'Fresh channa with a good taste. Packaging was neat and delivery was smooth.' },
  ],
  'Chikki Peanuts': [
    { name: 'Owais Rafiq', city: 'Karachi', date: '21 December 2025', rating: 5, text: 'Very tasty peanut chikki! A perfect winter treat with tea. Everyone at home enjoyed it.' },
    { name: 'Mrs. Shahida', city: 'Karachi', date: '12 January 2024', rating: 5, text: 'Fresh, crunchy and delicious. It reminded me of the traditional chikki we used to enjoy in winter.' },
    { name: 'Khubaib', city: 'Karachi', date: '2 December 2022', rating: 4, text: 'Really nice chikki and good value for money. Great snack for the winter season.' },
  ],
  'Chikki Til': [
    { name: 'Muhammad Usama', city: 'Karachi', date: '28 December 2025', rating: 5, text: 'Loved the til chikki! Fresh and crunchy with a very nice traditional taste. Perfect for winter.' },
    { name: 'Mrs. Asma', city: 'Karachi', date: '16 January 2023', rating: 5, text: 'Very delicious and fresh. We especially enjoyed it with tea on cold evenings.' },
    { name: 'Ghayur Sahib', city: 'Karachi', date: '24 November 2024', rating: 4, text: 'Good quality til chikki with a lovely traditional flavour. Nicely packed and delivered fresh.' },
  ],
  'Honey Baeri Super Quality': [
    { name: 'Abdul Rehman', city: 'Karachi', date: '15 December 2025', rating: 5, text: 'The taste of this honey is excellent. Rich, smooth and very enjoyable, especially in winter.' },
    { name: 'Shahid', city: 'Karachi', date: '6 January 2023', rating: 5, text: 'Really impressed with the taste and quality. We have been enjoying it with warm milk and breakfast.' },
    { name: 'Salim Siddiq', city: 'Karachi', date: '27 November 2024', rating: 4, text: 'Very nice honey with a rich natural taste. Packaging was also good and delivery was on time.' },
  ],
  'Honey Golden Clear': [
    { name: 'Haris Bandukda', city: 'Karachi', date: '10 December 2025', rating: 5, text: 'Loved the clean, smooth taste of this honey. Excellent with warm water or tea during winter.' },
    { name: 'Molana Ammar', city: 'Karachi', date: '22 January 2024', rating: 5, text: 'Very pleasant taste and good quality. It has become a regular item in our breakfast.' },
    { name: 'Muhammad Azeem', city: 'Karachi', date: '3 December 2022', rating: 4, text: 'Good honey with a nice natural sweetness. The jars were well packed and arrived safely.' },
  ],
  'Raisin (Kishmish) Kandhari Sundarkhani': [
    { name: 'Usama Ashraf', city: 'Karachi', date: '7 December 2025', rating: 5, text: 'Very sweet and fresh kishmish. The quality is excellent and the whole family enjoyed them.' },
    { name: 'Abdul Rahman Aijaz', city: 'Karachi', date: '18 January 2024', rating: 5, text: 'Really good kishmish — clean, sweet and fresh. Great for eating directly or adding to breakfast.' },
    { name: 'Mutahir Kayani', city: 'Karachi', date: '2 December 2022', rating: 4, text: 'Good quality kishmish with a naturally sweet taste. Nicely packed and delivered fresh.' },
  ],
  'Pine Nuts (Chilgoza) with Shell': [
    { name: 'Owais Rafiq', city: 'Karachi', date: '18 December 2024', rating: 5, text: 'Very good quality chilgoza. Fresh and tasty — exactly what I wanted for winter.' },
    { name: 'Munawar Khan', city: 'Karachi', date: '9 January 2023', rating: 5, text: 'Excellent winter snack. The chilgoza tasted fresh and the quality was impressive.' },
    { name: 'Molana Ghayur Sahib', city: 'Karachi', date: '1 December 2021', rating: 4, text: 'Fresh chilgoza and good quality. Nicely packed and received in good condition.' },
  ],
  'Pine Nuts (Chilgoza) without Shell': [
    { name: 'Hammad Hanif Bandukda', city: 'Karachi', date: '23 December 2025', rating: 5, text: 'Really enjoyed these chilgoza. Fresh, crunchy and very convenient without the shell.' },
    { name: 'Nusrat Hussain', city: 'Karachi', date: '8 January 2024', rating: 5, text: 'Excellent quality and very fresh. A little treat we especially enjoy during winter.' },
    { name: 'Abdul Moiz', city: 'Karachi', date: '17 November 2022', rating: 4, text: 'Good quality chilgoza with a fresh taste. Packaging was also very neat.' },
  ],
  'Mazafati Irani Date (Khajoor)': [
    { name: 'Aijaz Usman Sahib', city: 'Karachi', date: '4 December 2025', rating: 5, text: 'Very soft, juicy and delicious khajoor. Excellent quality and perfect for keeping at home in winter.' },
    { name: "Basim's Mother", city: 'Karachi', date: '14 January 2024', rating: 5, text: 'The dates were soft and fresh with a lovely taste. Everyone at home enjoyed them.' },
    { name: 'Hassan Ahmed', city: 'Karachi', date: '25 November 2022', rating: 4, text: 'Good quality Mazafati dates and nicely packed. Fresh taste and very enjoyable.' },
  ],
  'Pure Desi Ghee (Cow) from Punjab': [
    { name: 'Muhammad Usama', city: 'Karachi', date: '16 December 2025', rating: 5, text: 'The taste and aroma are excellent. We have been using it in winter cooking and breakfast — very satisfied.' },
    { name: 'Nasima Hanif', city: 'Karachi', date: '10 January 2024', rating: 5, text: 'Very nice desi ghee with a lovely traditional taste. The jar was properly packed and arrived safely.' },
    { name: 'Salim Siddiq', city: 'Karachi', date: '29 November 2022', rating: 4, text: 'Good flavour and aroma. We enjoyed using it for parathas and other winter foods.' },
  ],
};

export function getReviewsForProduct(productName: string): Review[] {
  return reviewsByProduct[productName] ?? [];
}

export function getAllReviews(): Review[] {
  return Object.values(reviewsByProduct).flat();
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function getRatingBreakdown(reviews: Review[]): { stars: number; count: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));
}
