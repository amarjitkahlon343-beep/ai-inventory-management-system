import React, { useState } from 'react';
import axios from 'axios';

function AddProductModal({ isOpen, onClose, onProductAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Electronics',
        current_stock: 0,
        min_stock_level: 10,
        max_stock_level: 100,
        unit_price: 0,
        supplier_name: '',
        supplier_email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'current_stock' || name === 'min_stock_level' || 
                    name === 'max_stock_level' || name === 'unit_price' 
                    ? parseFloat(value) || 0 
                    : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!formData.name || !formData.sku || !formData.unit_price) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3002/api/products/add', formData);
            
            if (response.data.success) {
                alert(`✅ Product "${formData.name}" added successfully!`);
                onProductAdded(); // Refresh product list
                onClose(); // Close modal
                // Reset form
                setFormData({
                    name: '',
                    sku: '',
                    category: 'Electronics',
                    current_stock: 0,
                    min_stock_level: 10,
                    max_stock_level: 100,
                    unit_price: 0,
                    supplier_name: '',
                    supplier_email: ''
                });
            } else {
                setError(response.data.error || 'Failed to add product');
            }
        } catch (err) {
            console.error('Error adding product:', err);
            setError(err.response?.data?.error || 'Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: '1px solid #e0e0e0',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <h2 style={{ margin: 0 }}>➕ Add New Product</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: 'white',
                            padding: '0 10px'
                        }}
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    {error && (
                        <div style={{
                            background: '#f8d7da',
                            color: '#721c24',
                            padding: '10px',
                            borderRadius: '6px',
                            marginBottom: '20px',
                            borderLeft: '4px solid #f44336'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="e.g., Wireless Headphones"
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            SKU (Stock Keeping Unit) *
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="e.g., PROD005"
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="Electronics">Electronics</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Office Supplies">Office Supplies</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Current Stock
                            </label>
                            <input
                                type="number"
                                name="current_stock"
                                value={formData.current_stock}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Unit Price ($) *
                            </label>
                            <input
                                type="number"
                                name="unit_price"
                                value={formData.unit_price}
                                onChange={handleChange}
                                step="0.01"
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Min Stock Level
                            </label>
                            <input
                                type="number"
                                name="min_stock_level"
                                value={formData.min_stock_level}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Max Stock Level
                            </label>
                            <input
                                type="number"
                                name="max_stock_level"
                                value={formData.max_stock_level}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Supplier Name
                        </label>
                        <input
                            type="text"
                            name="supplier_name"
                            value={formData.supplier_name}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="e.g., Tech Supplies Inc."
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Supplier Email
                        </label>
                        <input
                            type="email"
                            name="supplier_email"
                            value={formData.supplier_email}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            placeholder="e.g., orders@techsupplies.com"
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                background: '#e0e0e0',
                                color: '#333',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Adding...' : '➕ Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductModal;