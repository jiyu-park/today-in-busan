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
    <section className="page board-page">
      <div className="page-title board-title">
        <div>
          <p className="eyebrow">Tour spots</p>
          <h1>부산 관광지 보드</h1>
        </div>
        <Link className="ghost-button" to="/">
          플래너로 돌아가기
        </Link>
      </div>

      {isLoading && <p className="status-text">관광지를 불러오는 중입니다.</p>}
      {error && <p className="status-text">{error}</p>}

      {!isLoading && !error && (
        <div className="card-grid">
          {spots.map((spot) => (
            <Link className="spot-card" key={spot.id} to={`/spots/${spot.id}`}>
              {spot.image ? (
                <img src={spot.image} alt={spot.title} />
              ) : (
                <div className="image-placeholder">Busan</div>
              )}
              <div>
                <p className="category">{spot.area || 'Busan'}</p>
                <h2>{spot.title}</h2>
                <p>{spot.shortDescription || spot.address || '상세 정보를 확인해 보세요.'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default SpotList;
