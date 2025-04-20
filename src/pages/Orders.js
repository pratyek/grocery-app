import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path as needed

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { user } = useAuth(); // Get the current user to check if they're an admin

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Different endpoint based on user role
      const endpoint = user?.role === 'admin' 
        ? 'https://grocery-app-vktw.onrender.com/api/admin/orders' 
        : 'https://grocery-app-vktw.onrender.com/api/orders';
      
      const res = await axios.get(endpoint, {
        withCredentials: true
      });
      setOrders(res.data.orders);
    } catch (error) {
      setError('Error fetching orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await axios.put(
        `https://grocery-app-vktw.onrender.com/api/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
    } catch (error) {
      setError('Error updating order status');
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-progress';
      case 'Delivered': return 'status-delivered';
      default: return '';
    }
  };

  // Toggle order details visibility
  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Order status options for admin dropdown
  const statusOptions = ['Pending', 'In Progress', 'Delivered'];

  return (
    <div className="orders-page">
      <h1>{user?.role === 'admin' ? 'All Orders' : 'Your Orders'}</h1>
      
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>{user?.role === 'admin' ? 'There are no orders yet.' : 'You haven\'t placed any orders yet.'}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-header-left">
                  <h3>Order #{order.orderId}</h3>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                  {user?.role === 'admin' && (
                    <p className="order-username">Placed by: <strong>{order.username}</strong></p>
                  )}
                </div>
                
                <div className="order-header-right">
                  {user?.role === 'admin' ? (
                    <div className="admin-status-control">
                      {updatingOrderId === order._id ? (
                        <span className="updating-status">Updating...</span>
                      ) : (
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`status-select ${getStatusClass(order.status)}`}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="order-items">
                {order.products.map((product, index) => (
                  <div key={index} className="order-item">
                    <span className="product-name">{product.name}</span>
                    <span className="product-quantity">x{product.quantity}</span>
                    <span className="product-price">Rs.{product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <span>Total:</span>
                <span>Rs.{order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="order-actions">
                <button 
                  className="toggle-details-btn"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  {expandedOrderId === order._id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {expandedOrderId === order._id && (
                <div className="order-delivery-details">
                  <h4>Delivery Details</h4>
                  <div className="delivery-info">
                    <div className="delivery-address">
                      <strong>Address:</strong>
                      <p>{order.deliveryDetails?.address || 'No address provided'}</p>
                    </div>
                    <div className="delivery-phone">
                      <strong>Phone:</strong>
                      <p>{order.deliveryDetails?.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;