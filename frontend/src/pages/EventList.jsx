import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../services/tourApi.js';

function parseFestivalDate(value) {
  if (!/^\d{8}$/.test(value || '')) return null;
  return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`);
}

function formatPeriod(event) {
  const start = parseFestivalDate(event.eventstartdate);
  const end = parseFestivalDate(event.eventenddate);
  if (!start || !end) return '기간 정보 확인 필요';

  const format = (date) =>
    new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(date);
  return `${format(start)} - ${format(end)}`;
}

function EventCard({ event }) {
  const image = event.firstimage || event.firstimage2;
  const place = event.addr1 || '장소 정보 확인 필요';

  return (
    <article className="event-card">
      {image ? (
        <img src={image} alt={event.title} />
      ) : (
        <div className="image-placeholder">Busan Event</div>
      )}
      <div>
        <p className="category">Busan festival</p>
        <h2>{event.title}</h2>
        <p className="event-meta">장소: {place}</p>
        <p className="event-meta">기간: {formatPeriod(event)}</p>
        <Link className="event-detail-link" to={`/events/${event.contentid}`}>
          행사 상세 보기
        </Link>
      </div>
    </article>
  );
}

function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents(data);
        setError('');
      })
      .catch(() => setError('행사 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'))
      .finally(() => setIsLoading(false));
  }, []);

  const { activeToday, thisMonth, yearMonths } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const validEvents = events.filter((event) => {
      const start = parseFestivalDate(event.eventstartdate);
      const end = parseFestivalDate(event.eventenddate);
      return start && end;
    });

    const yearMonths = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      events: validEvents.filter((event) => {
        const start = parseFestivalDate(event.eventstartdate);
        return start.getFullYear() === today.getFullYear() && start.getMonth() === index;
      }),
    }));

    return {
      activeToday: validEvents.filter((event) => {
        const start = parseFestivalDate(event.eventstartdate);
        const end = parseFestivalDate(event.eventenddate);
        return start <= today && end >= today;
      }),
      thisMonth: validEvents.filter((event) => {
        const start = parseFestivalDate(event.eventstartdate);
        const end = parseFestivalDate(event.eventenddate);
        return start <= monthEnd && end >= today;
      }),
      yearMonths,
    };
  }, [events]);
  const currentYear = new Date().getFullYear();

  return (
    <section className="page board-page">
      <div className="page-title board-title">
        <div>
          <p className="eyebrow">Busan events</p>
          <h1>오늘의 행사</h1>
        </div>
        <Link className="ghost-button" to="/">
          홈으로 돌아가기
        </Link>
      </div>
      <p className="page-intro">
        지금 부산에서 즐길 수 있는 축제와 이번 달의 행사를 확인해 보세요.
      </p>

      {isLoading && <p className="status-text">행사 정보를 불러오는 중입니다.</p>}
      {error && <p className="status-text">{error}</p>}

      {!isLoading && !error && (
        <>
          <section className="event-section">
            <div className="section-heading">
              <p className="eyebrow">Happening now</p>
              <h2>오늘 진행 중인 행사</h2>
            </div>
            {activeToday.length ? (
              <div className="card-grid">
                {activeToday.map((event) => (
                  <EventCard key={event.contentid} event={event} />
                ))}
              </div>
            ) : (
              <p className="empty-state">
                오늘 진행 중인 행사가 없습니다. 이번 달 행사를 확인해 보세요.
              </p>
            )}
          </section>

          <section className="event-section">
            <div className="section-heading">
              <p className="eyebrow">This month</p>
              <h2>이번 달 행사</h2>
            </div>
            {thisMonth.length ? (
              <div className="card-grid">
                {thisMonth.map((event) => (
                  <EventCard key={event.contentid} event={event} />
                ))}
              </div>
            ) : (
              <p className="empty-state">이번 달에 예정된 행사가 없습니다.</p>
            )}
          </section>

          <section className="event-section yearly-events-section">
            <div className="section-heading">
              <p className="eyebrow">Year at a glance</p>
              <h2>{currentYear}년 행사 캘린더</h2>
            </div>
            <div className="year-calendar">
              {yearMonths.map(({ month, events: monthEvents }) => (
                <article className="month-card" key={month}>
                  <div className="month-card-heading">
                    <span>{String(month).padStart(2, '0')}</span>
                    <strong>{month}월</strong>
                  </div>
                  {monthEvents.length ? (
                    <ul>
                      {monthEvents.map((event) => (
                        <li key={event.contentid}>
                          <Link to={`/events/${event.contentid}`}>{event.title}</Link>
                          <small>{formatPeriod(event)}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>예정 행사 없음</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

export { formatPeriod };
export default EventList;
