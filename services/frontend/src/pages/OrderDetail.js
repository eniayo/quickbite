import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { orderService } from '../services/api';
import AuthContext from '../context/AuthContext';

const PageContainer = styled.div`
  padding: 1rem 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #ff5a5f;
  font-size: 1rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
  
  &::before {
    content: '←';
    margin-right: 0.5rem;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const OrderDetailsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const OrderHeader = styled.div`
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const OrderTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const OrderId = styled.div`
  font-size: 1rem;
  color: #666;
`;

const OrderContent = styled.div`
  padding: 1.5rem;
`;

const OrderSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
`;

const RestaurantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RestaurantImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: #f5f5f5;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const RestaurantName = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
`;

const OrderItems = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
`;

const OrderItemsHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 80px;
  padding: 0.8rem 1rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
`;

const OrderItemsList = styled.div``;

const OrderItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 80px;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.div`
  font-weight: 500;
`;

const ItemQuantity = styled.div`
  color: #666;
  text-align: center;
`;

const ItemPrice = styled.div`
  text-align: right;
`;

const OrderSummary = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  
  &:last-child {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const OrderStatusContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StatusHeader = styled.div`
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const StatusTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
`;

const StatusContent = styled.div`
  padding: 1.5rem;
`;

const StatusLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 500;
  margin-bottom: 1.5rem;
  
  background-color: ${props => {
    switch (props.status) {
      case 'delivered':
        return '#e6f7e6';
      case 'in_transit':
        return '#e6f0ff';
      case 'preparing':
        return '#fff4e6';
      case 'cancelled':
        return '#ffe6e6';
      default:
        return '#f0f0f0';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'delivered':
        return '#2e7d32';
      case 'in_transit':
        return '#1565c0';
      case 'preparing':
        return '#ef6c00';
      case 'cancelled':
        return '#c62828';
      default:
        return '#616161';
    }
  }};
`;

const TrackingInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const TrackingTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
`;

const TrackingTimeline = styled.div`
  margin-left: 0.5rem;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-left: 2rem;
  padding-bottom: 1.5rem;
  
  &:last-child {
    padding-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.3rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: ${props => props.active ? '#ff5a5f' : '#ddd'};
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 0.45rem;
    top: 1.3rem;
    width: 0.1rem;
    height: calc(100% - 1.3rem);
    background-color: #ddd;
    display: ${props => props.last ? 'none' : 'block'};
  }
`;

const TimelineTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.2rem;
  color: ${props => props.active ? '#333' : '#888'};
`;

const TimelineTime = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const DeliveryInfo = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const DeliveryTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: #333;
`;

const DeliveryDetail = styled.div`
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DeliveryLabel = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
`;

const ActionButton = styled.button`
  width: 100%;
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #ff4448;
  }
  
  &:disabled {
    background-color: #ffb3b5;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin: 2rem 0;
  color: #666;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin: 2rem 0;
  color: #ff5a5f;
`;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/orders/${id}` } });
      return;
    }
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Mock order data
        const mockOrder = {
          id: parseInt(id),
          restaurantId: 2,
          restaurantName: 'Pizza Heaven',
          restaurantImage: 'https://via.placeholder.com/60x60?text=PH',
          date: new Date().toISOString(),
          status: 'in_transit',
          items: [
            { id: 202, name: 'Pepperoni Pizza', price: 14.99, quantity: 1 },
            { id: 102, name: 'Bruschetta', price: 6.99, quantity: 1 },
            { id: 502, name: 'Bottled Water', price: 1.99, quantity: 2 }
          ],
          subtotal: 25.96,
          deliveryFee: 2.99,
          tax: 2.08,
          total: 31.03,
          deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
          deliveryInstructions: 'Please leave at door',
          estimatedDeliveryTime: '30-40 minutes',
          driverName: 'John Smith',
          driverPhone: '555-123-4567',
          tracking: [
            { status: 'order_placed', time: new Date(Date.now() - 25 * 60000).toISOString(), 
completed: true },
            { status: 'preparing', time: new Date(Date.now() - 15 * 60000).toISOString(), 
completed: true },
            { status: 'in_transit', time: new Date(Date.now() - 5 * 60000).toISOString(), 
completed: true },
            { status: 'delivered', time: null, completed: false }
          ]
        };
        
        // Simulate API delay
        setTimeout(() => {
          setOrder(mockOrder);
          setLoading(false);
        }, 1000);
        
        // When API is ready:
        // const data = await orderService.getById(id);
        // setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);
  
  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_transit':
        return 'On the way';
      case 'preparing':
        return 'Preparing';
      case 'cancelled':
        return 'Cancelled';
      case 'order_placed':
        return 'Order placed';
      default:
        return 'Processing';
    }
  };
  
  // Handle help request
  const handleContactSupport = () => {
    alert('Support request sent! Our team will contact you shortly.');
  };
  
  // Handle order reorder
  const handleReorder = () => {
    // In a real app, we'd create a new order with the same items
    alert('Reordering functionality would go here');
    navigate(`/restaurants/${order.restaurantId}`);
  };
  
  if (loading) {
    return <LoadingMessage>Loading order details...</LoadingMessage>;
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  if (!order) {
    return <ErrorMessage>Order not found</ErrorMessage>;
  }
  
  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/orders')}>
        Back to Orders
      </BackButton>
      
      <ContentContainer>
        <OrderDetailsContainer>
          <OrderHeader>
            <OrderTitle>Order Details</OrderTitle>
            <OrderId>Order #{order.id} • {formatDate(order.date)}</OrderId>
          </OrderHeader>
          
          <OrderContent>
            <OrderSection>
              <SectionTitle>Restaurant</SectionTitle>
              <RestaurantInfo>
                <RestaurantImage image={order.restaurantImage} />
                <RestaurantName>{order.restaurantName}</RestaurantName>
              </RestaurantInfo>
            </OrderSection>
            
            <OrderSection>
              <SectionTitle>Items</SectionTitle>
              <OrderItems>
                <OrderItemsHeader>
                  <div>Item</div>
                  <div>Quantity</div>
                  <div>Price</div>
                </OrderItemsHeader>
                <OrderItemsList>
                  {order.items.map(item => (
                    <OrderItem key={item.id}>
                      <ItemName>{item.name}</ItemName>
                      <ItemQuantity>{item.quantity}</ItemQuantity>
                      <ItemPrice>${(item.price * item.quantity).toFixed(2)}</ItemPrice>
                    </OrderItem>
                  ))}
                </OrderItemsList>
              </OrderItems>
            </OrderSection>
            
            <OrderSection>
              <SectionTitle>Order Summary</SectionTitle>
              <OrderSummary>
                <SummaryRow>
                  <div>Subtotal</div>
                  <div>${order.subtotal.toFixed(2)}</div>
                </SummaryRow>
                <SummaryRow>
                  <div>Delivery Fee</div>
                  <div>${order.deliveryFee.toFixed(2)}</div>
                </SummaryRow>
                <SummaryRow>
                  <div>Tax</div>
                  <div>${order.tax.toFixed(2)}</div>
                </SummaryRow>
                <SummaryRow>
                  <div>Total</div>
                  <div>${order.total.toFixed(2)}</div>
                </SummaryRow>
              </OrderSummary>
            </OrderSection>
          </OrderContent>
        </OrderDetailsContainer>
        
        <OrderStatusContainer>
          <StatusHeader>
            <StatusTitle>Order Status</StatusTitle>
          </StatusHeader>
          
          <StatusContent>
            <StatusLabel>Current Status</StatusLabel>
            <StatusBadge status={order.status}>
              {formatStatus(order.status)}
            </StatusBadge>
            
            <TrackingInfo>
              <TrackingTitle>Tracking</TrackingTitle>
              <TrackingTimeline>
                {order.tracking.map((step, index) => (
                  <TimelineItem 
                    key={step.status}
                    active={step.completed}
                    last={index === order.tracking.length - 1}
                  >
                    <TimelineTitle active={step.completed}>
                      {formatStatus(step.status)}
                    </TimelineTitle>
                    <TimelineTime>
                      {step.completed ? formatDate(step.time) : ''}
                    </TimelineTime>
                  </TimelineItem>
                ))}
              </TrackingTimeline>
            </TrackingInfo>
            
            <DeliveryInfo>
              <DeliveryTitle>Delivery Information</DeliveryTitle>
              <DeliveryDetail>
                <DeliveryLabel>Address:</DeliveryLabel>
                {order.deliveryAddress}
              </DeliveryDetail>
              {order.deliveryInstructions && (
                <DeliveryDetail>
                  <DeliveryLabel>Instructions:</DeliveryLabel>
                  {order.deliveryInstructions}
                </DeliveryDetail>
              )}
              <DeliveryDetail>
                <DeliveryLabel>Estimated Delivery:</DeliveryLabel>
                {order.estimatedDeliveryTime}
              </DeliveryDetail>
              {order.status === 'in_transit' && (
                <>
                  <DeliveryDetail>
                    <DeliveryLabel>Driver:</DeliveryLabel>
                    {order.driverName}
                  </DeliveryDetail>
                  <DeliveryDetail>
                    <DeliveryLabel>Contact:</DeliveryLabel>
                    {order.driverPhone}
                  </DeliveryDetail>
                </>
              )}
            </DeliveryInfo>
            
            <ActionButton onClick={handleReorder}>
              Reorder
            </ActionButton>
            
            <ActionButton onClick={handleContactSupport}>
              Need Help?
            </ActionButton>
          </StatusContent>
        </OrderStatusContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default OrderDetail;




