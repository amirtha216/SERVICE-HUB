import supabase from '../lib/supabase';
import { mapProfileFromDb, mapProfileToDb, mapBookingFromDb } from '../utils/supabaseHelpers';

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

const providerService = {
  getProviderById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'provider')
      .single();

    if (error) {
      console.error('Error fetching provider:', error);
      return null;
    }
    return mapProfileFromDb(data);
  },

  getProviderBookings: async (providerId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching provider bookings:', error);
      return [];
    }
    return data.map(mapBookingFromDb);
  },

  getPendingRequests: async (providerId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
    return data.map(mapBookingFromDb);
  },

  acceptBooking: async (bookingId) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    const booking = mapBookingFromDb(data);

    // Fetch provider name
    const { data: provider } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', booking.providerId)
      .single();

    // Notify user
    await createNotification(
      booking.userId,
      'Booking Accepted',
      `${provider?.name || 'A provider'} has accepted your booking request for ${booking.serviceName}.`,
      'success',
      `/user/track/${booking.id}`
    );

    return { success: true, status: 'accepted', booking };
  },

  rejectBooking: async (bookingId) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    const booking = mapBookingFromDb(data);

    // Fetch provider name
    const { data: provider } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', booking.providerId)
      .single();

    // Notify user
    await createNotification(
      booking.userId,
      'Booking Declined',
      `${provider?.name || 'A provider'} has cancelled/declined your booking request for ${booking.serviceName}.`,
      'error',
      '/user/bookings'
    );

    return { success: true, status: 'cancelled', booking };
  },

  updateStatus: async (bookingId, status) => {
    const updates = { status };
    if (status === 'completed') {
      updates.completed_date = new Date().toISOString();
      updates.payment_status = 'paid';

      try {
        // Fetch booking details to get providerId and amount
        const { data: booking } = await supabase
          .from('bookings')
          .select('provider_id, final_amount')
          .eq('id', bookingId)
          .single();

        if (booking && booking.provider_id) {
          const providerId = booking.provider_id;
          const finalAmount = parseFloat(booking.final_amount || 0);

          // Fetch provider's current profile to update earnings
          const { data: provider } = await supabase
            .from('profiles')
            .select('earnings, total_jobs_completed')
            .eq('id', providerId)
            .single();

          if (provider) {
            const currentEarnings = provider.earnings || { today: 0, week: 0, month: 0, total: 0 };
            const updatedEarnings = {
              today: (currentEarnings.today || 0) + finalAmount,
              week: (currentEarnings.week || 0) + finalAmount,
              month: (currentEarnings.month || 0) + finalAmount,
              total: (currentEarnings.total || 0) + finalAmount
            };
            const updatedJobs = (provider.total_jobs_completed || 0) + 1;

            await supabase
              .from('profiles')
              .update({
                earnings: updatedEarnings,
                total_jobs_completed: updatedJobs
              })
              .eq('id', providerId);
          }
        }
      } catch (e) {
        console.error('Error updating provider earnings on completion:', e);
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    const booking = mapBookingFromDb(data);

    // Fetch provider name
    const { data: provider } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', booking.providerId)
      .single();

    const providerName = provider?.name || 'Your provider';

    if (status === 'on_the_way') {
      await createNotification(
        booking.userId,
        'Provider On The Way',
        `${providerName} is en route to your location.`,
        'towing',
        `/user/track/${booking.id}`
      );
    } else if (status === 'reached') {
      await createNotification(
        booking.userId,
        'Provider Arrived',
        `${providerName} has arrived. Share OTP ${booking.otp} to start the service.`,
        'success',
        `/user/track/${booking.id}`
      );
    } else if (status === 'service_started') {
      await createNotification(
        booking.userId,
        'Service Started',
        `${providerName} has started working on your ${booking.serviceName}.`,
        'info',
        `/user/bookings/${booking.id}`
      );
    } else if (status === 'completed') {
      // Notify user
      await createNotification(
        booking.userId,
        'Service Completed',
        `Your service for ${booking.serviceName} is complete. Please rate your experience!`,
        'star',
        `/user/bookings/${booking.id}`
      );
      // Notify provider
      await createNotification(
        booking.providerId,
        'Job Completed & Earnings Added',
        `You completed the service for Booking ID ${booking.id}. Earnings of ₹${booking.finalAmount} have been added.`,
        'wallet',
        '/provider/earnings'
      );
    } else if (status === 'cancelled') {
      await createNotification(
        booking.userId,
        'Booking Cancelled',
        `Your booking request for ${booking.serviceName} has been cancelled.`,
        'error',
        '/user/bookings'
      );
    }

    return { success: true, status, booking };
  },

  toggleAvailability: async (providerId, isAvailable) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_available: isAvailable })
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, isAvailable: data.is_available };
  },

  updateLocation: async (providerId, lat, lng) => {
    const location = { lat, lng };
    // Fetch current profile to merge location address
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', providerId)
      .single();

    const mergedLocation = {
      ...(currentProfile?.location || {}),
      lat,
      lng
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({ location: mergedLocation })
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { success: true, location: data.location };
  },

  getEarnings: async (providerId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('earnings')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error('Error fetching earnings:', error);
      return { today: 0, week: 0, month: 0, total: 0 };
    }
    return data.earnings || { today: 0, week: 0, month: 0, total: 0 };
  },

  updateProfile: async (providerId, updates) => {
    const dbUpdates = mapProfileToDb(updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const mappedProfile = mapProfileFromDb(data);

    // Also update local storage session if we are updating our own profile
    try {
      const storedUser = localStorage.getItem('servicehub_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id === providerId) {
          localStorage.setItem('servicehub_user', JSON.stringify(mappedProfile));
        }
      }
    } catch (e) {
      console.error(e);
    }

    return { success: true, user: mappedProfile };
  }
};

export default providerService;
