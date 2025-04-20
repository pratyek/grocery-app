import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPortal = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get('https://grocery-app-vktw.onrender.com/api/admin/orders', {
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
    setUpdatingOrder(orderId);
    
    try {
      const res = await axios.put(
        `https://grocery-app-vktw.onrender.com/api/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      // Update order in state
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
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

  return (
    <div className="admin-portal">
      <h1>Admin Portal</h1>
      
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map(order => (
            <div key={order._id} className="admin-order-card">
              <div className="admin-order-header">
                <div>
                  <h3>Order #{order.orderId}</h3>
                  <p>Placed by: {order.username}</p>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="admin-order-items">
                {order.products.map((product, index) => (
                  <div key={index} className="admin-order-item">
                    <span className="product-name">{product.name}</span>
                    <span className="product-quantity">x{product.quantity}</span>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="admin-order-total">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="admin-order-actions">
                <label>Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  disabled={updatingOrder === order._id}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delivered">Delivered</option>
                </select>
                {updatingOrder === order._id && <span className="updating">Updating...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPortal;