export const mapProfileFromDb = (dbProfile) => {
  if (!dbProfile) return null;
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    email: dbProfile.email,
    phone: dbProfile.phone,
    role: dbProfile.role,
    avatar: dbProfile.avatar,
    address: dbProfile.address,
    wallet: dbProfile.wallet ? parseFloat(dbProfile.wallet) : 0,
    referralCode: dbProfile.referral_code,
    language: dbProfile.language,
    isActive: dbProfile.is_active,
    savedAddresses: dbProfile.saved_addresses || [],
    // Provider specific
    ownerName: dbProfile.owner_name,
    serviceType: dbProfile.service_type || [],
    rating: dbProfile.rating ? parseFloat(dbProfile.rating) : 0,
    totalReviews: dbProfile.total_reviews || 0,
    totalJobsCompleted: dbProfile.total_jobs_completed || 0,
    experience: dbProfile.experience,
    isAvailable: dbProfile.is_available,
    isVerified: dbProfile.is_verified,
    location: dbProfile.location,
    earnings: dbProfile.earnings || { today: 0, week: 0, month: 0, total: 0 },
    vehicleType: dbProfile.vehicle_type,
    documents: dbProfile.documents || { aadhar: false, pan: false, license: false },
    joinedAt: dbProfile.joined_at,
    createdAt: dbProfile.created_at
  };
};

export const mapProfileToDb = (jsProfile) => {
  if (!jsProfile) return null;
  const dbData = {};
  
  if (jsProfile.id !== undefined) dbData.id = jsProfile.id;
  if (jsProfile.name !== undefined) dbData.name = jsProfile.name;
  if (jsProfile.email !== undefined) dbData.email = jsProfile.email;
  if (jsProfile.phone !== undefined) dbData.phone = jsProfile.phone;
  if (jsProfile.role !== undefined) dbData.role = jsProfile.role;
  if (jsProfile.avatar !== undefined) dbData.avatar = jsProfile.avatar;
  if (jsProfile.address !== undefined) dbData.address = jsProfile.address;
  if (jsProfile.wallet !== undefined) dbData.wallet = jsProfile.wallet;
  if (jsProfile.referralCode !== undefined) dbData.referral_code = jsProfile.referralCode;
  if (jsProfile.language !== undefined) dbData.language = jsProfile.language;
  if (jsProfile.isActive !== undefined) dbData.is_active = jsProfile.isActive;
  if (jsProfile.savedAddresses !== undefined) dbData.saved_addresses = jsProfile.savedAddresses;
  
  // Provider specific
  if (jsProfile.ownerName !== undefined) dbData.owner_name = jsProfile.ownerName;
  if (jsProfile.serviceType !== undefined) dbData.service_type = jsProfile.serviceType;
  if (jsProfile.rating !== undefined) dbData.rating = jsProfile.rating;
  if (jsProfile.totalReviews !== undefined) dbData.total_reviews = jsProfile.totalReviews;
  if (jsProfile.totalJobsCompleted !== undefined) dbData.total_jobs_completed = jsProfile.totalJobsCompleted;
  if (jsProfile.experience !== undefined) dbData.experience = jsProfile.experience;
  if (jsProfile.isAvailable !== undefined) dbData.is_available = jsProfile.isAvailable;
  if (jsProfile.isVerified !== undefined) dbData.is_verified = jsProfile.isVerified;
  if (jsProfile.location !== undefined) dbData.location = jsProfile.location;
  if (jsProfile.earnings !== undefined) dbData.earnings = jsProfile.earnings;
  if (jsProfile.vehicleType !== undefined) dbData.vehicle_type = jsProfile.vehicleType;
  if (jsProfile.documents !== undefined) dbData.documents = jsProfile.documents;
  if (jsProfile.joinedAt !== undefined) dbData.joined_at = jsProfile.joinedAt;

  return dbData;
};

