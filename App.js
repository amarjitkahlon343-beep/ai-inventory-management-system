import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PurchaseOrders from './PurchaseOrders';
import './App.css';
import DashboardCharts from './components/DashboardCharts';
import StockAdjustment from './components/StockAdjustment';
import ReportGenerator from './components/ReportGenerator';
import AddProductModal from './components/AddProductModal';
function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0, lowStockCount: 0 });
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/inventory/summary');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/purchase-orders');
            setOrders(response.data.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            console.log('Fetching products from http://localhost:3002/api/products');
            const response = await axios.get('http://localhost:3002/api/products');
            console.log('Response received:', response.data);

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
            } else {
                console.log('No products data found, using empty array');
                setProducts([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(`Cannot connect to backend: ${err.message}`);
            setProducts([]);
            setLoading(false);
        }
    };

    const getPrediction = async (productId, productName) => {
        try {
            const response = await axios.get(`http://localhost:3002/api/predictions/product/${productId}`);
            setPrediction(response.data.data);
            setSelectedProduct(productName);
            setShowModal(true);
        } catch (err) {
            alert(`Failed to get AI prediction: ${err.message}`);
        }
    };

    const generatePO = async (productId, productName, price) => {
        const quantity = prompt(`Enter order quantity for ${productName}:`, '50');
        if (!quantity) return;

        try {
            const response = await axios.post('http://localhost:3002/api/predictions/generate-po', {
                product_id: productId,
                quantity: parseInt(quantity)
            });

            if (response.data.success) {
                alert(`✅ Purchase Order Generated!\n\nOrder Number: ${response.data.order_number}\nProduct: ${productName}\nQuantity: ${quantity}\nTotal: $${response.data.total_amount}`);
                fetchOrders(); // Refresh orders list
                fetchStats(); // Refresh stats
            }
        } catch (err) {
            alert(`Failed to generate purchase order: ${err.message}`);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(255,255,255,0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                }}></div>
                <p>Loading inventory data...</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>Connecting to backend at http://localhost:3002</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
                <div style={{
                    maxWidth: '600px',
                    margin: '100px auto',
                    background: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ color: '#e74c3c' }}>⚠️ Connection Error</h2>
                    <p style={{ color: '#666', margin: '20px 0' }}>{error}</p>
                    <p style={{ color: '#666', margin: '10px 0' }}>
                        <strong>To fix this:</strong>
                    </p>
                    <ol style={{ textAlign: 'left', margin: '20px auto', maxWidth: '400px' }}>
                        <li>Open a new terminal/command prompt</li>
                        <li>Run: <code style={{ background: '#f0f0f0', padding: '2px 6px' }}>cd C:\projects\NodeConsoleApp</code></li>
                        <li>Run: <code style={{ background: '#f0f0f0', padding: '2px 6px' }}>node server.js</code></li>
                        <li>Refresh this page</li>
                    </ol>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '10px 30px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            marginTop: '20px'
                        }}
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    // Check if products is empty or not an array
    const productList = Array.isArray(products) ? products : [];
    const lowStockCount = productList.filter(p => p.current_stock <= p.min_stock_level).length;
    const totalInventoryValue = productList.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);

    // Main render - show products
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {/* Header with Navigation */}
            <header style={{ background: 'white', padding: '20px 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ color: '#333', marginBottom: '5px' }}>🤖 AI-Powered Inventory Management System</h1>
                        <p style={{ color: '#666', margin: 0 }}>Smart inventory tracking with AI predictions and automated reordering</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            style={{
                                padding: '10px 20px',
                                background: currentPage === 'dashboard' ? '#667eea' : '#e0e0e0',
                                color: currentPage === 'dashboard' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setCurrentPage('orders')}
                            style={{
                                padding: '10px 20px',
                                background: currentPage === 'orders' ? '#667eea' : '#e0e0e0',
                                color: currentPage === 'orders' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            📄 Purchase Orders ({orders.length})
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setCurrentPage('dashboard')}
                        style={{
                            padding: '10px 20px',
                            background: currentPage === 'dashboard' ? '#667eea' : '#e0e0e0',
                            color: currentPage === 'dashboard' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setCurrentPage('orders')}
                        style={{
                            padding: '10px 20px',
                            background: currentPage === 'orders' ? '#667eea' : '#e0e0e0',
                            color: currentPage === 'orders' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        📄 Purchase Orders ({orders.length})
                    </button>
                    {/* ADD THIS BUTTON */}
                    <button
                        onClick={() => setShowAddProductModal(true)}
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ➕ Add Product

                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
                {currentPage === 'dashboard' ? (
                    <>
                        {/* Reports Section - New Feature */}
                        <ReportGenerator products={productList} orders={orders} />

                        {/* Charts Section - New Feature */}
                        <DashboardCharts products={productList} />

                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Total Products</h3>
                                <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#667eea' }}>{productList.length}</div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Inventory Value</h3>
                                <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#667eea' }}>
                                    ${totalInventoryValue.toLocaleString()}
                                </div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Low Stock Items</h3>
                                <div style={{ fontSize: '42px', fontWeight: 'bold', color: lowStockCount > 0 ? '#e74c3c' : '#27ae60' }}>
                                    {lowStockCount}
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <h2 style={{ color: 'white', marginBottom: '20px' }}>📦 Product Inventory</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
                            {productList.map(product => {
                                const isLowStock = product.current_stock <= product.min_stock_level;
                                const stockPercent = (product.current_stock / product.max_stock_level) * 100;

                                return (
                                    <div key={product.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                            <h3 style={{ color: '#333', fontSize: '18px' }}>{product.name}</h3>
                                            <span style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', background: isLowStock ? '#f8d7da' : '#d4edda', color: isLowStock ? '#721c24' : '#155724' }}>
                                                {isLowStock ? '⚠️ Low Stock' : '✓ In Stock'}
                                            </span>
                                        </div>

                                        <div style={{ color: '#999', fontSize: '12px', marginBottom: '15px' }}>SKU: {product.sku}</div>

                                        <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', margin: '15px 0' }}>
                                            <div style={{ width: `${stockPercent}%`, height: '100%', background: isLowStock ? '#f44336' : '#4caf50' }}></div>
                                        </div>

                                        <div style={{ margin: '15px 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#666' }}>
                                                <span>Current Stock:</span>
                                                <strong>{product.current_stock} / {product.max_stock_level}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#666' }}>
                                                <span>Min Level:</span>
                                                <strong>{product.min_stock_level}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#666' }}>
                                                <span>Unit Price:</span>
                                                <strong style={{ color: '#667eea' }}>${product.unit_price}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#666' }}>
                                                <span>Supplier:</span>
                                                <span>{product.supplier_name}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', margin: '20px 0 10px' }}>
                                            <button onClick={() => getPrediction(product.id, product.name)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#667eea', color: 'white', fontWeight: 'bold' }}>
                                                🤖 AI Predict
                                            </button>
                                            <button onClick={() => generatePO(product.id, product.name, product.unit_price)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: isLowStock ? '#f44336' : '#4caf50', color: 'white', fontWeight: 'bold' }}>
                                                📄 Order
                                            </button>
                                        </div>

                                        {/* Stock Adjustment Component - New Feature */}
                                        <StockAdjustment product={product} onUpdate={fetchProducts} />

                                        {isLowStock && (
                                            <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '10px', marginTop: '10px', borderRadius: '5px', fontSize: '12px', color: '#856404' }}>
                                                ⚠️ Low stock alert! Immediate reorder recommended.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <PurchaseOrders />
                )}
            </div>

            {/* Prediction Modal */}
            {showModal && prediction && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
                            <h2>🤖 AI Prediction</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h3>{selectedProduct}</h3>

                            <div style={{ margin: '20px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>Current Stock:</span>
                                    <strong>{prediction.current_stock} units</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>Min Level:</span>
                                    <strong>{prediction.min_stock_level} units</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>Avg Daily Sales:</span>
                                    <strong>{prediction.avg_daily_sales} units/day</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>Days Until Stockout:</span>
                                    <strong style={{ color: prediction.days_until_stockout < 7 ? '#f44336' : 'inherit' }}>{prediction.days_until_stockout} days</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>Stockout Date:</span>
                                    <strong>{prediction.stock_out_date}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>Recommended Order:</span>
                                    <strong style={{ color: '#667eea' }}>{prediction.recommended_order_quantity} units</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                    <span>AI Confidence:</span>
                                    <strong>{(prediction.confidence_score * 100).toFixed(0)}%</strong>
                                </div>
                            </div>

                            <div style={{ padding: '15px', borderRadius: '8px', margin: '20px 0', background: prediction.needs_reorder ? '#f8d7da' : '#d4edda', color: prediction.needs_reorder ? '#721c24' : '#155724', borderLeft: `4px solid ${prediction.needs_reorder ? '#f44336' : '#4caf50'}` }}>
                                {prediction.needs_reorder ? '⚠️ IMMEDIATE REORDER REQUIRED! Stock will run out soon.' : '✅ Stock level is adequate for now.'}
                            </div>

                            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                                Close
                            </button>
                        </div>
                    </div>
                    {/* Add Product Modal */}
                    <AddProductModal
                        isOpen={showAddProductModal}
                        onClose={() => setShowAddProductModal(false)}
                        onProductAdded={() => {
                            fetchProducts();
                            fetchStats();
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default App;