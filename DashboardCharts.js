import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DashboardCharts({ products }) {
  // Stock Level Chart Data
  const stockData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Current Stock',
        data: products.map(p => p.current_stock),
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
      },
      {
        label: 'Min Stock Level',
        data: products.map(p => p.min_stock_level),
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
        borderColor: 'rgba(244, 67, 54, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Stock Value Chart
  const stockValueData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Inventory Value ($)',
        data: products.map(p => p.current_stock * p.unit_price),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)',
        ],
        borderWidth: 1,
      }
    ]
  };

  // Stock Status Distribution
  const lowStockCount = products.filter(p => p.current_stock <= p.min_stock_level).length;
  const goodStockCount = products.length - lowStockCount;
  
  const distributionData = {
    labels: ['Good Stock', 'Low Stock'],
    datasets: [
      {
        data: [goodStockCount, lowStockCount],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>📊 Inventory Analytics</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px',
        marginBottom: '30px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h4>Stock Levels Comparison</h4>
          <div style={{ height: '300px' }}>
            <Bar data={stockData} options={options} />
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h4>Inventory Value by Product</h4>
          <div style={{ height: '300px' }}>
            <Bar data={stockValueData} options={options} />
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h4>Stock Status Distribution</h4>
          <div style={{ height: '300px' }}>
            <Doughnut data={distributionData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;