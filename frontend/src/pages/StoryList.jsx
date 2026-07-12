import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { fetchSpots } from '../services/tourApi.js';

function StoryList() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { copy } = useLanguage();

  useEffect(() => {
    fetchSpots()
      .then((data) => setSpots(data.filter((spot) => spot.historyStory || spot.shortDescription)))
      .catch(() => setError(copy.stories.error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="page board-page">
      <div className="page-title board-title">
        <div><p className="eyebrow">{copy.stories.eyebrow}</p><h1>{copy.stories.title}</h1></div>
        <Link className="ghost-button" to="/">{copy.nav.home}</Link>
      </div>
      <p className="page-intro">{copy.stories.intro}</p>
      {isLoading && <p className="status-text">{copy.stories.loading}</p>}
      {error && <p className="status-text">{error}</p>}
      {!isLoading && !error && (
        <div className="story-grid">
          {spots.map((spot) => (
            <article className="story-card" key={spot.id}>
              {spot.image ? <img src={spot.image} alt={spot.title} /> : <div className="image-placeholder">Busan</div>}
              <div className="story-card-body">
                <p className="category">{spot.area || 'Busan'}</p>
                <h2>{spot.title}</h2>
                <p>{spot.historyStory || spot.shortDescription}</p>
                <Link className="event-detail-link" to={`/spots/${spot.id}`}>{copy.stories.detail} →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default StoryList;