export const mapBookingFromDb = (dbBooking) => {
  if (!dbBooking) return null;
  return {
    id: dbBooking.id,
    userId: dbBooking.user_id,
    providerId: dbBooking.provider_id,
    serviceId: dbBooking.service_id,
    serviceName: dbBooking.service_name,
    status: dbBooking.status,
    bookingDate: dbBooking.booking_date,
    completedDate: dbBooking.completed_date,
    userLocation: dbBooking.user_location,
    providerLocation: dbBooking.provider_location,
    amount: dbBooking.amount ? parseFloat(dbBooking.amount) : 0,
    discount: dbBooking.discount ? parseFloat(dbBooking.discount) : 0,
    finalAmount: dbBooking.final_amount ? parseFloat(dbBooking.final_amount) : 0,
    paymentMethod: dbBooking.payment_method,
    paymentStatus: dbBooking.payment_status,
    rating: dbBooking.rating,
    review: dbBooking.review,
    issue: dbBooking.issue,
    notes: dbBooking.notes,
    otp: dbBooking.otp,
    createdAt: dbBooking.created_at
  };
};

export const mapBookingToDb = (jsBooking) => {
  if (!jsBooking) return null;
  const dbData = {};
  
  if (jsBooking.id !== undefined) dbData.id = jsBooking.id;
  if (jsBooking.userId !== undefined) dbData.user_id = jsBooking.userId;
  if (jsBooking.providerId !== undefined) dbData.provider_id = jsBooking.providerId;
  if (jsBooking.serviceId !== undefined) dbData.service_id = jsBooking.serviceId;
  if (jsBooking.serviceName !== undefined) dbData.service_name = jsBooking.serviceName;
  if (jsBooking.status !== undefined) dbData.status = jsBooking.status;
  if (jsBooking.bookingDate !== undefined) dbData.booking_date = jsBooking.bookingDate;
  if (jsBooking.completedDate !== undefined) dbData.completed_date = jsBooking.completedDate;
  if (jsBooking.userLocation !== undefined) dbData.user_location = jsBooking.userLocation;
  if (jsBooking.providerLocation !== undefined) dbData.provider_location = jsBooking.providerLocation;
  if (jsBooking.amount !== undefined) dbData.amount = jsBooking.amount;
  if (jsBooking.discount !== undefined) dbData.discount = jsBooking.discount;
  if (jsBooking.finalAmount !== undefined) dbData.final_amount = jsBooking.finalAmount;
  if (jsBooking.paymentMethod !== undefined) dbData.payment_method = jsBooking.paymentMethod;
  if (jsBooking.paymentStatus !== undefined) dbData.payment_status = jsBooking.paymentStatus;
  if (jsBooking.rating !== undefined) dbData.rating = jsBooking.rating;
  if (jsBooking.review !== undefined) dbData.review = jsBooking.review;
  if (jsBooking.issue !== undefined) dbData.issue = jsBooking.issue;
  if (jsBooking.notes !== undefined) dbData.notes = jsBooking.notes;
  if (jsBooking.otp !== undefined) dbData.otp = jsBooking.otp;

  return dbData;
};

export const mapServiceFromDb = (dbService) => {
  if (!dbService) return null;
  return {
    id: dbService.id,
    name: dbService.name,
    slug: dbService.slug,
    category: dbService.category,
    icon: dbService.icon,
    description: dbService.description,
    longDescription: dbService.long_description,
    basePrice: dbService.base_price ? parseFloat(dbService.base_price) : 0,
    pricePerKm: dbService.price_per_km ? parseFloat(dbService.price_per_km) : 0,
    estimatedTime: dbService.estimated_time,
    rating: dbService.rating ? parseFloat(dbService.rating) : 0,
    totalBookings: dbService.total_bookings || 0,
    image: dbService.image,
    tags: dbService.tags || [],
    isPopular: dbService.is_popular,
    isAvailable: dbService.is_available,
    createdAt: dbService.created_at
  };
};

