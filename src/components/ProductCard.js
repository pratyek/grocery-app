import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Trash, Minus, Plus } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product, onDelete }) => {
  const { user, cart, updateCart } = useAuth();
  const [quantity, setQuantity] = useState(0);
  const [isInCart, setIsInCart] = useState(false);

  // Check if product is in cart and set initial quantity
  useEffect(() => {
    if (cart && cart.items) {
      const cartItem = cart.items.find(item => item.product === product._id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
        setIsInCart(true);
      } else {
        setQuantity(0);
        setIsInCart(false);
      }
    }
  }, [cart, product._id]);

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(
        'https://grocery-app-vktw.onrender.com/api/cart/add',
        {
          productId: product._id,
          quantity: 1
        },
        { withCredentials: true }
      );
      
      updateCart(response.data.cart);
      setQuantity(1);
      setIsInCart(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    // If new quantity is 0, remove from cart
    if (newQuantity === 0) {
      try {
        const response = await axios.delete(
          `https://grocery-app-vktw.onrender.com/api/cart/${product._id}`,
          { withCredentials: true }
        );
        
        updateCart(response.data.cart);
        setIsInCart(false);
      } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Failed to remove product from cart');
      }
    } else {
      // Update quantity
      try {
        const response = await axios.patch(
          'https://grocery-app-vktw.onrender.com/api/cart/update',
          {
            productId: product._id,
            quantity: newQuantity
          },
          { withCredentials: true }
        );
        
        updateCart(response.data.cart);
        setQuantity(newQuantity);
      } catch (error) {
        console.error('Error updating cart:', error);
        alert('Failed to update cart');
      }
    }
  };

  const handleIncrement = () => {
    handleUpdateQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      handleUpdateQuantity(quantity - 1);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">${product.price.toFixed(2)} / {product.unit}</p>
        <p className="description">{product.description}</p>
      </div>
      
      <div className="product-actions">
        {user && (
          <div className="cart-actions">
            {isInCart ? (
              <div className="quantity-control">
                <button 
                  className="quantity-btn decrement" 
                  onClick={handleDecrement}
                >
                  <Minus size={16} />
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="quantity-btn increment" 
                  onClick={handleIncrement}
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button 
                className="add-to-cart-btn" 
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            )}
          </div>
        )}
        
        {user && user.role === 'admin' && (
          <button 
            className="delete-btn" 
            onClick={() => onDelete(product._id)}
          >
            <Trash size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;