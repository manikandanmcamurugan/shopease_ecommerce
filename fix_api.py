import re

with open('src/services/productService.js', 'r', encoding='utf-8') as f:
    code = f.read()

format_func = """
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
  
  let images = [p.image || 'https://via.placeholder.com/600x600'];
  if (p.angle2) images.push(p.angle2);
  if (p.angle3) images.push(p.angle3);
  if (p.angle4) images.push(p.angle4);

  if (images.length === 1 && p.images && p.images.length > 0) {
      images = p.images.map(img => img.image || img);
  }

  while (images.length < 4) {
      images.push(https://via.placeholder.com/600x600?text=Angle+\);
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
    isBestSeller: p.is_best_seller || p.isBestSeller || options.isBestSeller || (calculatedRating > 4.5),
    discount: p.discount || (index % 4 === 0 ? 20 : 0),
    hasOffer: p.has_offer || p.hasOffer || (index % 4 === 0),
    variants: variants,
    images: images
  };
};
"""

code = code.replace("const productService = {", format_func + "\nconst productService = {")

code = re.sub(r"const products = allResults\.map\(\(p, index\) => \{.*?\s{6}\}\);",
    r"""const products = allResults.map((p, index) => formatProduct(p, index, {
          isFeatured: topFeaturedIds.has(p.id),
          isNewArrival: topNewArrivalIds.has(p.id),
          isBestSeller: hasSalesData ? topBestSellerIds.has(p.id) : undefined
        }));""", code, flags=re.DOTALL)

code = re.sub(r"return \{ data: response\.data\.results \|\| response\.data \|\| \[\] \};", 
              r"const results = response.data.results || response.data || [];\n      return { data: results.map((p, i) => formatProduct(p, i)) };", code)

with open('src/services/productService.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("DONE!")
