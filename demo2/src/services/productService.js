import api from './api';

// Optional fallback images (keep if needed)
import leatherWalletImg from '../images/leather_wallet.png';
import silverNecklaceImg from '../images/silver_necklace.png';
import leatherBeltImg from '../images/leather_belt.png';
import toddlerWinterCoatImg from '../images/toddler_winter_coat.png';
import kettlebellImg from '../images/kettlebell.png';
import hoverboardImg from '../images/hoverboard.png';

const API_IMAGE_OVERRIDES = {
  20: leatherWalletImg,
  22: silverNecklaceImg,
  24: leatherBeltImg,
  35: toddlerWinterCoatImg,
  41: kettlebellImg,
  48: hoverboardImg,
};

const productService = {
  // ✅ GET ALL PRODUCTS
  getProducts: async () => {
    try {
      let allResults = [];
      let nextUrl = '/products/';

      while (nextUrl) {
        const res = await api.get(nextUrl.replace('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1', ''));
        const data = res.data;

        if (data.results) {
          allResults = [...allResults, ...data.results];
          nextUrl = data.next;
        } else {
          allResults = data;
          break;
        }
      }

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

        isFeatured: p.is_featured ?? p.isFeatured ?? (index % 4 === 0 || index < 4),
        isNewArrival: p.is_new_arrival ?? p.isNewArrival ?? (index % 3 === 0 || index < 6),
        isBestSeller: p.is_best_seller ?? p.isBestSeller ?? ((p.rating?.rate ?? p.rating ?? 4) > 4.5 || index % 5 === 0),
      }));

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

          isFeatured: p.is_featured ?? p.isFeatured ?? false,
          isNewArrival: p.is_new_arrival ?? p.isNewArrival ?? false,
          isBestSeller: p.is_best_seller ?? p.isBestSeller ?? ((p.rating?.rate ?? p.rating ?? 4) > 4.5),
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
    try {
      let allResults = [];
      let nextUrl = '/products/categories/';
      
      while (nextUrl) {
        // Just in case nextUrl is an absolute URL from the API, we need to handle it.
        // If it starts with http, we just use it, otherwise we prepend if necessary.
        // api.get will usually append base URL if it's a relative path.
        const res = await api.get(nextUrl.replace('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1', ''));
        const data = res.data;
        
        if (data.results) {
          allResults = [...allResults, ...data.results];
          nextUrl = data.next;
        } else {
          // If it's not paginated (just an array)
          allResults = data;
          break;
        }
      }
      
      const categories = allResults.map(c => {
        if (typeof c === 'object') {
          return {
            name: c.name || c.category_name,
            image: c.image || c.category_image || null
          };
        }
        return { name: c, image: null };
      });

      return {
        data: [{ name: 'All', image: null }, ...categories],
      };
    } catch (error) {
      console.error(error);
      return { data: [{ name: 'All', image: null }] };
    }
  },
};

export default productService;