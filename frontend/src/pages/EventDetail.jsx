import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEventDetail } from '../services/tourApi.js';
import { formatPeriod } from './EventList.jsx';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchEventDetail(id)
      .then((eventData) => setEvent(eventData))
      .catch(() => setEvent(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <section className="page">
        <p className="status-text">행사 정보를 불러오는 중입니다.</p>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="page">
        <h1>행사를 찾을 수 없습니다.</h1>
        <Link className="button" to="/events">
          행사 목록으로 돌아가기
        </Link>
      </section>
    );
  }

  const image = event.firstimage || event.firstimage2;
  const place = [event.addr1, event.addr2].filter(Boolean).join(' ') || '장소 정보 확인 필요';

  return (
    <section className="page event-detail-page">
      <Link className="back-link" to="/events">
        행사 목록으로 돌아가기
      </Link>
      {image ? (
        <img className="event-detail-image" src={image} alt={event.title} />
      ) : (
        <div className="event-detail-image image-placeholder">Busan Event</div>
      )}
      <p className="category">Busan festival</p>
      <h1>{event.title}</h1>
      <p className="detail-summary">
        부산에서 열리는 행사입니다. 방문 전 운영 정보와 일정은 공식 안내를 다시 확인해 주세요.
      </p>
      <dl className="info-list event-info-list">
        <div>
          <dt>기간</dt>
          <dd>{formatPeriod(event)}</dd>
        </div>
        <div>
          <dt>장소</dt>
          <dd>{place}</dd>
        </div>
        <div>
          <dt>연락처</dt>
          <dd>{event.tel || '정보 없음'}</dd>
        </div>
      </dl>
    </section>
  );
}

export default EventDetail;
