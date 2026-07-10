import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSpots } from '../services/tourApi.js';

function Home() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpots()
      .then((data) => {
        setSpots(data.slice(0, 6));
        setError('');
      })
      .catch(() => {
        setError('추천 관광지를 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const heroImage = useMemo(() => spots.find((spot) => spot.image)?.image, [spots]);
  const featuredSpots = spots.slice(0, 3);

  return (
    <section className="home-board">
      <div className="planner-shell">
        <section className="planner-chat">
          <p className="eyebrow">Today in Busan</p>
          <h1>오늘 부산에서 어디로 떠날까요?</h1>
          <p className="hero-copy">
            부산 관광 데이터를 바탕으로 지금 보기 좋은 장소를 고르고, 일정처럼 훑어볼 수 있게
            정리했습니다.
          </p>

          <div className="prompt-card">
            <div className="assistant-avatar">B</div>
            <div>
              <p className="prompt-label">부산 여행 플래너</p>
              <p>
                바다, 산책, 야경, 가족 나들이 중 마음이 가는 분위기를 골라보세요. 먼저 추천
                장소부터 둘러볼 수 있습니다.
              </p>
            </div>
          </div>

          <div className="quick-chips" aria-label="추천 여행 키워드">
            <span>바다 산책</span>
            <span>사진 명소</span>
            <span>반나절 코스</span>
          </div>

          <Link className="button" to="/spots">
            관광지 목록 보기
          </Link>
        </section>

        <aside className="trip-preview">
          <div
            className="preview-map"
            style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
            aria-label="부산 추천 여행 미리보기"
          >
            <div className="map-pin primary-pin">1</div>
            <div className="map-pin secondary-pin">2</div>
            <div className="map-pin tertiary-pin">3</div>
          </div>

          <div className="itinerary-panel">
            <div className="section-heading compact-heading">
              <p className="eyebrow">Today board</p>
              <h2>추천 여정</h2>
            </div>

            {isLoading && <p className="status-text">관광지를 불러오는 중입니다.</p>}
            {error && <p className="status-text">{error}</p>}

            {!isLoading && !error && (
              <div className="mini-itinerary">
                {featuredSpots.map((spot, index) => (
                  <Link className="mini-stop" key={spot.id} to={`/spots/${spot.id}`}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{spot.title}</strong>
                      <p>{spot.area || spot.address || '부산'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <section className="today-section">
        <div className="section-heading">
          <p className="eyebrow">Explore</p>
          <h2>오늘의 추천 관광지</h2>
        </div>

        {isLoading && <p className="status-text">관광지를 불러오는 중입니다.</p>}
        {error && <p className="status-text">{error}</p>}

        {!isLoading && !error && (
          <div className="card-grid featured-grid">
            {featuredSpots.map((spot) => (
              <Link className="spot-card" key={spot.id} to={`/spots/${spot.id}`}>
                {spot.image ? (
                  <img src={spot.image} alt={spot.title} />
                ) : (
                  <div className="image-placeholder">Busan</div>
                )}
                <div>
                  <p className="category">{spot.area || 'Busan'}</p>
                  <h3>{spot.title}</h3>
                  <p>{spot.shortDescription || spot.address || '상세 정보를 확인해 보세요.'}</p>
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
