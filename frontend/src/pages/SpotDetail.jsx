import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchSpotDetail, fetchSpotImages } from '../services/tourApi.js';

function SpotDetail() {
  const { id } = useParams();
  const [spot, setSpot] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');

    Promise.all([fetchSpotDetail(id), fetchSpotImages(id).catch(() => [])])
      .then(([detail, imageList]) => {
        setSpot(detail);
        setImages(imageList);
      })
      .catch(() => {
        setError('관광지 상세 정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <section className="page">
        <p className="status-text">관광지 상세 정보를 불러오는 중입니다.</p>
      </section>
    );
  }

  if (error || !spot) {
    return (
      <section className="page">
        <h1>관광지를 찾을 수 없습니다.</h1>
        {error && <p className="status-text">{error}</p>}
        <Link className="button" to="/spots">
          목록으로 돌아가기
        </Link>
      </section>
    );
  }

  const image =
    spot.image ||
    images.find((item) => item.originImageUrl)?.originImageUrl ||
    images.find((item) => item.smallImageUrl)?.smallImageUrl;
  const latitude = Number(spot.mapy);
  const longitude = Number(spot.mapx);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapBounds = hasCoordinates
    ? `${longitude - 0.01},${latitude - 0.008},${longitude + 0.01},${latitude + 0.008}`
    : '';
  const mapSrc = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${latitude},${longitude}`
    : '';
  const mapLink = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
    : '';
  const fullDescription =
    spot.historyStory || spot.shortDescription || spot.address || '상세 소개 정보가 없습니다.';

  return (
    <section className="detail-page">
      <article className="detail-content">
        <Link className="back-link" to="/spots">
          ← 목록으로 돌아가기
        </Link>

        {image && <img className="detail-image" src={image} alt={spot.title} />}
        <p className="category">{spot.area}</p>
        <h1>{spot.title}</h1>

        <section className="detail-section">
          <h2>설명</h2>
          <p>{fullDescription}</p>
        </section>

        <dl className="info-list">
          <div>
            <dt>주소</dt>
            <dd>{spot.address || '주소 정보 없음'}</dd>
          </div>
          <div>
            <dt>좌표</dt>
            <dd>
              {spot.mapy || '-'}, {spot.mapx || '-'}
            </dd>
          </div>
        </dl>

        <section className="story-section">
          <h2>역사 스토리</h2>
          <p>{fullDescription}</p>
        </section>

        <section className="source-section">
          <h2>검증 메모</h2>
          <p>
            이 내용은 한국관광공사 TourAPI의 상세 소개 데이터에서 받은 원문을
            표시한 것입니다. AI가 새로 지어낸 문장은 아니지만, 실제 역사적 사실
            검증은 부산시, 문화재청, 공식 관광 안내 페이지 같은 1차 출처와 대조해
            확인하는 것이 좋습니다.
          </p>
        </section>
      </article>

      <aside className="map-panel" aria-label={`${spot.title} 지도`}>
        <div className="map-panel-header">
          <div>
            <p className="eyebrow">Location</p>
            <h2>{spot.title}</h2>
          </div>
          {mapLink && (
            <a className="map-open-link" href={mapLink} target="_blank" rel="noreferrer">
              크게 보기
            </a>
          )}
        </div>

        {hasCoordinates ? (
          <iframe
            className="map-frame"
            title={`${spot.title} 위치 지도`}
            src={mapSrc}
            loading="lazy"
          />
        ) : (
          <div className="map-empty">
            <p>좌표 정보가 없어 지도를 표시할 수 없습니다.</p>
          </div>
        )}
      </aside>
    </section>
  );
}

export default SpotDetail;
