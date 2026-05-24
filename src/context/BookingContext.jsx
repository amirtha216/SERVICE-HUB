import { createContext, useContext, useReducer, useEffect } from 'react';
import bookingService from '../services/bookingService';
import providerService from '../services/providerService';
import supabase from '../lib/supabase';
import { mapBookingFromDb } from '../utils/supabaseHelpers';

const BookingContext = createContext(null);

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null
};

const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload, loading: false };
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings], currentBooking: action.payload };
    case 'UPDATE_BOOKING': {
      const updated = state.bookings.map(b =>
        b.id === action.payload.id ? { ...b, ...action.payload } : b
      );
      return {
        ...state,
        bookings: updated,
        currentBooking: state.currentBooking?.id === action.payload.id
          ? { ...state.currentBooking, ...action.payload }
          : state.currentBooking
      };
    }
    case 'SET_CURRENT':
      return { ...state, currentBooking: action.payload };
    case 'CLEAR_CURRENT':
      return { ...state, currentBooking: null };
    default:
      return state;
  }
};

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Load all bookings from Supabase initially
  useEffect(() => {
    const fetchAllBookings = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (!error && data) {
        dispatch({ type: 'SET_BOOKINGS', payload: data.map(mapBookingFromDb) });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchAllBookings();

    // Set up real-time subscription for bookings changes so it's instantly reactive!
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'ADD_BOOKING', payload: mapBookingFromDb(payload.new) });
        } else if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_BOOKING', payload: mapBookingFromDb(payload.new) });
        } else if (payload.eventType === 'DELETE') {
          // Re-fetch all bookings to be safe
          fetchAllBookings();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createBooking = async (bookingData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newBooking = await bookingService.createBooking(bookingData);
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      dispatch({ type: 'SET_LOADING', payload: false });
      return newBooking;
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await providerService.updateStatus(bookingId, status);
      if (res.success && res.booking) {
        dispatch({ type: 'UPDATE_BOOKING', payload: res.booking });
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await bookingService.cancelBooking(bookingId);
      if (res.success && res.booking) {
        dispatch({ type: 'UPDATE_BOOKING', payload: res.booking });
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  const rateBooking = async (bookingId, rating, review) => {
    try {
      const res = await bookingService.rateBooking(bookingId, rating, review);
      if (res.success) {
        dispatch({ type: 'UPDATE_BOOKING', payload: { id: bookingId, rating, review } });
      }
    } catch (err) {
      console.error('Error rating booking:', err);
    }
  };

  const getUserBookings = (userId) => state.bookings.filter(b => b.userId === userId);
  const getProviderBookings = (providerId) => state.bookings.filter(b => b.providerId === providerId);
  const getBookingById = (id) => state.bookings.find(b => b.id === id);
  const setCurrentBooking = (booking) => dispatch({ type: 'SET_CURRENT', payload: booking });

  return (
    <BookingContext.Provider value={{
      ...state,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      rateBooking,
      getUserBookings,
      getProviderBookings,
      getBookingById,
      setCurrentBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};

export default BookingContext;
