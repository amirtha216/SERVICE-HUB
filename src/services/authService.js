import supabase from '../lib/supabase';
import { mapProfileFromDb, mapProfileToDb } from '../utils/supabaseHelpers';

const authService = {
  login: async (email, password, role) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .eq('role', role)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error('Invalid email, password, or role');
    }

    const mappedUser = mapProfileFromDb(data);
    return { user: mappedUser, token: 'supabase_session_' + mappedUser.id };
  },

  signup: async (userData) => {
    const id = `${userData.role}_${Date.now()}`;
    const newUser = {
      id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      role: userData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      wallet: 500,
      referral_code: userData.name.toUpperCase().slice(0, 5) + Math.floor(Math.random() * 1000),
      language: 'en',
      is_active: true,
      saved_addresses: [],
      ...(userData.role === 'provider' ? (() => {
        const neighborhoods = ['T. Nagar', 'Anna Nagar', 'Adyar', 'Tambaram', 'Velachery', 'Nungambakkam', 'Guindy', 'Mylapore', 'Royapettah', 'Egmore'];
        const chosenNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
        const latOffset = (Math.random() - 0.5) * 0.16; // Up to +/- 0.08 degrees (~8.8km)
        const lngOffset = (Math.random() - 0.5) * 0.16;
        return {
          owner_name: userData.name,
          service_type: userData.serviceType || [],
          rating: 0,
          total_reviews: 0,
          total_jobs_completed: 0,
          experience: '1 year',
          is_available: true,
          is_verified: false,
          location: { 
            lat: parseFloat((13.0827 + latOffset).toFixed(4)), 
            lng: parseFloat((80.2707 + lngOffset).toFixed(4)), 
            address: `${chosenNeighborhood}, Chennai, Tamil Nadu` 
          },
          earnings: { today: 0, week: 0, month: 0, total: 0 },
          vehicle_type: userData.vehicleType || 'Two Wheeler',
          documents: { aadhar: false, pan: false, license: false }
        };
      })() : {})
    };

    const { error } = await supabase
      .from('profiles')
      .insert([newUser]);

    if (error) {
      throw new Error(error.message);
    }

    const mappedUser = mapProfileFromDb(newUser);
    return { user: mappedUser, token: 'supabase_session_' + mappedUser.id };
  },

  forgotPassword: async (email) => {
    // Check if user exists
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (error || !data) {
      throw new Error('Email address not found');
    }

    return { success: true, message: 'Password reset link sent to your email' };
  },

  updateProfile: async (userId, updates) => {
    // If the address is being changed, automatically resolve coordinates for Tamil Nadu cities
    if (updates.address) {
      const addrLower = updates.address.toLowerCase();
      let lat = 13.0827; // Default Chennai
      let lng = 80.2707;
      
      if (addrLower.includes('coimbatore')) {
        lat = 11.0168;
        lng = 76.9558;
      } else if (addrLower.includes('madurai')) {
        lat = 9.9252;
        lng = 78.1198;
      } else if (addrLower.includes('trichy') || addrLower.includes('tiruchirappalli')) {
        lat = 10.7905;
        lng = 78.7047;
      } else if (addrLower.includes('saveetha') || addrLower.includes('thandalam') || addrLower.includes('sriperumbudur')) {
        lat = 13.0203;
        lng = 80.0163;
      }
      
      updates.savedAddresses = [{
        id: 'addr_default_' + Date.now(),
        label: 'Primary',
        address: updates.address,
        lat,
        lng
      }];
    }

    const dbUpdates = mapProfileToDb(updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const mappedUser = mapProfileFromDb(data);
    return { success: true, user: mappedUser };
  }
};

export default authService;
