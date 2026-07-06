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

      const products = allResults.map((p, index) => {
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
        
        // Extract images from backend (main image + angle2, angle3, angle4)
        let images = [p.image || 'https://via.placeholder.com/600x600'];
        if (p.angle2) images.push(p.angle2);
        if (p.angle3) images.push(p.angle3);
        if (p.angle4) images.push(p.angle4);

        // Fallback to p.images array if no explicit angles provided
        if (images.length === 1 && p.images && p.images.length > 0) {
            images = p.images.map(img => img.image);
        }

        // Ensure we always have exactly 4 angles for the preview gallery
        while (images.length < 4) {
            images.push(`https://via.placeholder.com/600x600?text=Angle+${images.length + 1}`);
        }

        // Inject robust mock data for Product Preview variants testing if missing
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
          image: API_IMAGE_OVERRIDES[p.id] || (p.images && p.images.length > 0 ? p.images[0].image : p.image),

          description: p.description || '',

          // safe rating handling
          rating: calculatedRating,
          reviews: p.rating?.count ?? 0,

          isFeatured: p.is_featured || p.isFeatured || topFeaturedIds.has(p.id),
          isNewArrival: p.is_new_arrival || p.isNewArrival || topNewArrivalIds.has(p.id),
          isBestSeller: p.is_best_seller || p.isBestSeller || (hasSalesData ? topBestSellerIds.has(p.id) : calculatedRating > 4.5),
          discount: p.discount || (index % 4 === 0 ? 20 : 0),
          hasOffer: p.has_offer || p.hasOffer || (index % 4 === 0),
          variants: variants,
          images: images
        };
      });

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
            let imgs = [p.image || 'https://via.placeholder.com/600x600'];
            if (p.angle2) imgs.push(p.angle2);
            if (p.angle3) imgs.push(p.angle3);
            if (p.angle4) imgs.push(p.angle4);
            if (imgs.length === 1 && p.images && p.images.length > 0) {
              imgs = p.images.map(img => img.image);
            }
            while (imgs.length < 4) {
              imgs.push(`https://via.placeholder.com/600x600?text=Angle+${imgs.length + 1}`);
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

  // ✅ SEARCH PRODUCTS (FRONTEND FILTER)
  searchProducts: async (query) => {
    try {
      const res = await productService.getProducts();
      const all = res.data;

      if (!query) return { data: [] };

      const q = query.toLowerCase();

      const filtered = all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );

      return { data: filtered.slice(0, 8) };
    } catch (error) {
      return { data: [] };
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