import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { fetchEventDetail } from '../services/tourApi.js';
import { formatPeriod } from './EventList.jsx';

function EventDetail() {
  const { id } = useParams();
  const { language, copy } = useLanguage();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { fetchEventDetail(id).then(setEvent).catch(() => setEvent(null)).finally(() => setIsLoading(false)); }, [id]);
  if (isLoading) return <section className="page"><p className="status-text">{copy.common.eventLoading}</p></section>;
  if (!event) return <section className="page"><h1>{copy.common.eventMissing}</h1><Link className="button" to="/events">{copy.common.eventBack}</Link></section>;
  const image = event.firstimage || event.firstimage2;
  const place = event.addr1 || copy.common.eventPlaceMissing;
  return <section className="page event-detail-page">
    <Link className="back-link" to="/events">← {copy.common.eventBack}</Link>
    {image ? <img className="event-detail-image" src={image} alt={event.title} /> : <div className="event-detail-image image-placeholder">Busan Event</div>}
    <p className="category">Busan festival</p><h1>{event.title}</h1><p className="detail-summary">{copy.common.eventIntro}</p>
    <dl className="info-list event-info-list"><div><dt>{copy.common.eventPeriod}</dt><dd>{formatPeriod(event, language)}</dd></div><div><dt>{copy.common.eventPlace}</dt><dd>{place}</dd></div><div><dt>{copy.common.contact}</dt><dd>{event.tel || copy.common.noInfo}</dd></div></dl>
  </section>;
}
export default EventDetail;
