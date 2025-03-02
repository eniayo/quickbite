import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { userService } from '../services/api';
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

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const UserAvatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 2rem auto;
  background-color: #f5f5f5;
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #ccc;
`;

const UserInfo = styled.div`
  padding: 0 1.5rem 1.5rem;
  text-align: center;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const UserEmail = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`;

const LogoutButton = styled.button`
  width: 100%;
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #ff4448;
  }
`;

const ProfileContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background-color: ${props => props.active ? '#f9f9f9' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#ff5a5f' : 'transparent'};
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.active ? '#ff5a5f' : '#666'};
  cursor: pointer;
  
  &:hover {
    color: #ff5a5f;
  }
`;

const TabContent = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 600px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #ff5a5f;
  }
`;

const SaveButton = styled.button`
  background-color: #ff5a5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  
  &:hover {
    background-color: #ff4448;
  }
  
  &:disabled {
    background-color: #ffb3b5;
    cursor: not-allowed;
  }
`;

const AddressCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const AddressDetails = styled.div`
  flex: 1;
`;

const AddressType = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const AddressText = styled.p`
  color: #666;
  line-height: 1.4;
`;

const AddressActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1.2rem;
  padding: 0.3rem;
  
  &:hover {
    color: #ff5a5f;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  text-align: center;
  justify-content: center;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
    color: #ff5a5f;
  }
`;

const PaymentCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PaymentDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CardIcon = styled.div`
  font-size: 1.5rem;
  color: #666;
`;

const CardInfo = styled.div``;

const CardType = styled.div`
  font-weight: 500;
  margin-bottom: 0.2rem;
`;

const CardNumber = styled.div`
  color: #666;
`;

const CardExpiry = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const DefaultBadge = styled.span`
  background-color: #e6f7e6;
  color: #2e7d32;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 0.5rem;
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

const SuccessMessage = styled.p`
  background-color: #e6f7e6;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/profile' } });
      return;
    }
    
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Mock user data
        const mockUserData = {
          id: 123,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '555-123-4567',
          avatarUrl: null
        };
        
        // Mock addresses
        const mockAddresses = [
          {
            id: 1,
            type: 'Home',
            street: '123 Main Street',
            apt: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            isDefault: true
          },
          {
            id: 2,
            type: 'Work',
            street: '456 Business Avenue',
            apt: 'Floor 8',
            city: 'New York',
            state: 'NY',
            zipCode: '10022',
            isDefault: false
          }
        ];
        
        // Mock payment methods
        const mockPaymentMethods = [
          {
            id: 1,
            type: 'Visa',
            lastFour: '4242',
            expiryMonth: 12,
            expiryYear: 2024,
            isDefault: true
          },
          {
            id: 2,
            type: 'Mastercard',
            lastFour: '


