import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSpots } from '../services/tourApi.js';

function Home() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpots()
      .then((data) => {
        setSpots(data.slice(0, 3));
        setError('');
      })
      .catch(() => {
        setError('추천 관광지를 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="page home-page">
      <div className="hero">
        <p className="eyebrow">Today in Busan</p>
        <h1>오늘의 부산을 가볍게 둘러보세요</h1>
        <p>
          지금 가기 좋은 부산 관광지를 카드로 확인하고, 마음에 드는 장소를
          빠르게 살펴보세요.
        </p>
        <Link className="button" to="/spots">
          관광지 목록 보기
        </Link>
      </div>

      <section className="today-section">
        <div className="section-heading">
          <p className="eyebrow">오늘의 부산</p>
          <h2>추천 관광지</h2>
        </div>

        {isLoading && <p className="status-text">관광지를 불러오는 중입니다.</p>}
        {error && <p className="status-text">{error}</p>}

        {!isLoading && !error && (
          <div className="card-grid featured-grid">
            {spots.map((spot) => (
              <Link className="spot-card" key={spot.id} to={`/spots/${spot.id}`}>
                {spot.image && <img src={spot.image} alt={spot.title} />}
                <div>
                  <p className="category">{spot.area}</p>
                  <h3>{spot.title}</h3>
                  <p>{spot.shortDescription || spot.address}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default Home;
