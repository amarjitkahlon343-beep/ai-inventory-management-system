import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const API_URL = 'http://localhost:3002'; // Make sure this matches your backend port

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            console.log('Fetching orders from:', `${API_URL}/api/purchase-orders`);
            const response = await axios.get(`${API_URL}/api/purchase-orders`);
            console.log('Orders received:', response.data);

            if (response.data && response.data.data) {
                setOrders(response.data.data);
            } else {
                setOrders([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(`Failed to load orders: ${err.message}. Make sure backend is running on port 3002`);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`${API_URL}/api/purchase-orders/${orderId}/status`, { status: newStatus });
            // Refresh orders list
            fetchOrders();
            alert(`✅ Order status updated to ${newStatus}`);
        } catch (err) {
            console.error('Error updating status:', err);
            alert(`❌ Failed to update status: ${err.message}`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'approved': return '#17a2b8';
            case 'shipped': return '#007bff';
            case 'received': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusBadge = (status) => {
        return {
            backgroundColor: getStatusColor(status),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-block'
        };
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column'
            }}>
                <div className="spinner"></div>
                <p>Loading purchase orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '20px',
                borderRadius: '8px',
                margin: '20px',
                textAlign: 'center'
            }}>
                <h3>⚠️ Error</h3>
                <p>{error}</p>
                <button
                    onClick={fetchOrders}
                    style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <h2 style={{ margin: 0 }}>📄 Purchase Orders</h2>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '8px 16px',
                            background: filter === 'all' ? '#667eea' : '#e0e0e0',
                            color: filter === 'all' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        All ({orders.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        style={{
                            padding: '8px 16px',
                            background: filter === 'pending' ? '#ffc107' : '#e0e0e0',
                            color: filter === 'pending' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Pending ({orders.filter(o => o.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        style={{
                            padding: '8px 16px',
                            background: filter === 'approved' ? '#17a2b8' : '#e0e0e0',
                            color: filter === 'approved' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Approved ({orders.filter(o => o.status === 'approved').length})
                    </button>
                    <button
                        onClick={() => setFilter('received')}
                        style={{
                            padding: '8px 16px',
                            background: filter === 'received' ? '#28a745' : '#e0e0e0',
                            color: filter === 'received' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Received ({orders.filter(o => o.status === 'received').length})
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    color: '#666'
                }}>
                    <h3>📭 No Purchase Orders Yet</h3>
                    <p>Click "Order" on any product to generate your first purchase order!</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            <thead>
                                <tr style={{ background: '#667eea', color: 'white' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Order #</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>SKU</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Quantity</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Total</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Order Date</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Expected Delivery</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        style={{
                                            borderBottom: '1px solid #e0e0e0',
                                            background: index % 2 === 0 ? 'white' : '#f8f9fa'
                                        }}
                                    >
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>
                                            {order.order_number}
                                        </td>
                                        <td style={{ padding: '12px' }}>{order.product_name}</td>
                                        <td style={{ padding: '12px', color: '#666' }}>{order.sku}</td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>{order.quantity}</td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>${order.unit_price}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#667eea' }}>
                                            ${order.total_amount}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={getStatusBadge(order.status)}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {new Date(order.order_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {order.expected_delivery || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #ddd',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="received">Received</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginTop: '30px'
                    }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h4>Total Orders</h4>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{orders.length}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h4>Total Value</h4>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                                ${orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                            <h4>Pending Orders</h4>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
                                {orders.filter(o => o.status === 'pending').length}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default PurchaseOrders;