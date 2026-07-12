import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';
import { fetchSpotDetail, fetchSpotImages } from '../services/tourApi.js';

function SpotDetail() {
  const { id } = useParams();
  const { copy } = useLanguage();
  const [spot, setSpot] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { Promise.all([fetchSpotDetail(id), fetchSpotImages(id).catch(() => [])]).then(([detail, imageList]) => { setSpot(detail); setImages(imageList); }).catch(() => setSpot(null)).finally(() => setIsLoading(false)); }, [id]);
  if (isLoading) return <section className="page"><p className="status-text">{copy.spots.loading}</p></section>;
  if (!spot) return <section className="page"><h1>{copy.detail.missing}</h1><Link className="button" to="/spots">{copy.detail.back}</Link></section>;
  const image = spot.image || images.find((item) => item.originImageUrl)?.originImageUrl || images.find((item) => item.smallImageUrl)?.smallImageUrl;
  const latitude = Number(spot.mapy); const longitude = Number(spot.mapx); const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapBounds = hasCoordinates ? `${longitude - 0.01},${latitude - 0.008},${longitude + 0.01},${latitude + 0.008}` : '';
  const mapSrc = hasCoordinates ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${latitude},${longitude}` : '';
  const mapLink = hasCoordinates ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude},${longitude}` : '';
  const description = spot.historyStory || spot.shortDescription || spot.address || copy.common.noInfo;
  return <section className="detail-page"><article className="detail-content">
    <Link className="back-link" to="/spots">← {copy.detail.back}</Link>
    {image ? <img className="detail-image" src={image} alt={spot.title} /> : <div className="detail-image image-placeholder">Busan</div>}
    <p className="category">{spot.area || copy.common.busan}</p><h1>{spot.title}</h1><p className="detail-summary">{spot.address || copy.common.noInfo}</p>
    <section className="detail-section"><h2>{copy.detail.placeStory}</h2><p>{description}</p></section>
    <dl className="info-list"><div><dt>{copy.detail.address}</dt><dd>{spot.address || copy.common.noInfo}</dd></div><div><dt>{copy.detail.coordinates}</dt><dd>{spot.mapy || '-'}, {spot.mapx || '-'}</dd></div></dl>
    <section className="story-section"><h2>{copy.detail.memo}</h2><p>{description}</p></section>
    <section className="source-section"><h2>{copy.detail.source}</h2><p>{copy.detail.sourceBody}</p></section>
  </article><aside className="map-panel" aria-label={`${spot.title} ${copy.detail.location}`}><div className="map-panel-header"><div><p className="eyebrow">{copy.detail.location}</p><h2>{spot.title}</h2></div>{mapLink && <a className="map-open-link" href={mapLink} target="_blank" rel="noreferrer">{copy.detail.openMap}</a>}</div>{hasCoordinates ? <iframe className="map-frame" title={`${spot.title} map`} src={mapSrc} loading="lazy" /> : <div className="map-empty"><p>{copy.detail.noCoordinates}</p></div>}</aside></section>;
}
export default SpotDetail;
