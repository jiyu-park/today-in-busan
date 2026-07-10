import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import SpotList from './pages/SpotList.jsx';
import SpotDetail from './pages/SpotDetail.jsx';
import EventList from './pages/EventList.jsx';
import EventDetail from './pages/EventDetail.jsx';

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <Link className="brand" to="/">
          Today in Busan
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/spots">Tour Spots</Link>
          <Link to="/events">Events</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spots" element={<SpotList />} />
          <Route path="/spots/:id" element={<SpotDetail />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
