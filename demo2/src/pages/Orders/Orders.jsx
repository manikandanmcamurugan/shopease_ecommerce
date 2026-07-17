import React, { useState, useEffect } from 'react';
import { Package, Search } from 'lucide-react';
import { orderService } from '../../services/cartService';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Orders.css';
import { Link, useNavigate } from 'react-router-dom';
import { TrackingModal, ShippingModal, FeedbackModal, ReviewModal } from '../../components/OrderModals/OrderModals';

const Orders = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [activeShippingOrder, setActiveShippingOrder] = useState(null);
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState(null);
  const [activeReviewProduct, setActiveReviewProduct] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoiceId(orderId);
      const response = await orderService.generateInvoice(orderId);
      
      // Determine filename from headers if possible, or fallback
      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `invoice_${orderId}.pdf`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      let errMsg = 'Failed to download invoice.';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          errMsg += ` Backend says: ${text}`;
        } catch (e) {
          // ignore
        }
      } else if (error.response?.data) {
        errMsg += ` Backend says: ${JSON.stringify(error.response.data)}`;
      } else {
        errMsg += ` ${error.message}`;
      }
      alert(errMsg);
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      // Optimistically update local state
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updated = { ...o, status: 'Cancelled', order_status: 'Cancelled', state: 'Cancelled' };
          // Save to local storage to persist locally since backend API is mocked
          const cancelledIds = JSON.parse(localStorage.getItem('shopease_cancelled_orders') || '[]');
          if (!cancelledIds.includes(orderId)) {
            cancelledIds.push(orderId);
            localStorage.setItem('shopease_cancelled_orders', JSON.stringify(cancelledIds));
          }
          return updated;
        }
        return o;
      }));
    }
  };

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
              const orderItems = orderData.items || orderData.order_items || orderData.cart_items || orderData.products || [];
              
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
              return { ...order, items: order.items || order.order_items || order.cart_items || order.products || [] };
            }
          })
        );
        
        // Merge with LocalStorage orders to guarantee items are present
        // (Fixes the issue where the backend ignores items from Buy Now)
        const localOrders = JSON.parse(localStorage.getItem('shopease_recent_orders') || '[]');
        
        // Merge local items into backend orders
        userOrders = userOrders.map(order => {
          const matchingLocal = localOrders.find(lo => String(lo.id) === String(order.id));
          if (matchingLocal && (!order.items || order.items.length === 0)) {
            // Backend order is empty, but we have the items in local storage!
            return { ...order, items: matchingLocal.items, total_amount: matchingLocal.total_amount };
          }
          return order;
        });

        // Add any local orders that the backend doesn't even know about yet
        localOrders.forEach(localOrder => {
          if (!userOrders.find(o => String(o.id) === String(localOrder.id))) {
            userOrders.push(localOrder);
          }
        });
        
        // Filter out completely empty orders from the backend to remove static dummy entries
        userOrders = userOrders.filter(order => order.items && order.items.length > 0);
        
        // Sort descending by ID or Date so newest is first
        userOrders.sort((a, b) => b.id - a.id);
        
        // Apply locally cancelled orders overlay
        const cancelledIds = JSON.parse(localStorage.getItem('shopease_cancelled_orders') || '[]');
        userOrders = userOrders.map(o => {
          if (cancelledIds.includes(o.id)) {
            return { ...o, status: 'Cancelled', order_status: 'Cancelled', state: 'Cancelled' };
          }
          return o;
        });

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

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `https://z12.7d8.mytemp.website${url}`;
    return `https://z12.7d8.mytemp.website/${url}`;
  };

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
                      <Link to={`/orders/${order.id}`}>Order Details</Link> | 
                      <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadInvoice(order.id); }} style={{ opacity: downloadingInvoiceId === order.id ? 0.6 : 1, pointerEvents: downloadingInvoiceId === order.id ? 'none' : 'auto' }}>
                        {downloadingInvoiceId === order.id ? 'Downloading...' : 'Invoice'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-status-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 className={status.toLowerCase()}>{status}</h3>
                      <p>Your order was processed on {formatDate(order)}</p>
                    </div>
                  </div>

                  {/* Render real items if API returns them, else show placeholder */}
                  {(() => {
                    const orderItems = order.items || order.order_items || order.cart_items || order.products || [];
                    return orderItems.length > 0 ? (
                      orderItems.map((item, idx) => (
                      <div key={idx} className="order-item-detail">
                        <Link to={`/products/${item.product?.id || item.product_id || item.id}`}>
                          <img
                            src={getImageUrl(item.resolvedImage ?? item.product?.image ?? item.image ?? item.product_image)}
                            alt={item.resolvedName ?? item.product?.name ?? item.name ?? item.product_name ?? 'Product'}
                          />
                        </Link>
                        <div className="item-info">
                          <Link to={`/products/${item.product?.id || item.product_id || item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h4>{item.resolvedName ?? item.product?.name ?? item.name ?? item.product_name ?? 'Product'}</h4>
                          </Link>
                          <p className="item-desc">
                            Qty: {item.quantity} &nbsp;|&nbsp; ₹{Number(item.price ?? item.unit_price ?? 0).toFixed(2)}
                          </p>
                          <div className="order-item-actions" style={{ marginTop: '0.75rem' }}>
                            <button 
                              className="btn btn-primary btn-sm buy-again"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                              onClick={() => {
                                const productObj = {
                                  id: item.product?.id || item.product_id || item.id,
                                  name: item.resolvedName ?? item.product?.name ?? item.name ?? 'Product',
                                  price: item.price ?? item.unit_price ?? 0,
                                  image: item.resolvedImage ?? item.product?.image ?? item.image ?? 'https://via.placeholder.com/100'
                                };
                                addToCart(productObj, 1);
                                navigate('/cart');
                              }}
                            >
                              Buy it again
                            </button>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                            onClick={() => setActiveTrackingOrder(order)}
                          >
                            Track
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', color: '#eab308', borderColor: '#eab308' }}
                            onClick={() => setActiveReviewProduct({
                              product: {
                                id: item.product?.id || item.product_id || item.id,
                                name: item.resolvedName ?? item.product?.name ?? item.name ?? 'Product',
                                image: item.resolvedImage ?? item.product?.image ?? item.image ?? 'https://via.placeholder.com/100'
                              },
                              orderId: order.id
                            })}
                          >
                            Rate & Review
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', color: '#10b981', borderColor: '#10b981' }}
                            onClick={() => setActiveFeedbackOrder(order)}
                          >
                            Return & Refund
                          </button>
                          </div>
                        </div>
                      ))
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-orders" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Package size={60} style={{ margin: '0 auto', color: '#888', marginBottom: '1rem' }} />
            <h2>{search ? 'No matching orders' : 'No orders found'}</h2>
            <p style={{ marginBottom: '2rem' }}>
              {search ? 'Try a different search term.' : "You haven't placed any orders yet."}
            </p>
            {!search && (
              <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block' }}>
                Continue Shopping
              </Link>
            )}
          </div>
        )}
      </div>

      {activeTrackingOrder && (
        <TrackingModal 
          order={activeTrackingOrder} 
          onClose={() => setActiveTrackingOrder(null)} 
          onCancel={() => {
            handleCancelOrder(activeTrackingOrder.id);
            setActiveTrackingOrder(null); // Optional: close modal on cancel, or just let it update to cancelled state
          }} 
        />
      )}
      {activeShippingOrder && (
        <ShippingModal order={activeShippingOrder} onClose={() => setActiveShippingOrder(null)} />
      )}
      {activeFeedbackOrder && (
        <FeedbackModal order={activeFeedbackOrder} onClose={() => setActiveFeedbackOrder(null)} />
      )}
      {activeReviewProduct && (
        <ReviewModal product={activeReviewProduct.product} orderId={activeReviewProduct.orderId} onClose={() => setActiveReviewProduct(null)} />
      )}
    </div>
  );
};

export default Orders;