import api from './api';

// Optional fallback images removed

const API_IMAGE_OVERRIDES = {};

let cachedProducts = null;
let cachedCategories = null;

const fetchAllPages = async (initialUrl) => {
  let allResults = [];
  const firstRes = await api.get(initialUrl);
  const data = firstRes.data;
  
  if (!data.results) {
    return data;
  }
  
  allResults = [...data.results];
  
  if (data.count && data.results.length > 0 && data.next) {
    // Try parallel fetching if it's page number pagination
    const pageSize = data.results.length;
    const totalPages = Math.ceil(data.count / pageSize);
    if (totalPages > 1 && data.next.includes('page=')) {
      const promises = [];
      const urlBase = initialUrl.includes('?') ? initialUrl + '&' : initialUrl + '?';
      // if initialUrl already has query params, we shouldn't just append, but assuming it's clean '/products/'
      for (let i = 2; i <= totalPages; i++) {
        promises.push(api.get(`${initialUrl}?page=${i}`));
      }
      try {
        const responses = await Promise.all(promises);
        responses.forEach(r => {
          if (r.data && r.data.results) {
            allResults = [...allResults, ...r.data.results];
          }
        });
        return allResults;
      } catch (err) {
        console.warn('Parallel fetch failed, falling back to sequential', err);
      }
    }
    
    // Sequential fallback
    let nextUrl = data.next;
    while (nextUrl) {
      const res = await api.get(nextUrl.replace('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1', ''));
      if (res.data.results) {
        allResults = [...allResults, ...res.data.results];
        nextUrl = res.data.next;
      } else {
        break;
      }
    }
  }
  return allResults;
};


const formatProduct = (p, index = 0, options = {}) => {
  let brandName = p.brand;
  if (!brandName || brandName.trim() === '') {
    const cat = (p.category_name || p.category || '').toLowerCase();
    if (cat.includes('electronic') || cat.includes('computer')) {
      brandName = 'Asus';
    } else if (cat.includes('fashion') || cat.includes('footwear') || cat.includes('sport')) {
      brandName = 'Puma';
    } else {
      brandName = index % 2 === 0 ? 'Asus' : 'Puma';
    }
  }

  let variants = p.variants || [];
  
  let images = [p.image || 'https://placehold.co/600x600'];
  if (p.angle2) images.push(p.angle2);
  if (p.angle3) images.push(p.angle3);
  if (p.angle4) images.push(p.angle4);

  if (images.length === 1 && p.images && p.images.length > 0) {
      images = p.images.map(img => img.image || img);
  }

  while (images.length < 4) {
      images.push('https://placehold.co/600x600?text=Angle+' + (images.length + 1));
  }

  if (variants.length === 0) {
     if (index % 3 === 0) {
       variants = [
         { color: 'Red', size: 'S', stock: 10, additional_price: 0 },
         { color: 'Red', size: 'M', stock: 5, additional_price: 5 },
         { color: 'Blue', size: 'M', stock: 8, additional_price: 5 },
         { color: 'Black', size: 'L', stock: 2, additional_price: 10 }
       ];
     } else if (index % 2 === 0) {
       variants = [
         { color: 'Black', stock: 15 },
         { color: 'White', stock: 12 }
       ];
     }
  }

  const calculatedRating = p.rating?.rate ?? p.rating ?? 4.0;

  return {
    id: p.id,
    name: p.title || p.name,
    price: Number(p.price) || 0,
    category: p.category_name || p.category || 'General',
    brand: brandName,
    image: API_IMAGE_OVERRIDES[p.id] || images[0],
    description: p.description || '',
    rating: calculatedRating,
    reviews: p.rating?.count ?? 0,
    isFeatured: p.is_featured || p.isFeatured || options.isFeatured || false,
    isNewArrival: p.is_new_arrival || p.isNewArrival || options.isNewArrival || false,
    isBestSeller: p.is_best_seller || p.isBestSeller || options.isBestSeller || (calculatedRating > 4.5) || (index % 5 === 1),
    discount: p.discount || (index % 4 === 0 ? 20 : 0),
    hasOffer: p.has_offer || p.hasOffer || (index % 4 === 0),
    variants: variants,
    images: images
  };
};

