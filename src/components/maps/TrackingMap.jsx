import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaUser, FaTruck } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateDistance, calculateETA } from '../../utils/helpers';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (IconComponent, color) => {
  const iconMarkup = renderToStaticMarkup(
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: color }}>
      <IconComponent className="text-sm" />
    </div>
  );
  return L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const userIcon = createCustomIcon(FaUser, '#3b82f6');
const providerIcon = createCustomIcon(FaTruck, '#f97316');

// Map updater component to auto-fit bounds
const MapBounds = ({ userLoc, providerLoc }) => {
  const map = useMap();
  useEffect(() => {
    if (userLoc && providerLoc) {
      const bounds = L.latLngBounds([userLoc, providerLoc]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userLoc) {
      map.setView(userLoc, 15);
    }
  }, [map, userLoc, providerLoc]);
  return null;
};

const TrackingMap = ({ userLocation, providerLocation, isTracking = false, onLocationUpdate }) => {
  const [currentProviderLoc, setCurrentProviderLoc] = useState(providerLocation);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState('');
  
  const simulationIntervalRef = useRef(null);

  // Initialize route
  useEffect(() => {
    if (userLocation && providerLocation) {
      setRoute([
        [providerLocation.lat, providerLocation.lng],
        [userLocation.lat, userLocation.lng]
      ]);
      const dist = calculateDistance(
        providerLocation.lat, providerLocation.lng,
        userLocation.lat, userLocation.lng
      );
      setDistance(dist);
      setEta(calculateETA(dist));
    }
  }, [userLocation, providerLocation]);

  // Simulate movement
  useEffect(() => {
    if (isTracking && userLocation && currentProviderLoc) {
      simulationIntervalRef.current = setInterval(() => {
        setCurrentProviderLoc((prev) => {
          const latDiff = userLocation.lat - prev.lat;
          const lngDiff = userLocation.lng - prev.lng;
          
          // Move 5% closer each tick
          const nextLat = prev.lat + (latDiff * 0.05);
          const nextLng = prev.lng + (lngDiff * 0.05);
          
          const newLoc = { lat: nextLat, lng: nextLng, address: prev.address };
          
          const newDist = calculateDistance(nextLat, nextLng, userLocation.lat, userLocation.lng);
          setDistance(newDist);
          setEta(calculateETA(newDist));
          
          if (onLocationUpdate) {
            onLocationUpdate(newLoc, newDist, calculateETA(newDist));
          }
          
          // Stop if very close (e.g. < 0.05km)
          if (newDist < 0.05) {
            clearInterval(simulationIntervalRef.current);
          }
          
          return newLoc;
        });
      }, 3000); // Update every 3 seconds
    }
    
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isTracking, userLocation]); // intentionally omitting currentProviderLoc to avoid resetting interval

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707];

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-white/10 z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-semibold text-gray-800">Your Location</div>
              <div className="text-xs text-gray-500">{userLocation.address}</div>
            </Popup>
          </Marker>
        )}
        
        {currentProviderLoc && (
          <Marker position={[currentProviderLoc.lat, currentProviderLoc.lng]} icon={providerIcon}>
            <Popup>
              <div className="text-sm font-semibold text-gray-800">Provider Location</div>
              {isTracking && (
                <div className="text-xs text-gray-500 mt-1">
                  <div>Distance: {distance} km</div>
                  <div>ETA: {eta}</div>
                </div>
              )}
            </Popup>
          </Marker>
        )}
        
        {isTracking && userLocation && currentProviderLoc && (
          <Polyline 
            positions={[
              [currentProviderLoc.lat, currentProviderLoc.lng],
              [userLocation.lat, userLocation.lng]
            ]} 
            color="#f97316" 
            weight={4} 
            dashArray="10, 10"
          />
        )}

        <MapBounds 
          userLoc={userLocation ? [userLocation.lat, userLocation.lng] : null} 
          providerLoc={currentProviderLoc ? [currentProviderLoc.lat, currentProviderLoc.lng] : null} 
        />
      </MapContainer>
      
      {/* Floating Info Panel */}
      {isTracking && distance > 0.05 && (
        <div className="absolute top-4 right-4 z-[400] bg-[var(--card-bg)] backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-[var(--text-secondary)] font-medium uppercase">ETA</div>
            <div className="text-lg font-bold text-orange-400">{eta}</div>
            <div className="text-xs text-[var(--text-secondary)]">{distance} km away</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
