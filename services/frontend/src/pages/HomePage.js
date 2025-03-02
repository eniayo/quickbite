import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { restaurantService } from '../services/api';

const Hero = styled.div`
  background-color: #ff5a5f;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const SearchBar = styled.div`
  display: flex;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
`;

const SearchButton = styled.button`
  background-color: #ff8a00;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0 4px 4px 0;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: #e67a00;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
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

const RestaurantRating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const StyledLink = styled(Link)`
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

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        // In a real app, we'd load from the API
        // For now, using mock data
        const mockRestaurants = [
          {
            id: 1,
            name: 'Burger Palace',
            cuisine: 'American, Burgers',
            rating: 4.5,
            imageUrl: 'https://via.placeholder.com/300x200?text=Burger+Palace'
          },
          {
            id: 2,
            name: 'Pizza Heaven',
            cuisine: 'Italian, Pizza',
            rating: 4.7,
            imageUrl: 'https://via.placeholder.com/300x200?text=Pizza+Heaven'
          },
          {
            id: 3,
            name: 'Sushi Express',
            cuisine: 'Japanese, Sushi',
            rating: 4.3,
            imageUrl: 'https://via.placeholder.com/300x200?text=Sushi+Express'
          },
          {
            id: 4,
            name: 'Taco Time',
            cuisine: 'Mexican, Tacos',
            rating: 4.2,
            imageUrl: 'https://via.placeholder.com/300x200?text=Taco+Time'
          },
          {
            id: 5,
            name: 'Spice Garden',
            cuisine: 'Indian, Curry',
            rating: 4.6,
            imageUrl: 'https://via.placeholder.com/300x200?text=Spice+Garden'
          },
          {
            id: 6,
            name: 'Noodle House',
            cuisine: 'Chinese, Noodles',
            rating: 4.1,
            imageUrl: 'https://via.placeholder.com/300x200?text=Noodle+House'
          }
        ];
        
        // Simulating API delay
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

  const handleSearch = () => {
    // In a real app, we would make an API call with the search term
    console.log('Searching for:', searchTerm);
  };

  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Hero>
        <HeroTitle>QuickBite Food Delivery</HeroTitle>
        <HeroSubtitle>Delicious food delivered to your doorstep</HeroSubtitle>
        <SearchBar>
          <SearchInput 
            type="text" 
            placeholder="Search for restaurants or cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>Search</SearchButton>
        </SearchBar>
      </Hero>

      <SectionTitle>Popular Restaurants</SectionTitle>
      
      {loading ? (
        <LoadingMessage>Loading restaurants...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <RestaurantGrid>
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id}>
              <RestaurantImage image={restaurant.imageUrl} />
              <RestaurantInfo>
                <RestaurantName>{restaurant.name}</RestaurantName>
                <RestaurantCuisine>{restaurant.cuisine}</RestaurantCuisine>
                <RestaurantRating>
                  Rating: {restaurant.rating} ★
                </RestaurantRating>
                <StyledLink to={`/restaurants/${restaurant.id}`}>
                  View Menu
                </StyledLink>
              </RestaurantInfo>
            </RestaurantCard>
          ))}
        </RestaurantGrid>
      )}
    </div>
  );
};

export default HomePage;


