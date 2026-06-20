import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, Search } from 'lucide-react';
import { orderService } from '../../services/cartService';
import Loader from '../../components/Loader/Loader';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getOrders();
        setOrders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="orders-search">
          <Search size={18} />
          <input type="text" placeholder="Search all orders" />
        </div>
      </div>

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header-row">
                <div className="order-meta-info">
                  <div className="meta-col">
                    <span className="meta-label">ORDER PLACED</span>
                    <span className="meta-val">{order.date}</span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-label">TOTAL</span>
                    <span className="meta-val">₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-label">SHIP TO</span>
                    <span className="meta-val">John Doe</span>
                  </div>
                </div>
                <div className="order-id-info">
                  <span className="meta-label">ORDER # {order.id}</span>
                  <div className="order-links">
                    <a href="#">Order Details</a> | <a href="#">Invoice</a>
                  </div>
                </div>
              </div>
              
              <div className="order-body">
                <div className="order-status-banner">
                  <h3 className={order.status.toLowerCase()}>{order.status}</h3>
                  <p>Your order was processed on {order.date}</p>
                </div>
                
                {/* Mock single product per order for demo */}
                <div className="order-item-detail">
                  <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=100" alt="Product" />
                  <div className="item-info">
                    <h4>Classic White Sneakers</h4>
                    <p className="item-desc">Premium quality leather sneakers for everyday use.</p>
                    <button className="btn btn-primary buy-again">Buy it again</button>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-outline">Track package</button>
                    <button className="btn btn-outline">Return items</button>
                    <button className="btn btn-outline">Write a review</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders">
            <Package size={60} />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
