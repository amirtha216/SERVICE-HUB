import supabase from '../lib/supabase';
import { calculateDistance } from '../utils/helpers';
import { mapBookingFromDb, mapBookingToDb, mapProfileFromDb, mapServiceFromDb, mapComplaintToDb } from '../utils/supabaseHelpers';

const DEFAULT_LAT = 13.0827;
const DEFAULT_LNG = 80.2707;

const createNotification = async (userId, title, message, type, link) => {
  try {
    const id = `notif_${Date.now()}`;
    await supabase.from('notifications').insert([{
      id,
      user_id: userId,
      title,
      message,
      type: type || 'info',
      link: link || '',
      is_read: false,
      created_at: new Date().toISOString()
    }]);
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
};

const bookingService = {
  getServices: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_available', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }
    return data.map(mapServiceFromDb);
  },

  getServiceById: async (id) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching service by ID:', error);
      return null;
    }
    return mapServiceFromDb(data);
  },

  getServiceBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching service by slug:', error);
      return null;
    }
    return mapServiceFromDb(data);
  },

  getProvidersByService: async (serviceSlug, lat, lng) => {
    const searchLat = lat || DEFAULT_LAT;
    const searchLng = lng || DEFAULT_LNG;
    
    // Fetch all active providers
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching providers:', error);
      return [];
    }

    const providers = data
      .map(mapProfileFromDb)
      // Filter for providers that support this service type
      .filter(p => p.serviceType && p.serviceType.includes(serviceSlug));

    providers.forEach(p => {
      if (p.location && p.location.lat && p.location.lng) {
        p.distance = parseFloat(calculateDistance(searchLat, searchLng, p.location.lat, p.location.lng));
      } else {
        p.distance = 999;
      }
    });
    
    // Only return providers within 30 km
    return providers
      .filter(p => p.distance <= 30)
      .sort((a, b) => a.distance - b.distance);
  },

  getNearbyProviders: async (lat, lng, radius = 30) => {
    const searchLat = lat || DEFAULT_LAT;
    const searchLng = lng || DEFAULT_LNG;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'provider')
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching nearby providers:', error);
      return [];
    }

    const providers = data.map(mapProfileFromDb);
    providers.forEach(p => {
      if (p.location && p.location.lat && p.location.lng) {
        p.distance = parseFloat(calculateDistance(searchLat, searchLng, p.location.lat, p.location.lng));
      } else {
        p.distance = 999;
      }
    });
    
    // Only return providers within the specified radius (default 30 km)
    return providers
      .filter(p => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  },

  createBooking: async (bookingData) => {
    const id = `bk_${Date.now()}`;
    const newBooking = {
      id,
      userId: bookingData.userId,
      providerId: bookingData.providerId,
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      status: 'pending',
      bookingDate: new Date().toISOString(),
      completedDate: null,
      userLocation: bookingData.userLocation,
      providerLocation: bookingData.providerLocation,
      amount: bookingData.amount,
      discount: bookingData.discount || 0,
      finalAmount: bookingData.finalAmount,
      paymentMethod: bookingData.paymentMethod || 'cash',
      paymentStatus: 'pending',
      rating: null,
      review: null,
      issue: bookingData.issue || '',
      notes: bookingData.notes || '',
      otp: Math.floor(1000 + Math.random() * 9000).toString()
    };

    const dbBooking = mapBookingToDb(newBooking);

    const { error } = await supabase
      .from('bookings')
      .insert([dbBooking]);

    if (error) {
      throw new Error(error.message);
    }

    // Trigger notification to user
    await createNotification(
      newBooking.userId,
      'Booking Request Sent',
      `Your request for ${newBooking.serviceName} is pending provider acceptance.`,
      'info',
      '/user/bookings'
    );

    // Trigger notification to provider
    await createNotification(
      newBooking.providerId,
      'New Service Request',
      `You have received a new booking request for ${newBooking.serviceName}.`,
      'info',
      '/provider/requests'
    );

    return newBooking;
  },

  getBookingById: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
    return mapBookingFromDb(data);
  },

  getUserBookings: async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
    return data.map(mapBookingFromDb);
  },

  cancelBooking: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', payment_status: 'refunded' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const booking = mapBookingFromDb(data);

    // Notify provider of cancellation
    await createNotification(
      booking.providerId,
      'Booking Cancelled',
      `Booking ID ${booking.id} has been cancelled by the user.`,
      'error',
      '/provider/bookings'
    );

    return { success: true, booking };
  },

  rateBooking: async (bookingId, rating, review) => {
    // 1. Get the booking details to know provider_id
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      throw new Error(bookingErr?.message || 'Booking not found');
    }

    // 2. Update booking table with rating and review
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ rating, review })
      .eq('id', bookingId);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    // 3. Add to reviews table
    const { data: userData } = await supabase
      .from('profiles')
      .select('name, avatar')
      .eq('id', booking.user_id)
      .single();

    const reviewId = `rev_${Date.now()}`;
    const newReview = {
      id: reviewId,
      provider_id: booking.provider_id,
      user_id: booking.user_id,
      user_name: userData?.name || 'Anonymous',
      user_avatar: userData?.avatar || '',
      booking_id: bookingId,
      rating,
      comment: review,
      service_name: booking.service_name,
      created_at: new Date().toISOString()
    };

    const { error: reviewErr } = await supabase
      .from('reviews')
      .insert([newReview]);

    if (reviewErr) {
      console.error('Error writing review:', reviewErr);
    }

    // 4. Fetch all reviews for this provider to recalculate average rating and count
    try {
      const { data: reviews, error: fetchReviewsErr } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', booking.provider_id);

      if (!fetchReviewsErr && reviews) {
        const totalReviews = reviews.length;
        const totalRatingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const avgRating = totalReviews > 0 ? parseFloat((totalRatingSum / totalReviews).toFixed(1)) : 0;

        await supabase
          .from('profiles')
          .update({
            rating: avgRating,
            total_reviews: totalReviews
          })
          .eq('id', booking.provider_id);
      }
    } catch (e) {
      console.error('Error updating provider overall rating:', e);
    }

    return { success: true };
  },

  getReviews: async (providerId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    return data;
  },

  createComplaint: async (complaintData) => {
    const id = `comp_${Date.now()}`;
    const newComplaint = {
      id,
      userId: complaintData.userId,
      userName: complaintData.userName,
      bookingId: complaintData.bookingId || null,
      subject: complaintData.subject,
      message: complaintData.message,
      status: 'open',
      priority: complaintData.priority || 'medium'
    };

    const dbComplaint = mapComplaintToDb(newComplaint);

    const { error } = await supabase
      .from('complaints')
      .insert([dbComplaint]);

    if (error) {
      throw new Error(error.message);
    }
    return newComplaint;
  }
};

export default bookingService;
