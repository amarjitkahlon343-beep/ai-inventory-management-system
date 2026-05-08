import React, { useState } from 'react';
import axios from 'axios';

function StockAdjustment({ product, onUpdate }) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('add');

  const handleAdjustment = async () => {
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3002/api/stock/adjust', {
        product_id: product.id,
        quantity: type === 'add' ? quantity : -quantity,
        reason: reason,
        adjusted_by: 'Admin'
      });

      if (response.data.success) {
        alert(`Stock ${type === 'add' ? 'added' : 'removed'} successfully!`);
        onUpdate();
        setQuantity(0);
        setReason('');
      }
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  return (
    <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>📦 Stock Adjustment</h4>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select 
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
        >
          <option value="add">➕ Add Stock</option>
          <option value="remove">➖ Remove Stock</option>
        </select>
        
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100px' }}
        />
        
        <input
          type="text"
          placeholder="Reason (e.g., New shipment)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', flex: 1 }}
        />
        
        <button
          onClick={handleAdjustment}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default StockAdjustment;