export const mapServiceToDb = (jsService) => {
  if (!jsService) return null;
  const dbData = {};

  if (jsService.id !== undefined) dbData.id = jsService.id;
  if (jsService.name !== undefined) dbData.name = jsService.name;
  if (jsService.slug !== undefined) dbData.slug = jsService.slug;
  if (jsService.category !== undefined) dbData.category = jsService.category;
  if (jsService.icon !== undefined) dbData.icon = jsService.icon;
  if (jsService.description !== undefined) dbData.description = jsService.description;
  if (jsService.longDescription !== undefined) dbData.long_description = jsService.longDescription;
  if (jsService.basePrice !== undefined) dbData.base_price = jsService.basePrice;
  if (jsService.pricePerKm !== undefined) dbData.price_per_km = jsService.pricePerKm;
  if (jsService.estimatedTime !== undefined) dbData.estimated_time = jsService.estimatedTime;
  if (jsService.rating !== undefined) dbData.rating = jsService.rating;
  if (jsService.totalBookings !== undefined) dbData.total_bookings = jsService.totalBookings;
  if (jsService.image !== undefined) dbData.image = jsService.image;
  if (jsService.tags !== undefined) dbData.tags = jsService.tags;
  if (jsService.isPopular !== undefined) dbData.is_popular = jsService.isPopular;
  if (jsService.isAvailable !== undefined) dbData.is_available = jsService.isAvailable;

  return dbData;
};

export const mapNotificationFromDb = (dbNotif) => {
  if (!dbNotif) return null;
  return {
    id: dbNotif.id,
    userId: dbNotif.user_id,
    title: dbNotif.title,
    message: dbNotif.message,
    type: dbNotif.type,
    isRead: dbNotif.is_read,
    link: dbNotif.link,
    createdAt: dbNotif.created_at
  };
};

export const mapNotificationToDb = (jsNotif) => {
  if (!jsNotif) return null;
  const dbData = {};

  if (jsNotif.id !== undefined) dbData.id = jsNotif.id;
  if (jsNotif.userId !== undefined) dbData.user_id = jsNotif.userId;
  if (jsNotif.title !== undefined) dbData.title = jsNotif.title;
  if (jsNotif.message !== undefined) dbData.message = jsNotif.message;
  if (jsNotif.type !== undefined) dbData.type = jsNotif.type;
  if (jsNotif.isRead !== undefined) dbData.is_read = jsNotif.isRead;
  if (jsNotif.link !== undefined) dbData.link = jsNotif.link;
  if (jsNotif.createdAt !== undefined) dbData.created_at = jsNotif.createdAt;

  return dbData;
};

export const mapComplaintFromDb = (dbComplaint) => {
  if (!dbComplaint) return null;
  return {
    id: dbComplaint.id,
    userId: dbComplaint.user_id,
    userName: dbComplaint.user_name,
    bookingId: dbComplaint.booking_id,
    subject: dbComplaint.subject,
    message: dbComplaint.message,
    status: dbComplaint.status,
    priority: dbComplaint.priority,
    createdAt: dbComplaint.created_at
  };
};

export const mapComplaintToDb = (jsComplaint) => {
  if (!jsComplaint) return null;
  const dbData = {};

  if (jsComplaint.id !== undefined) dbData.id = jsComplaint.id;
  if (jsComplaint.userId !== undefined) dbData.user_id = jsComplaint.userId;
  if (jsComplaint.userName !== undefined) dbData.user_name = jsComplaint.userName;
  if (jsComplaint.bookingId !== undefined) dbData.booking_id = jsComplaint.bookingId;
  if (jsComplaint.subject !== undefined) dbData.subject = jsComplaint.subject;
  if (jsComplaint.message !== undefined) dbData.message = jsComplaint.message;
  if (jsComplaint.status !== undefined) dbData.status = jsComplaint.status;
  if (jsComplaint.priority !== undefined) dbData.priority = jsComplaint.priority;
  if (jsComplaint.createdAt !== undefined) dbData.created_at = jsComplaint.createdAt;

  return dbData;
};

