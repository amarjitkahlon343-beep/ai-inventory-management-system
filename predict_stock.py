import sys
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

def predict_stock_out(product_data, sales_history):
    """
    Predict when product will run out of stock using Linear Regression
    """
    # Handle insufficient data
    if len(sales_history) < 5:
        return {
            "product_id": product_data['id'],
            "product_name": product_data['name'],
            "current_stock": product_data['current_stock'],
            "avg_daily_sales": 0,
            "predicted_daily_sales": [],
            "stock_out_date": None,
            "days_until_stockout": None,
            "needs_reorder": product_data['current_stock'] <= product_data.get('min_stock_level', 10),
            "recommended_order_quantity": max(product_data.get('min_stock_level', 10), 20),
            "confidence_score": 0,
            "warning": "Insufficient sales data for accurate prediction"
        }
    
    try:
        # Prepare data for training
        sales_df = pd.DataFrame(sales_history)
        sales_df['sale_date'] = pd.to_datetime(sales_df['sale_date'])
        sales_df['date_num'] = (sales_df['sale_date'] - pd.Timestamp('2024-01-01')).dt.days
        
        X = sales_df['date_num'].values.reshape(-1, 1)
        y = sales_df['daily_sales'].values
        
        # Train Linear Regression model
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict daily sales for next 30 days
        last_date = sales_df['sale_date'].max()
        future_dates = [last_date + timedelta(days=i) for i in range(1, 31)]
        future_dates_num = [(date - pd.Timestamp('2024-01-01')).days for date in future_dates]
        
        predicted_sales = model.predict(np.array(future_dates_num).reshape(-1, 1))
        predicted_sales = np.maximum(predicted_sales, 0)  # No negative sales
        
        # Calculate when stock will run out
        current_stock = product_data['current_stock']
        cumulative_sales = 0
        stock_out_day = None
        
        for i, daily_sale in enumerate(predicted_sales):
            cumulative_sales += daily_sale
            if cumulative_sales >= current_stock:
                stock_out_day = future_dates[i]
                break
        
        # Calculate average daily sales
        avg_daily_sales = np.mean(y)
        
        # Determine if reorder is needed
        days_until_stockout = None
        if stock_out_day:
            days_until_stockout = (stock_out_day.date() - datetime.now().date()).days
        
        needs_reorder = current_stock <= product_data.get('min_stock_level', 10) or \
                       (days_until_stockout and days_until_stockout <= 7)
        
        # Recommended order quantity
        recommended_order = product_data.get('max_stock_level', 100) - current_stock
        if recommended_order < 10:
            recommended_order = product_data.get('min_stock_level', 20)
        
        # Calculate confidence score
        confidence_score = model.score(X, y)
        
        return {
            "product_id": product_data['id'],
            "product_name": product_data['name'],
            "current_stock": current_stock,
            "avg_daily_sales": round(float(avg_daily_sales), 2),
            "predicted_daily_sales": [round(float(s), 2) for s in predicted_sales[:7]],
            "stock_out_date": str(stock_out_day.date()) if stock_out_day else None,
            "days_until_stockout": days_until_stockout,
            "needs_reorder": bool(needs_reorder),
            "recommended_order_quantity": int(recommended_order),
            "confidence_score": round(float(confidence_score), 2)
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "product_id": product_data['id'],
            "product_name": product_data['name'],
            "current_stock": product_data['current_stock'],
            "needs_reorder": True
        }

if __name__ == "__main__":
    # Read input from command line
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            product_data = input_data['product']
            sales_history = input_data['sales_history']
            
            result = predict_stock_out(product_data, sales_history)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps({"error": "No input data provided"}))