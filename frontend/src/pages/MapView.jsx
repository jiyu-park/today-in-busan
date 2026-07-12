import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { fetchSpots } from '../services/tourApi.js';

function MapView() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { copy } = useLanguage();

  useEffect(() => {
    fetchSpots().then(setSpots).finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="page map-overview-page">
      <div className="page-title board-title">
        <div><p className="eyebrow">{copy.map.eyebrow}</p><h1>{copy.map.title}</h1></div>
        <Link className="ghost-button" to="/spots">{copy.map.list}</Link>
      </div>
      <p className="page-intro">{copy.map.intro}</p>
      <div className="map-overview-layout">
        <div className="map-overview-frame">
          <iframe title="부산 관광지 지도" src="https://www.openstreetmap.org/export/embed.html?bbox=128.85%2C35.02%2C129.25%2C35.25&layer=mapnik" loading="lazy" />
        </div>
        <aside className="map-place-list">
          <div className="section-heading compact-heading"><p className="eyebrow">Places</p><h2>{copy.map.places}</h2></div>
          {isLoading && <p className="status-text">{copy.map.loading}</p>}
          {!isLoading && spots.slice(0, 8).map((spot, index) => (
            <Link className="map-place-item" key={spot.id} to={`/spots/${spot.id}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{spot.title}</strong><small>{spot.area || spot.address || '부산'}</small></div>
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}

export default MapView;
