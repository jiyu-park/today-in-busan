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

  return (
    <section className="page detail">
      {image && <img className="detail-image" src={image} alt={spot.title} />}
      <p className="category">{spot.area}</p>
      <h1>{spot.title}</h1>
      <p>{spot.shortDescription || spot.address}</p>

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
        <p>{spot.historyStory || '상세 소개 정보가 없습니다.'}</p>
      </section>

      <Link className="button" to="/spots">
        목록으로 돌아가기
      </Link>
    </section>
  );
}

export default SpotDetail;
