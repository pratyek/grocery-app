import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Cart = () => {
  const { cartItems, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({
    address: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { address: '', phone: '' };
    
    if (!deliveryDetails.address.trim()) {
      errors.address = 'Delivery address is required';
      isValid = false;
    }
    
    if (!deliveryDetails.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(deliveryDetails.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setShowDeliveryForm(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Format order items
      const orderProducts = cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      // Create order
      await axios.post(
        'https://grocery-app-vktw.onrender.com/api/orders',
        {
          products: orderProducts,
          totalAmount: total,
          deliveryDetails
        },
        { withCredentials: true }
      );
      
      // Clear cart and navigate to orders
      clearCart();
      navigate('/orders');
    } catch (error) {
      setError('Failed to place order. Please try again.');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeliveryForm = () => {
    setShowDeliveryForm(false);
    setDeliveryDetails({
      address: '',
      phone: ''
    });
    setFormErrors({
      address: '',
      phone: ''
    });
  };

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      
      {error && <p className="error">{error}</p>}
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <button 
            className="btn-continue-shopping"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {!showDeliveryForm ? (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>Rs.{item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button 
                          onClick={() => updateQuantity(item._id, -1)}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                      
                      <p className="item-total">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <h3>Total:</h3>
                  <h3>Rs.{total.toFixed(2)}</h3>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="checkout-btn"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          ) : (
            <div className="delivery-form-container">
              <h2>Delivery Details</h2>
              <form onSubmit={handlePlaceOrder} className="delivery-form">
                <div className="form-group">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={deliveryDetails.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? 'input-error' : ''}
                    placeholder="Enter your full delivery address"
                    rows="3"
                  ></textarea>
                  {formErrors.address && <p className="field-error">{formErrors.address}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={deliveryDetails.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'input-error' : ''}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && <p className="field-error">{formErrors.phone}</p>}
                </div>
                
                <div className="cart-total delivery-total">
                  <h3>Total:</h3>
                  <h3>Rs.{total.toFixed(2)}</h3>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={cancelDeliveryForm}
                    className="back-to-cart-btn"
                  >
                    Back to Cart
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="place-order-btn"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;