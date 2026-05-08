const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');

// Predict stock for a product
exports.predictStock = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.getById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const salesHistory = await Product.getSalesHistory(productId, 30);

        // For now, return mock data since Python may not be set up
        // This will allow you to test the API without Python
        const mockPrediction = {
            product_id: product.id,
            product_name: product.name,
            current_stock: product.current_stock,
            avg_daily_sales: 5.5,
            predicted_daily_sales: [4, 5, 6, 5, 4, 6, 5],
            stock_out_date: "2026-04-15",
            days_until_stockout: 24,
            needs_reorder: product.current_stock <= product.min_stock_level,
            recommended_order_quantity: product.max_stock_level - product.current_stock,
            confidence_score: 0.85,
            message: "Using mock data - Python ML script not yet configured"
        };

        res.json({
            success: true,
            data: mockPrediction
        });

    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Generate purchase order PDF
exports.generatePurchaseOrder = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: product_id and quantity'
            });
        }

        const product = await Product.getById(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Generate unique order number
        const orderNumber = `PO-${Date.now()}-${product_id}`;

        // Save to database
        const orderData = {
            product_id: product.id,
            quantity: parseInt(quantity),
            order_number: orderNumber
        };

        await Product.createPurchaseOrder(orderData);

        // Generate PDF
        const pdfPath = await generatePDF(product, quantity, orderNumber);

        res.json({
            success: true,
            order_number: orderNumber,
            pdf_path: pdfPath,
            message: 'Purchase order generated successfully',
            product: product.name,
            quantity: quantity,
            total_amount: product.unit_price * quantity
        });

    } catch (error) {
        console.error('PO generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Helper function to generate PDF
async function generatePDF(product, quantity, orderNumber) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filename = `purchase_order_${orderNumber}.pdf`;
        const pdfDir = path.join(__dirname, '../pdfs');
        const filepath = path.join(pdfDir, filename);

        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .text('PURCHASE ORDER', { align: 'center' });
        doc.moveDown();

        // Company Info
        doc.fontSize(10)
            .font('Helvetica')
            .text('AI Inventory Management Systems', { align: 'center' })
            .text('123 Business Ave, Tech City, TC 12345', { align: 'center' });
        doc.moveDown();

        // Order Details
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Order Details:', { underline: true });
        doc.fontSize(10)
            .font('Helvetica')
            .text(`Order Number: ${orderNumber}`)
            .text(`Date: ${new Date().toLocaleDateString()}`)
            .text(`Supplier: ${product.supplier_name || 'Not specified'}`);
        doc.moveDown();

        // Product Details
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Product Details:', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(10)
            .font('Helvetica')
            .text(`Product: ${product.name}`)
            .text(`SKU: ${product.sku}`)
            .text(`Quantity: ${quantity} units`)
            .text(`Unit Price: $${product.unit_price}`)
            .text(`Total Amount: $${(product.unit_price * quantity).toFixed(2)}`);
        doc.moveDown();

        // Footer
        doc.fontSize(8)
            .text('Terms: Net 30 days', { align: 'center' })
            .text('Thank you for your business!', { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
}