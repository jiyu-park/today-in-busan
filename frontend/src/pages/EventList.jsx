import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { fetchEvents } from '../services/tourApi.js';

function parseFestivalDate(value) {
  if (!/^\d{8}$/.test(value || '')) return null;
  return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`);
}

function formatPeriod(event, language = 'ko') {
  const start = parseFestivalDate(event.eventstartdate);
  const end = parseFestivalDate(event.eventenddate);
  if (!start || !end) return language === 'en' ? 'Dates unavailable' : '기간 정보 확인 필요';
  const format = (date) => new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ko-KR', { month: 'long', day: 'numeric' }).format(date);
  return `${format(start)} - ${format(end)}`;
}

function EventCard({ event, language, copy }) {
  const image = event.firstimage || event.firstimage2;
  const place = event.addr1 || copy.common.eventPlaceMissing;
  return (
    <article className="event-card">
      {image ? <img src={image} alt={event.title} /> : <div className="image-placeholder">Busan Event</div>}
      <div>
        <p className="category">Busan festival</p>
        <h2>{event.title}</h2>
        <p className="event-meta">📍 {place}</p>
        <p className="event-meta">🗓 {formatPeriod(event, language)}</p>
        <Link className="event-detail-link" to={`/events/${event.contentid}`}>{copy.events.detail} →</Link>
      </div>
    </article>
  );
}

function EventList() {
  const { language, copy } = useLanguage();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents().then(setEvents).catch(() => setError(copy.events.error)).finally(() => setIsLoading(false));
  }, [copy.events.error]);

  const { activeToday, thisMonth, yearMonths, currentYear } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const validEvents = events.filter((event) => parseFestivalDate(event.eventstartdate) && parseFestivalDate(event.eventenddate));
    return {
      currentYear: today.getFullYear(),
      activeToday: validEvents.filter((event) => parseFestivalDate(event.eventstartdate) <= today && parseFestivalDate(event.eventenddate) >= today),
      thisMonth: validEvents.filter((event) => parseFestivalDate(event.eventstartdate) <= monthEnd && parseFestivalDate(event.eventenddate) >= today),
      yearMonths: Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        events: validEvents.filter((event) => {
          const start = parseFestivalDate(event.eventstartdate);
          return start.getFullYear() === today.getFullYear() && start.getMonth() === index;
        }),
      })),
    };
  }, [events]);

  return (
    <section className="page board-page">
      <div className="page-title board-title"><div><p className="eyebrow">{copy.events.eyebrow}</p><h1>{copy.events.title}</h1></div><Link className="ghost-button" to="/">{copy.events.back}</Link></div>
      <p className="page-intro">{copy.events.intro}</p>
      {isLoading && <p className="status-text">{copy.events.loading}</p>}
      {error && <p className="status-text">{error}</p>}
      {!isLoading && !error && <>
        <section className="event-section"><div className="section-heading"><p className="eyebrow">Happening now</p><h2>{copy.events.active}</h2></div>{activeToday.length ? <div className="card-grid">{activeToday.map((event) => <EventCard key={event.contentid} event={event} language={language} copy={copy} />)}</div> : <p className="empty-state">{copy.events.noneToday}</p>}</section>
        <section className="event-section"><div className="section-heading"><p className="eyebrow">This month</p><h2>{copy.events.month}</h2></div>{thisMonth.length ? <div className="card-grid">{thisMonth.map((event) => <EventCard key={event.contentid} event={event} language={language} copy={copy} />)}</div> : <p className="empty-state">{copy.events.noneMonth}</p>}</section>
        <section className="event-section yearly-events-section"><div className="section-heading"><p className="eyebrow">Year at a glance</p><h2>{currentYear} {copy.events.year}</h2></div><div className="year-calendar">{yearMonths.map(({ month, events: monthEvents }) => <article className="month-card" key={month}><div className="month-card-heading"><span>{String(month).padStart(2, '0')}</span><strong>{month}{language === 'en' ? '' : '월'}</strong></div>{monthEvents.length ? <ul>{monthEvents.map((event) => <li key={event.contentid}><Link to={`/events/${event.contentid}`}>{event.title}</Link><small>{formatPeriod(event, language)}</small></li>)}</ul> : <p>{copy.events.noneYear}</p>}</article>)}</div></section>
      </>}
    </section>
  );
}

export { formatPeriod };
export default EventList;
