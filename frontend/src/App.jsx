import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useLanguage } from './LanguageContext.jsx';
import Home from './pages/Home.jsx';
import SpotList from './pages/SpotList.jsx';
import SpotDetail from './pages/SpotDetail.jsx';
import EventList from './pages/EventList.jsx';
import EventDetail from './pages/EventDetail.jsx';
import StoryList from './pages/StoryList.jsx';
import MapView from './pages/MapView.jsx';

function App() {
  const { language, setLanguage, copy } = useLanguage();
  const labels = copy.nav;

  const navClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <div className="app">
      <header className="site-header">
        <Link className="brand" to="/">
          Today in Busan
        </Link>
        <div className="header-actions">
          <nav className="primary-nav" aria-label={language === 'en' ? 'Main navigation' : '주요 메뉴'}>
            <NavLink to="/" className={navClass} end>{labels.home}</NavLink>
            <NavLink to="/events" className={navClass}>{labels.events}</NavLink>
            <NavLink to="/spots" className={navClass}>{labels.spots}</NavLink>
            <NavLink to="/stories" className={navClass}>{labels.stories}</NavLink>
            <NavLink to="/map" className={navClass}>{labels.map}</NavLink>
          </nav>
          <label className="language-picker">
            <span className="sr-only">{labels.language}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={labels.language}>
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spots" element={<SpotList />} />
          <Route path="/spots/:id" element={<SpotDetail />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/stories" element={<StoryList />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
