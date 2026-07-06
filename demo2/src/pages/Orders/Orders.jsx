import React, { useState, useEffect } from 'react';
import { Package, Search } from 'lucide-react';
import { orderService } from '../../services/cartService';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import OrderActions from '../../components/OrderActions/OrderActions';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [res, prodRes] = await Promise.all([
          orderService.getOrders(),
          productService.getProducts()
        ]);
        const allProducts = prodRes.data || [];

        // API may return { results: [] } (paginated) or a plain array
        const rawData = Array.isArray(res.data)
          ? res.data
          : res.data?.results ?? [];
          
        // Trust the backend to return the correct orders for the user.
        // If it returns them, we display them.
        let userOrders = rawData;
        
        // Fetch detailed info (including items) for each order
        userOrders = await Promise.all(
          userOrders.map(async (order) => {
            try {
              const detailRes = await orderService.getOrder(order.id);
              const orderData = { ...order, ...detailRes.data };
              
              // Normalize the items array
              const orderItems = orderData.items || orderData.order_items || orderData.products || [];
              
              if (Array.isArray(orderItems) && orderItems.length > 0) {
                orderData.items = await Promise.all(orderItems.map(async (item) => {
                  const prodId = typeof item.product === 'object' ? item.product?.id : (item.product ?? item.product_id);
                  let matchedProduct = allProducts.find(p => p.id === prodId || String(p.id) === String(prodId));
                  
                  // If product not found in the initial batch, fetch it directly from the API
                  if (!matchedProduct && prodId) {
                    try {
                      const prodRes = await productService.getProductById(prodId);
                      if (prodRes && prodRes.data) {
                        matchedProduct = prodRes.data;
                      }
                    } catch (e) {
                      console.error(`Failed to fetch individual product ${prodId}`);
                    }
                  }

                  if (matchedProduct) {
                    item.resolvedImage = matchedProduct.image || matchedProduct.images?.[0];
                    item.resolvedName = matchedProduct.name || matchedProduct.title;
                  } else {
                    // Fallback to the names provided in the order item if product wasn't found in master list
                    item.resolvedImage = item.image || item.product_image;
                    item.resolvedName = item.product_name || item.name;
                  }
                  return item;
                }));
              } else {
                orderData.items = []; // Ensure it's always an array
              }
              return orderData;
            } catch (err) {
              console.error(`Failed to fetch details for order ${order.id}`, err);
              // Ensure items is an array even on error
              return { ...order, items: order.items || order.order_items || order.products || [] };
            }
          })
        );
        
        // Sort descending by ID or Date so newest is first
        userOrders.sort((a, b) => b.id - a.id);
        
        setOrders(userOrders);

        // 🔍 DEV: log the raw shape so you can confirm field names
        if (rawData.length > 0) console.log('Order shape:', rawData[0]);
      } catch (error) {
        console.error('Failed to fetch orders:', error?.response?.data ?? error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  // Helper: safely parse total from either number or string
  const formatTotal = (order) => {
    const raw =
      order.total ??
      order.total_price ??
      order.total_amount ??
      order.grand_total ??
      0;
    return Number(raw).toFixed(2);
  };

  // Helper: resolve date field
  const formatDate = (order) => {
    const raw =
      order.date ??
      order.created_at ??
      order.order_date ??
      order.placed_at ??
      '';
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // Helper: resolve status field
  const getStatus = (order) =>
    order.status ?? order.order_status ?? order.state ?? 'Pending';

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      getStatus(o).toLowerCase().includes(q)
    );
  });

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="orders-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search all orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-list">
        {filtered.length > 0 ? (
          filtered.map((order) => {
            const status = getStatus(order);
            return (
              <div key={order.id} className="order-card">
                <div className="order-header-row">
                  <div className="order-meta-info">
                    <div className="meta-col">
                      <span className="meta-label">ORDER PLACED</span>
                      <span className="meta-val">{formatDate(order)}</span>
                    </div>
                    <div className="meta-col">
                      <span className="meta-label">TOTAL</span>
                      <span className="meta-val">₹{formatTotal(order)}</span>
                    </div>
                    <div className="meta-col">
                      <span className="meta-label">SHIP TO</span>
                      <span className="meta-val">
                        {order.user?.name ?? order.shipping_name ?? 'You'}
                      </span>
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
                    <h3 className={status.toLowerCase()}>{status}</h3>
                    <p>Your order was processed on {formatDate(order)}</p>
                  </div>

                  {/* Render real items if API returns them, else show placeholder */}
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="order-item-detail">
                        <img
                          src={item.resolvedImage ?? item.product?.image ?? item.image ?? item.product_image ?? 'https://via.placeholder.com/100'}
                          alt={item.resolvedName ?? item.product?.name ?? item.name ?? item.product_name ?? 'Product'}
                        />
                        <div className="item-info">
                          <h4>{item.resolvedName ?? item.product?.name ?? item.name ?? item.product_name ?? 'Product'}</h4>
                          <p className="item-desc">
                            Qty: {item.quantity} &nbsp;|&nbsp; ₹{Number(item.price ?? item.unit_price ?? 0).toFixed(2)}
                          </p>
                          <button className="btn btn-primary buy-again">Buy it again</button>
                        </div>
                        <OrderActions orderId={order.id} item={item} />
                      </div>
                    ))
                  ) : (
                    // Fallback placeholder when items aren't in the response
                    <div className="order-item-detail">
                      <img
                        src={order.image ?? order.product_image ?? "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=100"}
                        alt="Product"
                      />
                      <div className="item-info">
                        <h4>Order #{order.id}</h4>
                        <p className="item-desc">See order details for items.</p>
                        <button className="btn btn-primary buy-again">Buy it again</button>
                      </div>
                      <OrderActions orderId={order.id} item={null} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-orders">
            <Package size={60} />
            <h2>{search ? 'No matching orders' : 'No orders found'}</h2>
            <p>{search ? 'Try a different search term.' : "You haven't placed any orders yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;