const productService = {
  // ✅ GET ALL PRODUCTS
  getProducts: async () => {
    if (cachedProducts) return { data: cachedProducts };
    try {
      const allResults = await fetchAllPages('/products/');

      // Calculate fallbacks based on realistic metrics
      const topFeaturedIds = new Set(
        [...allResults]
          .sort((a, b) => {
            const rA = a.rating?.rate ?? a.rating ?? 4.0;
            const cA = a.rating?.count ?? a.review_count ?? a.reviews;
            const scoreA = cA !== undefined ? rA * cA : rA;

            const rB = b.rating?.rate ?? b.rating ?? 4.0;
            const cB = b.rating?.count ?? b.review_count ?? b.reviews;
            const scoreB = cB !== undefined ? rB * cB : rB;
            
            return scoreB - scoreA;
          })
          .slice(0, 8)
          .map(p => p.id)
      );

      const topNewArrivalIds = new Set(
        [...allResults]
          .sort((a, b) => {
            const dateA = a.created_at || a.date_added;
            const dateB = b.created_at || b.date_added;
            if (dateA && dateB) return new Date(dateB) - new Date(dateA);
            if (dateA) return -1;
            if (dateB) return 1;
            return 0; // fallback to index/original order
          })
          .slice(0, 8)
          .map(p => p.id)
      );

      const hasSalesData = allResults.some(p => p.units_sold !== undefined || p.sales_count !== undefined);
      const topBestSellerIds = new Set(
        [...allResults]
          .sort((a, b) => {
            const salesA = a.units_sold || a.sales_count || 0;
            const salesB = b.units_sold || b.sales_count || 0;
            return salesB - salesA;
          })
          .slice(0, 8)
          .map(p => p.id)
      );

      const products = allResults.map((p, index) => formatProduct(p, index, {
          isFeatured: topFeaturedIds.has(p.id),
          isNewArrival: topNewArrivalIds.has(p.id),
          isBestSeller: hasSalesData ? topBestSellerIds.has(p.id) : undefined
        }));

      cachedProducts = products;
      return { data: products };
    } catch (error) {
      console.error('API Error:', error);
      return { data: [] };
    }
  },

  // ✅ GET SINGLE PRODUCT
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}/`);
      const p = response.data;

      return {
        data: {
          id: p.id,
          name: p.title || p.name,
          price: Number(p.price) || 0,
          category: p.category_name || p.category,
          brand: p.brand || '',
          image: p.images && p.images.length > 0 ? p.images[0].image : p.image,

          description: p.description,

          rating: p.rating?.rate ?? p.rating ?? 4.0,
          reviews: p.rating?.count ?? 0,

          isFeatured: p.is_featured || p.isFeatured || false,
          isNewArrival: p.is_new_arrival || p.isNewArrival || false,
          isBestSeller: p.is_best_seller || p.isBestSeller || ((p.rating?.rate ?? p.rating ?? 4) > 4.5),
          variants: p.variants || [],
          images: (function() {
            let imgs = [p.image || 'https://placehold.co/600x600'];
            if (p.angle2) imgs.push(p.angle2);
            if (p.angle3) imgs.push(p.angle3);
            if (p.angle4) imgs.push(p.angle4);
            if (imgs.length === 1 && p.images && p.images.length > 0) {
              imgs = p.images.map(img => img.image);
            }
            while (imgs.length < 4) {
              imgs.push(`https://placehold.co/600x600?text=Angle+${imgs.length + 1}`);
            }
            return imgs;
          })()
        },
      };
    } catch (error) {
      console.error('Product fetch error:', error);
      return { data: null };
    }
  },

  // ✅ RATE PRODUCT
  rateProduct: async (id, rating) => {
    try {
      const response = await api.post(`/products/${id}/rate/`, { rating });
      return response;
    } catch (error) {
      console.error('Rating error:', error);
      throw error;
    }
  },

  // ✅ SEARCH PRODUCTS (BACKEND)
  searchProducts: async (query) => {
    try {
      if (!query) return { data: [] };
      const response = await api.get(`/products/search/?q=${encodeURIComponent(query)}`);
      const results = response.data.results || response.data || [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Search API error:', error);
      return { data: [] };
    }
  },

  // ✅ PRODUCT RECOMMENDATIONS
  getRecommendations: async (productId) => {
    try {
      // Temporarily mock this since the backend endpoint doesn't exist yet (prevents 404 console errors)
      // const response = await api.get(`/products/recommendations/${productId}/`);
      // const results = response.data.results || response.data || [];
      const results = [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Recommendations error:', error);
      return { data: [] };
    }
  },

  // ✅ FEATURED PRODUCTS
  getFeaturedProducts: async () => {
    try {
      // Temporarily mock this since the backend endpoint doesn't exist yet
      // const response = await api.get('/products/featured/');
      // const results = response.data.results || response.data || [];
      const results = [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Featured products error:', error);
      return { data: [] };
    }
  },

  // ✅ NEW ARRIVALS
  getNewArrivals: async () => {
    try {
      // Temporarily mock this since the backend endpoint doesn't exist yet
      // const response = await api.get('/products/new-arrivals/');
      // const results = response.data.results || response.data || [];
      const results = [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('New arrivals error:', error);
      return { data: [] };
    }
  },

  // ✅ CUSTOMERS ALSO BOUGHT
  getCustomersAlsoBought: async (productId) => {
    try {
      // Temporarily mock this since the backend endpoint doesn't exist yet
      // const response = await api.get(`/products/customers-also-bought/${productId}/`);
      // const results = response.data.results || response.data || [];
      const results = [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Customers also bought error:', error);
      return { data: [] };
    }
  },

  // ✅ SIMILAR PRICE
  getSimilarPrice: async (productId) => {
    try {
      const response = await api.get(`/products/similar-price/${productId}/`);
      const results = response.data.results || response.data || [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Similar price error:', error);
      return { data: [] };
    }
  },

  // ✅ PERSONALIZED
  getPersonalized: async (userId) => {
    try {
      const response = await api.get(`/products/personalized/?user_id=${userId}`);
      const results = response.data.results || response.data || [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Personalized error:', error);
      return { data: [] };
    }
  },

  // ✅ LOW STOCK
  getLowStock: async () => {
    try {
      const response = await api.get('/products/low-stock/');
      const results = response.data.results || response.data || [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Low stock error:', error);
      return { data: [] };
    }
  },

  // ✅ OUT OF STOCK
  getOutOfStock: async () => {
    try {
      const response = await api.get('/products/out-of-stock/');
      const results = response.data.results || response.data || [];
      return { data: results.map((p, i) => formatProduct(p, i)) };
    } catch (error) {
      console.error('Out of stock error:', error);
      return { data: [] };
    }
  },

  // ✅ INVENTORY DASHBOARD
  getInventoryDashboard: async () => {
    try {
      const response = await api.get('/products/inventory/dashboard/');
      return { data: response.data };
    } catch (error) {
      console.error('Inventory dashboard error:', error);
      return { data: null };
    }
  },

  // ✅ GET CATEGORIES
  getCategories: async () => {
    if (cachedCategories) return { data: cachedCategories };
    try {
      const allResults = await fetchAllPages('/products/categories/');
      
      const categories = allResults.map(c => {
        if (typeof c === 'object') {
          return {
            name: c.name || c.category_name,
            image: c.image || c.category_image || null,
            description: c.description || null
          };
        }
        return { name: c, image: null, description: null };
      });

      const finalCategories = [{ name: 'All', image: null }, ...categories];
      cachedCategories = finalCategories;

      return {
        data: finalCategories,
      };
    } catch (error) {
      console.error(error);
      return { data: [{ name: 'All', image: null }] };
    }
  },
  
  getBanners: async () => {
    return api.get('/banners/');
  }
};

export default productService;
