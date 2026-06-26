import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';

const WishlistItem = ({ product, removeFromWishlist, addToCart }) => {
  const [imgError, setImgError] = React.useState(false);
  
  const price = Number(product.price ?? product.unit_price ?? product.product?.price ?? product.product?.unit_price ?? product.product_price ?? 0);
  const name = product.name ?? product.product?.name ?? product.product_name ?? 'Product';
  
  let image = product.image ?? product.product?.image ?? product.product_image;
  if (!image && product.images && product.images.length > 0) {
    image = product.images[0].image;
  }

  return (
    <div className="wishlist-item card">
      <div className="wishlist-image">
        {image && !imgError ? (
          <img src={image} alt={name} onError={() => setImgError(true)} />
        ) : (
          <div className="wishlist-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: 'var(--background)', color: 'var(--primary)' }}>
            <Heart size={64} opacity={0.5} />
          </div>
        )}
        <button className="remove-wishlist" onClick={() => removeFromWishlist(product.id)}>
          <Trash2 size={18} />
        </button>
      </div>
      <div className="wishlist-info">
        <Link to={`/products/${product.id}`}><h3>{name}</h3></Link>
        <p className="wishlist-price">₹{price.toFixed(2)}</p>
        <button className="btn btn-primary move-to-cart" onClick={() => {
          addToCart(product);
          removeFromWishlist(product.id);
        }}>
          <ShoppingCart size={18} /> Move to Cart
        </button>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty container">
        <Heart size={80} color="#e2e8f0" />
        <h2>Your wishlist is empty</h2>
        <p>Save items you like to buy them later.</p>
        <Link to="/products" className="btn btn-primary">Discover Products</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <h1>My Wishlist</h1>
      
      <div className="wishlist-grid grid grid-4">
        {wishlist.map(product => (
          <WishlistItem 
            key={product.id} 
            product={product} 
            removeFromWishlist={removeFromWishlist} 
            addToCart={addToCart} 
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
