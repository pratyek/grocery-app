import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Leaf, Apple, Carrot, CircleDot, Wheat, ShoppingCart, Trash2 } from 'lucide-react';

const ProductCard = ({ product, onDelete }) => {
  const { user } = useAuth();
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  // Function to determine which icon to show based on product name
  const getProductIcon = (productName) => {
    const name = productName.toLowerCase();
    
    if (name.includes('apple') || name.includes('mango') || name.includes('banana') || 
        name.includes('fruit') || name.includes('berry') || name.includes('orange')) {
      return <Apple size={48} color="#e74c3c" />;
    }
    
    if (name.includes('carrot') || name.includes('potato') || name.includes('onion') || 
        name.includes('tomato') || name.includes('pepper') || name.includes('root')) {
      return <Carrot size={48} color="#e67e22" />;
    }
    
    if (name.includes('spinach') || name.includes('lettuce') || name.includes('kale') || 
        name.includes('green') || name.includes('leaf')) {
      return <Leaf size={48} color="#27ae60" />;
    }
    
    if (name.includes('broccoli') || name.includes('cauliflower') || name.includes('cabbage')) {
      return <CircleDot size={48} color="#2ecc71" />;
    }
    
    // Default icon for other vegetables
    return <Wheat size={48} color="#f39c12" />;
  };
  
  const handleAddToCart = () => {
    addToCart(product);
  };
  const cartItem = cartItems.find(item => item._id === product._id);
  const isInCart = !!cartItem;
  
  return (
    <div className="product-card">
      <div className="product-image">
        {getProductIcon(product.name)}
      </div>
      
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">Rs. {product.price.toFixed(2)}</p>
      </div>
      
      <div className="product-actions">
        {isInCart ? (
            <div className="quantity-control">
                <button 
                className="quantity-btn" 
                onClick={() => updateQuantity(product._id, -1)}
                >
                -
                </button>
                <span className="quantity">{cartItem.quantity}</span>
                <button 
                className="quantity-btn" 
                onClick={() => updateQuantity(product._id, 1)}
                >
                +
                </button>
            </div>
            ) : (
            <button 
                className="add-to-cart-btn" 
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </button>
            )}
        
        {user && user.role === 'admin' && (
          <button 
            onClick={() => onDelete(product._id)}
            className="delete-product-btn"
          >
            <Trash2 size={18} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;