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

      const products = allResults.map((p, index) => ({
        id: p.id,
        name: p.title || p.name,
        price: Number(p.price) || 0,
        category: p.category_name || p.category || 'General',
        image: API_IMAGE_OVERRIDES[p.id] || (p.images && p.images.length > 0 ? p.images[0].image : p.image),

        description: p.description || '',

        // safe rating handling
        rating: p.rating?.rate ?? p.rating ?? 4.0,
        reviews: p.rating?.count ?? 0,

        isFeatured: p.is_featured || p.isFeatured || (index % 4 === 0 || index < 4),
        isNewArrival: p.is_new_arrival || p.isNewArrival || (index % 3 === 0 || index < 6),
        isBestSeller: p.is_best_seller || p.isBestSeller || ((p.rating?.rate ?? p.rating ?? 4) > 4.5 || index % 5 === 0),
        variants: p.variants || [],
        images: [
          API_IMAGE_OVERRIDES[p.id] || (p.images && p.images.length > 0 ? p.images[0].image : p.image),
          'https://placehold.co/600x600/f3f4f6/4b5563.png?text=Angle+2',
          'https://placehold.co/600x600/f3f4f6/4b5563.png?text=Angle+3',
          'https://placehold.co/600x600/f3f4f6/4b5563.png?text=Angle+4'
        ]
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
          image: p.images && p.images.length > 0 ? p.images[0].image : p.image,

          description: p.description,

          rating: p.rating?.rate ?? p.rating ?? 4.0,
          reviews: p.rating?.count ?? 0,

          isFeatured: p.is_featured || p.isFeatured || false,
          isNewArrival: p.is_new_arrival || p.isNewArrival || false,
          isBestSeller: p.is_best_seller || p.isBestSeller || ((p.rating?.rate ?? p.rating ?? 4) > 4.5),
          variants: p.variants || [],
          images: [
            p.images && p.images.length > 0 ? p.images[0].image : p.image,
            'https://placehold.co/600x600/f3f4f6/4b5563.png?text=Angle+2',
            'https://placehold.co/600x600/f3f4f6/4b5563.png?text=Angle+3',
            'https://placehold.co/600x600/f3f4f6/4b5563.png?text=Angle+4'
          ]
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
          p.category.toLowerCase().includes(q)
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