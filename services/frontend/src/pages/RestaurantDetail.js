import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { restaurantService, orderService } from '../services/api';
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

const RestaurantBanner = styled.div`
  position: relative;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const BannerImage = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const BannerOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 2rem 1.5rem 1.5rem;
  color: white;
`;

const RestaurantName = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const RestaurantInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  
  &::before {
    content: '•';
    margin-right: 0.5rem;
  }
  
  &:first-child::before {
    content: none;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const MenuContainer = styled.div`
  flex: 1;
`;

const CartContainer = styled.div`
  width: 350px;
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 2.5rem;
`;

const CategoryTitle = styled.h2`
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const MenuItemList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const MenuItem = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MenuItemName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const MenuItemDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const MenuItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuItemPrice = styled.div`
  font-weight: 500;
`;

const AddButton = styled.button`
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: #ff4448;
  }
`;

const Cart = styled.div`
  position: sticky;
  top: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: white;
`;

const CartTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const CartEmptyMessage = styled.p`
  text-align: center;
  color: #666;
  margin: 2rem 0;
`;

const CartItems = styled.div`
  margin-bottom: 1.5rem;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CartItemDetails = styled.div`
  flex: 1;
`;

const CartItemName = styled.div`
  font-weight: 500;
  margin-bottom: 0.3rem;
`;

const CartItemPrice = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const CartItemQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const CartSummary = styled.div`
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    font-weight: bold;
    margin-top: 0.5rem;
    font-size: 1.1rem;
  }
`;

