import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { fetchSpots } from '../services/tourApi.js';

function SpotList() {
  const { copy } = useLanguage();
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { fetchSpots().then(setSpots).catch(() => setError(copy.spots.error)).finally(() => setIsLoading(false)); }, [copy.spots.error]);
  return <section className="page board-page">
    <div className="page-title board-title"><div><p className="eyebrow">{copy.spots.eyebrow}</p><h1>{copy.spots.title}</h1></div><Link className="ghost-button" to="/">{copy.spots.back}</Link></div>
    <p className="page-intro">{copy.spots.intro}</p>
    {isLoading && <p className="status-text">{copy.spots.loading}</p>}{error && <p className="status-text">{error}</p>}
    {!isLoading && !error && <div className="card-grid">{spots.map((spot) => <Link className="spot-card" key={spot.id} to={`/spots/${spot.id}`}>{spot.image ? <img src={spot.image} alt={spot.title} /> : <div className="image-placeholder">Busan</div>}<div><p className="category">{spot.area || copy.common.busan}</p><h2>{spot.title}</h2><p>{spot.shortDescription || spot.address || copy.common.noInfo}</p></div></Link>)}</div>}
  </section>;
}
export default SpotList;
