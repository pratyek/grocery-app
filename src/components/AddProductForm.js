import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

const AddProductForm = ({ onProductAdded }) => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!productData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!productData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!productData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(productData.price) || Number(productData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post(
        'http://localhost:3000/api/products',
        {
          ...productData,
          price: Number(productData.price)
        },
        { withCredentials: true }
      );
      
      onProductAdded(res.data.product);
      
      // Reset form
      setProductData({
        name: '',
        description: '',
        price: ''
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form-container">
      <h2>Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleChange}
            className={errors.description ? 'input-error' : ''}
            rows="3"
          ></textarea>
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price (Rs.)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={productData.price}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            className={errors.price ? 'input-error' : ''}
          />
          {errors.price && <p className="field-error">{errors.price}</p>}
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="submit-product-btn"
        >
          {loading ? 'Adding...' : <><Plus size={18} /> Add Product</>}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;