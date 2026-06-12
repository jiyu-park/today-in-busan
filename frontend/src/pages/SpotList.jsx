import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSpots } from '../services/tourApi.js';

function SpotList() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpots()
      .then((data) => {
        setSpots(data);
        setError('');
      })
      .catch(() => {
        setError('관광지 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="page">
      <div className="page-title">
        <p className="eyebrow">Tour spots</p>
        <h1>관광지 목록</h1>
      </div>

      {isLoading && <p className="status-text">관광지를 불러오는 중입니다.</p>}
      {error && <p className="status-text">{error}</p>}

      {!isLoading && !error && (
        <div className="card-grid">
          {spots.map((spot) => (
            <Link className="spot-card" key={spot.id} to={`/spots/${spot.id}`}>
              {spot.image && <img src={spot.image} alt={spot.title} />}
              <div>
                <p className="category">{spot.area}</p>
                <h2>{spot.title}</h2>
                <p>{spot.shortDescription || spot.address}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default SpotList;
