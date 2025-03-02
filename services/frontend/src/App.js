import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetail from './pages/RestaurantDetail';
import OrdersPage from './pages/OrdersPage';
import OrderDetail from './pages/OrderDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

const AppContainer = styled.div`
  font-family: 'Open Sans', sans-serif;
`;

const Header = styled.header`
  background-color: #ff5a5f;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Footer = styled.footer`
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
`;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Header>
            <Nav>
              <Logo>QuickBite</Logo>
              <NavLinks>
                <StyledLink to="/">Home</StyledLink>
                <StyledLink to="/restaurants">Restaurants</StyledLink>
                <StyledLink to="/orders">My Orders</StyledLink>
                <StyledLink to="/login">Login</StyledLink>
                <StyledLink to="/register">Register</StyledLink>
                <StyledLink to="/profile">Profile</StyledLink>
              </NavLinks>
            </Nav>
          </Header>
          
          <Content>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Content>
          
          <Footer>
            &copy; {new Date().getFullYear()} QuickBite. All rights reserved.
          </Footer>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;


