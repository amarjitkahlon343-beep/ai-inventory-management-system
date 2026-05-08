import React from 'react';
import axios from 'axios';

function ReportGenerator({ products, orders }) {
  const generateCSV = () => {
    const headers = ['Product Name', 'SKU', 'Current Stock', 'Min Level', 'Unit Price', 'Total Value'];
    const rows = products.map(p => [
      p.name,
      p.sku,
      p.current_stock,
      p.min_stock_level,
      p.unit_price,
      p.current_stock * p.unit_price
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateOrdersReport = () => {
    const headers = ['Order #', 'Product', 'Quantity', 'Total', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.order_number,
      o.product_name,
      o.quantity,
      o.total_amount,
      o.status,
      new Date(o.order_date).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
      <button
        onClick={generateCSV}
        style={{
          padding: '10px 20px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        📊 Export Inventory Report
      </button>
      <button
        onClick={generateOrdersReport}
        style={{
          padding: '10px 20px',
          background: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        📄 Export Orders Report
      </button>
    </div>
  );
}

export default ReportGenerator;