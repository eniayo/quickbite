import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { restaurantService } from '../services/api';

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

const PageDescription = styled.p`
  color: #666;
  font-size: 1.1rem;
  max-width: 800px;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 300px;
  
  &:focus {
    outline: none;
    border-color: #ff5a5f;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #ff5a5f;
  }
`;

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const RestaurantCard = styled.div`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RestaurantImage = styled.div`
  height: 200px;
  background-color: #f5f5f5;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const RestaurantInfo = styled.div`
  padding: 1.5rem;
`;

const RestaurantName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const RestaurantCuisine = styled.p`
  color: #666;
  margin-bottom: 0.5rem;
`;

const RestaurantDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RestaurantRating = styled.div`
  font-weight: 500;
`;

const RestaurantDeliveryTime = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ViewButton = styled(Link)`
  display: block;
  text-align: center;
  background-color: #ff5a5f;
  color: white;
  padding: 0.7rem 1rem;
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

const NoResultsMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin: 2rem 0;
  color: #666;
`;

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  // Cuisine options for filter
  const cuisineOptions = [
    'All',
    'American',
    'Italian',
    'Japanese',
    'Chinese',
    'Mexican',
    'Indian',
    'Thai',
    'Mediterranean',
    'Fast Food'
  ];
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch from the API
        // For now, using mock data
        const mockRestaurants = [
          {
            id: 1,
            name: 'Burger Palace',
            cuisine: 'American, Fast Food',
            rating: 4.5,
            deliveryTime: '20-30 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Burger+Palace'
          },
          {
            id: 2,
            name: 'Pizza Heaven',
            cuisine: 'Italian, Pizza',
            rating: 4.7,
            deliveryTime: '25-35 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Pizza+Heaven'
          },
          {
            id: 3,
            name: 'Sushi Express',
            cuisine: 'Japanese, Sushi',
            rating: 4.3,
            deliveryTime: '30-40 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Sushi+Express'
          },
          {
            id: 4,
            name: 'Taco Time',
            cuisine: 'Mexican, Tacos',
            rating: 4.2,
            deliveryTime: '15-25 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Taco+Time'
          },
          {
            id: 5,
            name: 'Spice Garden',
            cuisine: 'Indian, Curry',
            rating: 4.6,
            deliveryTime: '35-45 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Spice+Garden'
          },
          {
            id: 6,
            name: 'Noodle House',
            cuisine: 'Chinese, Noodles',
            rating: 4.1,
            deliveryTime: '20-30 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Noodle+House'
          },
          {
            id: 7,
            name: 'Mediterranean Delight',
            cuisine: 'Mediterranean, Hummus',
            rating: 4.4,
            deliveryTime: '25-35 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Mediterranean+Delight'
          },
          {
            id: 8,
            name: 'Thai Spice',
            cuisine: 'Thai, Curry',
            rating: 4.5,
            deliveryTime: '30-40 min',
            imageUrl: 'https://via.placeholder.com/300x200?text=Thai+Spice'
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setRestaurants(mockRestaurants);
          setLoading(false);
        }, 1000);
        
        // When API is ready:
        // const data = await restaurantService.getAll();
        // setRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);
  
  // Filter and sort restaurants
  const filteredAndSortedRestaurants = restaurants
    .filter(restaurant => 
      // Search filter
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(restaurant => 
      // Cuisine filter
      !cuisineFilter || cuisineFilter === 'All' ? true : 
restaurant.cuisine.includes(cuisineFilter)
    )
    .sort((a, b) => {
      // Sort options
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'deliveryTime') {
        // Extract the minimum delivery time for sorting
        const getMinTime = (timeString) => {
          const match = timeString.match(/(\d+)-/);
          return match ? parseInt(match[1]) : 999;
        };
        return getMinTime(a.deliveryTime) - getMinTime(b.deliveryTime);
      }
      return 0;
    });
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Restaurants</PageTitle>
        <PageDescription>
          Discover the best food from local restaurants delivered right to your door.
        </PageDescription>
      </PageHeader>
      
      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Search restaurants or cuisines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
        >
          <option value="">All Cuisines</option>
          {cuisineOptions.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="rating">Sort by: Rating</option>
          <option value="name">Sort by: Name</option>
          <option value="deliveryTime">Sort by: Delivery Time</option>
        </FilterSelect>
      </FiltersContainer>
      
      {loading ? (
        <LoadingMessage>Loading restaurants...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : filteredAndSortedRestaurants.length === 0 ? (
        <NoResultsMessage>No restaurants found matching your criteria</NoResultsMessage>
      ) : (
        <RestaurantGrid>
          {filteredAndSortedRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id}>
              <RestaurantImage image={restaurant.imageUrl} />
              <RestaurantInfo>
                <RestaurantName>{restaurant.name}</RestaurantName>
                <RestaurantCuisine>{restaurant.cuisine}</RestaurantCuisine>
                <RestaurantDetails>
                  <RestaurantRating>{restaurant.rating} ★</RestaurantRating>
                  <RestaurantDeliveryTime>{restaurant.deliveryTime}</RestaurantDeliveryTime>
                </RestaurantDetails>
                <ViewButton to={`/restaurants/${restaurant.id}`}>
                  View Menu
                </ViewButton>
              </RestaurantInfo>
            </RestaurantCard>
          ))}
        </RestaurantGrid>
      )}
    </PageContainer>
  );
};

export default RestaurantsPage;


