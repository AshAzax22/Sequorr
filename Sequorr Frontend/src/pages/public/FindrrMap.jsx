import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Calendar, Globe, Navigation, List, Grid, ChevronDown, ChevronUp } from 'lucide-react';
import { getRaces, getRaceFilters } from '../../api/races';
import CustomSelect from '../../components/CustomSelect';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import styles from './FindrrMap.module.css';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom neon marker
const neonMarkerIcon = new L.DivIcon({
  className: styles.customMarker,
  html: `<div class="${styles.markerInner}"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Helper component to pan/zoom map
const MapRefresher = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};



const FindrrMap = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: 'Los Angeles',
    state: '',
    country: 'US',
    zipcode: '',
    radius: 25,
    start_date: '',
    end_date: '',
    event_type: '',
    min_distance: '',
    max_distance: '',
    sort: 'date',
    results_per_page: 20
  });
  const [availableFilters, setAvailableFilters] = useState(null);
  const [selectedRaceId, setSelectedRaceId] = useState(null);
  const [geocodingIds, setGeocodingIds] = useState(new Set());
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // NYC default
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // split, map, list (for mobile)
  const [showEventFilters, setShowEventFilters] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const f = await getRaceFilters();
        if (f.success) setAvailableFilters(f);
        await fetchRacesList();
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to initialize Findrr' });
      }
    };
    fetchInitial();
  }, []);

  const fetchRacesList = async (customParams = {}) => {
    try {
      setLoading(true);
      const searchParams = { ...filters, ...customParams };
      
      // Clean up empty params
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] == null) {
          delete searchParams[key];
        }
      });
      
      // Radius depends on zipcode for RunSignUp API
      if (!searchParams.zipcode) {
        delete searchParams.radius;
      }

      const res = await getRaces(searchParams);
      if (res.success) {
        setRaces(res.races);
        setSelectedRaceId(null);
        
        // Center on the first race that has coordinates
        const firstWithCoords = res.races.find(r => r.coordinates);
        if (firstWithCoords) {
          setMapCenter([firstWithCoords.coordinates.lat, firstWithCoords.coordinates.lng]);
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  // Removed MapEvents handleMapMove



  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRacesList();
  };

  const selectRace = async (race) => {
    setSelectedRaceId(race.race_id);

    // If race has coordinates, just pan
    if (race.coordinates) {
      setMapCenter([race.coordinates.lat, race.coordinates.lng]);
    } else {
      // Lazy geocode if not already in progress
      if (!geocodingIds.has(race.race_id)) {
        try {
          setGeocodingIds(prev => new Set(prev).add(race.race_id));
          const response = await fetch('http://localhost:5000/api/races/geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(race.address)
          });
          const result = await response.json();
          if (result.success) {
            // Update the race in the list with its new coordinates
            setRaces(prev => prev.map(r => 
              r.race_id === race.race_id ? { ...r, coordinates: result.data } : r
            ));
            setMapCenter([result.data.lat, result.data.lng]);
          } else {
            setToast({ type: 'warning', message: 'Could not find location for this race' });
          }
        } catch (err) {
          console.error('Lazy geocode failed:', err);
        } finally {
          setGeocodingIds(prev => {
            const next = new Set(prev);
            next.delete(race.race_id);
            return next;
          });
        }
      }
    }
    
    if (window.innerWidth < 768) setViewMode('map');
  };

  return (
    <div className={styles.page}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.brand}>Sequorr</span>
          <span className={styles.findr}>Findrr</span>
        </div>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <div className={styles.inputGroup}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              name="search"
              placeholder="Search by name..." 
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <MapPin size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              name="city"
              placeholder="City (e.g. Los Angeles)..." 
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>Find Races</button>
        </form>
        <div className={styles.mobileNav}>
          <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? styles.active : ''}><List size={20}/></button>
          <button onClick={() => setViewMode('split')} className={viewMode === 'split' ? styles.active : ''}><Grid size={20}/></button>
          <button onClick={() => setViewMode('map')} className={viewMode === 'map' ? styles.active : ''}><Navigation size={20}/></button>
        </div>
      </header>

      <main className={`${styles.main} ${styles[viewMode]}`}>
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h3 className={styles.sidebarTitle}>Location Filters</h3>
            <div className={styles.filtersWrapper}>
              <div className={styles.filterRow}>
                <input 
                  type="text" 
                  name="state"
                  placeholder="State (e.g. CA)" 
                  value={filters.state}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                />
                <CustomSelect 
                  name="country"
                  placeholder="Country" 
                  value={filters.country}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                  options={[
                    { value: '', label: 'Any Country' },
                    ...(availableFilters?.available_countries || [])
                  ]}
                />
              </div>
              <div className={styles.filterRow}>
                <input 
                  type="text" 
                  name="zipcode"
                  placeholder="Zipcode" 
                  value={filters.zipcode}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                />
                <input 
                  type="number" 
                  name="radius"
                  placeholder="Radius (mi)" 
                  value={filters.radius}
                  onChange={handleFilterChange}
                  className={styles.filterInput}
                  min="1"
                  max={availableFilters?.max_radius || 100}
                />
              </div>
            </div>
          </div>

          <div className={styles.filterSection}>
            <div 
              className={styles.sidebarTitleCollapsible} 
              onClick={() => setShowEventFilters(!showEventFilters)}
            >
              <h3>Event Details</h3>
              {showEventFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {showEventFilters && (
              <div className={styles.filtersWrapper}>
                <div className={styles.filterRow}>
                  <input 
                    type="date" 
                    name="start_date"
                    placeholder="Start Date" 
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className={styles.filterInput}
                  />
                  <input 
                    type="date" 
                    name="end_date"
                    placeholder="End Date" 
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className={styles.filterInput}
                  />
                </div>
                <CustomSelect 
                  name="event_type"
                  placeholder="All Types"
                  value={filters.event_type}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'All Types' },
                    ...(availableFilters?.event_types.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })) || [])
                  ]}
                />
                <CustomSelect 
                  name="min_distance"
                  placeholder="Min Distance"
                  value={filters.min_distance}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'Min Distance' },
                    ...(availableFilters?.distance_presets.map(p => ({ value: p.miles, label: p.label })) || [])
                  ]}
                />
                <CustomSelect 
                  name="max_distance"
                  placeholder="Max Distance"
                  value={filters.max_distance}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'Max Distance' },
                    ...(availableFilters?.distance_presets.map(p => ({ value: p.miles, label: p.label })) || [])
                  ]}
                />
                <CustomSelect 
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  options={[
                    { value: 'date', label: 'By Date' },
                    { value: 'name', label: 'By Name' },
                    { value: 'distance', label: 'By Distance' }
                  ]}
                />
              </div>
            )}
          </div>

          <div className={styles.resultsArea}>
            <div className={styles.resultsCount}>
              <span>{loading ? 'Searching...' : `${races.length} races found`}</span>
              {loading && <div className={styles.progressBar} />}
            </div>
            
            <div className={styles.raceList}>
              {loading && races.length === 0 ? (
                <div className={styles.center}><Spinner size="md" /></div>
              ) : (
                races.map(race => (
                  <div 
                    key={race.race_id} 
                    className={`${styles.raceCard} ${selectedRaceId === race.race_id ? styles.selectedRace : ''}`}
                    onClick={() => selectRace(race)}
                  >
                    <div className={styles.raceCardHeader}>
                      {race.logo_url && <img src={race.logo_url} alt="" className={styles.raceLogo} />}
                      <div className={styles.raceNameArea}>
                        <h4 className={styles.raceName}>{race.name}</h4>
                        <div className={styles.metaItem}>
                          <MapPin size={12} />
                          <span>{race.address.city}, {race.address.state}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.raceCardBody}>
                      <div className={styles.raceMetaGrid}>
                        <div className={styles.metaItem}>
                          <Calendar size={12} />
                          <span>{race.next_date || 'TBD'}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Navigation size={12} />
                          <span>{race.events[0]?.distance || 'N/A'}</span>
                        </div>
                      </div>
                      
                        <div className={styles.raceCardFooter}>
                          <div className={styles.tagsArea}>
                            {race.events.slice(0, 3).map(ev => (
                              <span key={ev.event_id} className={styles.distanceTag}>{ev.distance}</span>
                            ))}
                          </div>
                          {geocodingIds.has(race.race_id) ? (
                            <div className={styles.cardLoader}>
                              <Spinner size="xs" /> <span>Geocoding...</span>
                            </div>
                          ) : (
                            <a 
                              href={race.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={styles.sidebarRegisterBtn}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Register
                            </a>
                          )}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className={`${styles.mapSection} ${loading ? styles.mapBlur : ''} ${loading ? styles.mapLocked : ''}`}>
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            className={styles.map}
            zoomControl={false}
          >
            {/* Dark Tiles Provider */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapRefresher center={mapCenter} zoom={selectedRaceId ? 14 : 11} />
            {/* MapEvents removed */}
            
            {races.map(race => {
              const coords = race.coordinates;
              if (!coords) return null;
              return (
                <Marker 
                  key={race.race_id} 
                  position={[coords.lat, coords.lng]}
                  icon={neonMarkerIcon}
                  eventHandlers={{
                    mouseover: (e) => {
                      setSelectedRaceId(race.race_id);
                    },
                  }}
                >
                  <Tooltip 
                    className={styles.markerTooltip} 
                    direction="top" 
                    offset={[0, -10]} 
                    opacity={1}
                  >
                    <div className={styles.tooltipContent}>
                      <h6 className={styles.tooltipTitle}>{race.name}</h6>
                      <div className={styles.tooltipMeta}>
                        <span>{race.next_date}</span>
                        <span>•</span>
                        <span>{race.address.city}</span>
                      </div>
                      <div className={styles.tooltipStats}>
                        <span className={styles.tooltipTag}>{race.events[0]?.distance}</span>
                        <span className={styles.tooltipTag}>{race.events[0]?.event_type}</span>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </section>
      </main>
    </div>
  );
};

export default FindrrMap;