const CheckoutButton = styled.button`
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  
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

const LoginPrompt = styled.div`
  text-align: center;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const LoginButton = styled.button`
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background-color: #ff4448;
  }
`;

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        
        // Mock data for restaurant
        const mockRestaurant = {
          id: parseInt(id),
          name: 'Pizza Heaven',
          cuisine: 'Italian, Pizza',
          rating: 4.7,
          deliveryTime: '25-35 min',
          deliveryFee: 2.99,
          minOrder: 15.00,
          imageUrl: 'https://via.placeholder.com/800x400?text=Pizza+Heaven'
        };
        
        // Mock data for menu items
        const mockMenuItems = [
          {
            id: 1,
            category: 'Starters',
            items: [
              {
                id: 101,
                name: 'Garlic Bread',
                description: 'Freshly baked bread with garlic butter and herbs',
                price: 5.99
              },
              {
                id: 102,
                name: 'Bruschetta',
                description: 'Toasted bread topped with tomatoes, basil, and olive oil',
                price: 6.99
              },
              {
                id: 103,
                name: 'Mozzarella Sticks',
                description: 'Breaded mozzarella sticks served with marinara sauce',
                price: 7.99
              }
            ]
          },
          {
            id: 2,
            category: 'Pizzas',
            items: [
              {
                id: 201,
                name: 'Margherita Pizza',
                description: 'Classic pizza with tomato sauce, mozzarella, and basil',
                price: 12.99
              },
              {
                id: 202,
                name: 'Pepperoni Pizza',
                description: 'Pizza topped with pepperoni, mozzarella, and tomato sauce',
                price: 14.99
              },
              {
                id: 203,
                name: 'Hawaiian Pizza',
                description: 'Pizza with ham, pineapple, mozzarella, and tomato sauce',
                price: 15.99
              },
              {
                id: 204,
                name: 'Vegetarian Pizza',
                description: 'Pizza with bell peppers, mushrooms, onions, olives, and 
tomatoes',
                price: 16.99
              }
            ]
          },
          {
            id: 3,
            category: 'Pasta',
            items: [
              {
                id: 301,
                name: 'Spaghetti Bolognese',
                description: 'Spaghetti with meat sauce and Parmesan cheese',
                price: 13.99
              },
              {
                id: 302,
                name: 'Fettuccine Alfredo',
                description: 'Fettuccine pasta with creamy Alfredo sauce',
                price: 14.99
              },
              {
                id: 303,
                name: 'Lasagna',
                description: 'Layers of pasta, meat sauce, and cheese baked to perfection',
                price: 16.99
              }
            ]
          },
          {
            id: 4,
            category: 'Desserts',
            items: [
              {
                id: 401,
                name: 'Tiramisu',
                description: 'Classic Italian dessert with coffee-soaked ladyfingers and 
mascarpone',
                price: 7.99
              },
              {
                id: 402,
                name: 'Cannoli',
                description: 'Crispy pastry shells filled with sweet ricotta cream',
                price: 6.99
              }
            ]
          },
          {
            id: 5,
            category: 'Drinks',
            items: [
              {
                id: 501,
                name: 'Soft Drink',
                description: 'Cola, Sprite, or Fanta (500ml)',
                price: 2.99
              },
              {
                id: 502,
                name: 'Bottled Water',
                description: 'Still or sparkling water (500ml)',
                price: 1.99
              },
              {
                id: 503,
                name: 'Italian Soda',
                description: 'San Pellegrino sparkling fruit beverage',
                price: 3.99
              }
            ]
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setRestaurant(mockRestaurant);
          setMenuItems(mockMenuItems);
          setLoading(false);
        }, 1000);
        
        // When API is ready:
        // const restaurantData = await restaurantService.getById(id);
        // const menuData = await restaurantService.getMenu(id);
        // setRestaurant(restaurantData);
        // setMenuItems(menuData);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError('Failed to load restaurant details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchRestaurantAndMenu();
  }, [id]);
  
  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Item already in cart, increase quantity
        return prevItems.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };
  
  // Update item quantity in cart
  const updateQuantity = (itemId, change) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean); // Remove null items (quantity reduced to 0)
    });
  };
  
  // Calculate cart totals
  const calculateCartTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = restaurant?.deliveryFee || 0;
    const tax = subtotal * 0.08; // Assuming 8% tax
    const total = subtotal + deliveryFee + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };
  
  // Proceed to checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/restaurants/${id}` } });
      return;
    }
    
    // Create order object
    const order = {
      restaurantId: restaurant.id,
      items: cartItems.map(item => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: parseFloat(calculateCartTotals().subtotal),
      deliveryFee: parseFloat(calculateCartTotals().deliveryFee),
      tax: parseFloat(calculateCartTotals().tax),
      total: parseFloat(calculateCartTotals().total)
    };
    
    // In a real app, we'd send this to the API
    console.log('Placing order:', order);
    // orderService.create(order).then(response => {
    //   navigate(`/orders/${response.id}`);
    // });
    
    // For demo purposes, just navigate to the orders page
    navigate('/orders');
  };
  
  // Check if cart meets minimum order amount
  const meetsMinimumOrder = () => {
    const subtotal = parseFloat(calculateCartTotals().subtotal);
    return subtotal >= (restaurant?.minOrder || 0);
  };
  
  if (loading) {
    return <LoadingMessage>Loading restaurant details...</LoadingMessage>;
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  const { subtotal, deliveryFee, tax, total } = calculateCartTotals();
  
  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/restaurants')}>
        Back to Restaurants
      </BackButton>
      
      <RestaurantBanner>
        <BannerImage image={restaurant.imageUrl} />
        <BannerOverlay>
          <RestaurantName>{restaurant.name}</RestaurantName>
          <RestaurantInfo>
            <InfoItem>{restaurant.cuisine}</InfoItem>
            <InfoItem>{restaurant.rating} ★</InfoItem>
            <InfoItem>Delivery: {restaurant.deliveryTime}</InfoItem>
            <InfoItem>Min. order: ${restaurant.minOrder.toFixed(2)}</InfoItem>
          </RestaurantInfo>
        </BannerOverlay>
      </RestaurantBanner>
      
      <ContentContainer>
        <MenuContainer>
          {menuItems.map(category => (
            <CategorySection key={category.id}>
              <CategoryTitle>{category.category}</CategoryTitle>
              <MenuItemList>
                {category.items.map(item => (
                  <MenuItem key={item.id}>
                    <MenuItemName>{item.name}</MenuItemName>
                    <MenuItemDescription>{item.description}</MenuItemDescription>
                    <MenuItemFooter>
                      <MenuItemPrice>${item.price.toFixed(2)}</MenuItemPrice>
                      <AddButton onClick={() => addToCart(item)}>Add to Cart</AddButton>
                    </MenuItemFooter>
                  </MenuItem>
                ))}
              </MenuItemList>
            </CategorySection>
          ))}
        </MenuContainer>
        
        <CartContainer>
          <Cart>
            <CartTitle>Your Order</CartTitle>
            
            {cartItems.length === 0 ? (
              <CartEmptyMessage>Your cart is empty</CartEmptyMessage>
            ) : (
              <>
                <CartItems>
                  {cartItems.map(item => (
                    <CartItem key={item.id}>
                      <CartItemDetails>
                        <CartItemName>{item.name}</CartItemName>
                        <CartItemPrice>${(item.price * 
item.quantity).toFixed(2)}</CartItemPrice>
                      </CartItemDetails>
                      <CartItemQuantity>
                        <QuantityButton onClick={() => updateQuantity(item.id, 
-1)}>-</QuantityButton>
                        {item.quantity}
                        <QuantityButton onClick={() => updateQuantity(item.id, 
1)}>+</QuantityButton>
                      </CartItemQuantity>
                    </CartItem>
                  ))}
                </CartItems>
                
                <CartSummary>
                  <SummaryRow>
                    <div>Subtotal</div>
                    <div>${subtotal}</div>
                  </SummaryRow>
                  <SummaryRow>
                    <div>Delivery Fee</div>
                    <div>${deliveryFee}</div>
                  </SummaryRow>
                  <SummaryRow>
                    <div>Tax</div>
                    <div>${tax}</div>
                  </SummaryRow>
                  <SummaryRow>
                    <div>Total</div>
                    <div>${total}</div>
                  </SummaryRow>
                </CartSummary>
                
                {!meetsMinimumOrder() && (
                  <ErrorMessage>
                    Minimum order of ${restaurant.minOrder.toFixed(2)} required
                  </ErrorMessage>
                )}
                
                <CheckoutButton 
                  onClick={handleCheckout} 
                  disabled={!meetsMinimumOrder() || cartItems.length === 0}
                >
                  Checkout
                </CheckoutButton>
                
                {!isAuthenticated && (
                  <LoginPrompt>
                    <p>Please log in to place an order</p>
                    <LoginButton onClick={() => navigate('/login', { state: { redirectTo: 
`/restaurants/${id}` } })}>
                      Login
                    </LoginButton>
                  </LoginPrompt>
                )}
              </>
            )}
          </Cart>
        </CartContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default RestaurantDetail;


