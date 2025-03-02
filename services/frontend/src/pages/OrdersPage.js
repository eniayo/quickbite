import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { orderService } from '../services/api';
import AuthContext from '../context/AuthContext';

const PageContainer = styled.div`
  padding: 1rem 0;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const OrderId = styled.div`
  font-weight: 500;
  color: #666;
`;

const OrderDate = styled.div`
  color: #888;
  font-size: 0.9rem;
`;

const OrderContent = styled.div`
  padding: 1.5rem;
`;

const OrderRestaurant = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
`;

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #333;
`;

const OrderItemQuantity = styled.span`
  color: #666;
  margin-right: 0.5rem;
`;

const OrderSummary = styled.div`
  border-top: 1px solid #eee;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
`;

const OrderTotal = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
`;

const OrderStatus = styled.div`
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
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

const ViewButton = styled(Link)`
  display: inline-block;
  background-color: #ff5a5f;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  
  &:hover {
    background-color: #ff4448;
  }
`;

const NoOrdersMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  border: 1px dashed #ddd;
  border-radius: 8px;
  color: #666;
`;

const StartOrderButton = styled(Link)`
  display: inline-block;
  background-color: #ff5a5f;
  color: white;
  padding: 0.7rem 1.2rem;
  margin-top: 1.5rem;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  
  &:hover {
    background-color: #ff4448;
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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/orders' } });
      return;
    }
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Mock data for orders
        const mockOrders = [
          {
            id: 12345,
            restaurantId: 2,
            restaurantName: 'Pizza Heaven',
            date: '2023-06-15T18:32:00Z',
            status: 'delivered',
            items: [
              { id: 201, name: 'Margherita Pizza', price: 12.99, quantity: 1 },
              { id: 301, name: 'Spaghetti Bolognese', price: 13.99, quantity: 1 },
              { id: 501, name: 'Soft Drink', price: 2.99, quantity: 2 }
            ],
            subtotal: 32.96,
            deliveryFee: 2.99,
            tax: 2.64,
            total: 38.59
          },
          {
            id: 12346,
            restaurantId: 1,
            restaurantName: 'Burger Palace',
            date: '2023-06-10T19:45:00Z',
            status: 'delivered',
            items: [
              { id: 101, name: 'Classic Burger', price: 9.99, quantity: 2 },
              { id: 102, name: 'Cheese Fries', price: 5.99, quantity: 1 },
              { id: 103, name: 'Chocolate Milkshake', price: 4.99, quantity: 2 }
            ],
            subtotal: 35.95,
            deliveryFee: 3.49,
            tax: 2.88,
            total: 42.32
          },
          {
            id: 12347,
            restaurantId: 3,
            restaurantName: 'Sushi Express',
            date: '2023-06-05T20:15:00Z',
            status: 'delivered',
            items: [
              { id: 201, name: 'California Roll', price: 8.99, quantity: 2 },
              { id: 202, name: 'Salmon Nigiri', price: 10.99, quantity: 1 },
              { id: 203, name: 'Miso Soup', price: 3.99, quantity: 1 }
            ],
            subtotal: 32.96,
            deliveryFee: 3.99,
            tax: 2.96,
            total: 39.91
          },
          {
            id: 12348,
            restaurantId: 2,
            restaurantName: 'Pizza Heaven',
            date: new Date().toISOString(),
            status: 'preparing',
            items: [
              { id: 202, name: 'Pepperoni Pizza', price: 14.99, quantity: 1 },
              { id: 102, name: 'Bruschetta', price: 6.99, quantity: 1 },
              { id: 502, name: 'Bottled Water', price: 1.99, quantity: 1 }
            ],
            subtotal: 23.97,
            deliveryFee: 2.99,
            tax: 1.92,
            total: 28.88
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
        
        // When API is ready:
        // const data = await orderService.getAll();
        // setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, navigate]);
  
  // Format date to readable string
  const formatDate = (dateString) => {
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
      default:
        return 'Processing';
    }
  };
  
  if (loading) {
    return <LoadingMessage>Loading your orders...</LoadingMessage>;
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Your Orders</PageTitle>
      </PageHeader>
      
      {orders.length === 0 ? (
        <NoOrdersMessage>
          <p>You haven't placed any orders yet.</p>
          <StartOrderButton to="/restaurants">Browse Restaurants</StartOrderButton>
        </NoOrdersMessage>
      ) : (
        <OrdersContainer>
          {orders.map(order => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderId>Order #{order.id}</OrderId>
                <OrderDate>{formatDate(order.date)}</OrderDate>
              </OrderHeader>
              
              <OrderContent>
                <OrderRestaurant>{order.restaurantName}</OrderRestaurant>
                
                <OrderItems>
                  {order.items.map(item => (
                    <OrderItem key={item.id}>
                      <div>
                        <OrderItemQuantity>{item.quantity}x</OrderItemQuantity>
                        {item.name}
                      </div>
                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                    </OrderItem>
                  ))}
                </OrderItems>
                
                <OrderSummary>
                  <div>Total</div>
                  <OrderTotal>${order.total.toFixed(2)}</OrderTotal>
                </OrderSummary>
              </OrderContent>
              
              <OrderFooter>
                <OrderStatus status={order.status}>
                  {formatStatus(order.status)}
                </OrderStatus>
                
                <ViewButton to={`/orders/${order.id}`}>
                  View Details
                </ViewButton>
              </OrderFooter>
            </OrderCard>
          ))}
        </OrdersContainer>
      )}
    </PageContainer>
  );
};

export default OrdersPage;


