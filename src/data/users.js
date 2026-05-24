const users = [
  {
    id: 'user_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    phone: '+91 9876543210',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    address: '12, MG Road, Bangalore, Karnataka',
    savedAddresses: [
      { id: 'addr_1', label: 'Home', address: '12, MG Road, Bangalore', lat: 12.9716, lng: 77.5946 },
      { id: 'addr_2', label: 'Office', address: '45, Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 }
    ],
    wallet: 2500,
    referralCode: 'RAHUL2024',
    createdAt: '2024-01-15T10:30:00Z',
    language: 'en'
  },
  {
    id: 'user_2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'password123',
    phone: '+91 9876543211',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    address: '78, Anna Nagar, Chennai, Tamil Nadu',
    savedAddresses: [
      { id: 'addr_3', label: 'Home', address: '78, Anna Nagar, Chennai', lat: 13.0827, lng: 80.2707 }
    ],
    wallet: 1800,
    referralCode: 'PRIYA2024',
    createdAt: '2024-02-20T14:15:00Z',
    language: 'en'
  },
  {
    id: 'user_3',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    password: 'password123',
    phone: '+91 9876543212',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    address: '34, Connaught Place, New Delhi',
    savedAddresses: [
      { id: 'addr_4', label: 'Home', address: '34, Connaught Place, New Delhi', lat: 28.6139, lng: 77.2090 }
    ],
    wallet: 3200,
    referralCode: 'AMIT2024',
    createdAt: '2024-03-10T09:00:00Z',
    language: 'hi'
  },
  {
    id: 'user_4',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    password: 'password123',
    phone: '+91 9876543213',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
    address: '56, Jubilee Hills, Hyderabad',
    savedAddresses: [
      { id: 'addr_5', label: 'Home', address: '56, Jubilee Hills, Hyderabad', lat: 17.3850, lng: 78.4867 }
    ],
    wallet: 900,
    referralCode: 'SNEHA2024',
    createdAt: '2024-04-05T11:45:00Z',
    language: 'en'
  },
  {
    id: 'user_5',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    password: 'password123',
    phone: '+91 9876543214',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    address: '89, Sector 17, Chandigarh',
    savedAddresses: [
      { id: 'addr_6', label: 'Home', address: '89, Sector 17, Chandigarh', lat: 30.7333, lng: 76.7794 }
    ],
    wallet: 4100,
    referralCode: 'VIKRAM2024',
    createdAt: '2024-05-12T08:30:00Z',
    language: 'en'
  }
];

export default users;
