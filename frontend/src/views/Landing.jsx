import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Ico from '../components/Ico';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';
import useInnContact from '../hooks/useInnContact';

const fallback = {
  stats: { rooms: 0, bookings: 0, customers: 0, avg_rating: 4.8, completed_stays: 0 },
  room_types: [],
  featured_rooms: [],
};

const money = (n) => `PHP ${Number(n || 0).toLocaleString()}`;

function Stat({ label, value }) {
  return (
    <div className="jra-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function RoomCard({ room }) {
  return (
    <article className="jra-room">
      <div
        className="jra-room-media"
        style={{ background: room.image_url ? `url(${room.image_url}) center/cover` : room.gradient_css }}
      >
        {!room.image_url && <Ico name="bed" size={42} color="rgba(255,255,255,.72)" />}
        <span className="jra-room-tag">{room.room_id}</span>
      </div>
      <div className="jra-room-body">
        <h3>{room.name}</h3>
        <p>{room.room_type_name} - sleeps {room.capacity} - floor {room.floor}</p>
        <div className="jra-room-foot">
          <span className="jra-stars"><Ico name="star" size={14} color="#e8951c" /> {Number(room.rating || 0).toFixed(1)}</span>
          <span className="jra-room-rate"><strong>{money(room.price)}</strong><small>/night</small></span>
        </div>
      </div>
    </article>
  );
}

function AuthModal({ mode, onClose, onMode }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';

  const update = (key, value) => setForm((cur) => ({ ...cur, [key]: value }));
  const goRole = (role) => {
    if (role === 'owner') navigate('/owner/dashboard');
    else if (role === 'admin') navigate('/admin/bookings');
    else navigate('/customer/explore');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = isRegister ? await register(form) : await login(form.username, form.password);
      onClose();
      goRole(role);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.detail || data?.username?.[0] || data?.email?.[0] || data?.password?.[0] || data?.non_field_errors?.[0];
      setError(msg || 'Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jra-modal-wrap" role="dialog" aria-modal="true">
      <button className="jra-modal-backdrop" onClick={onClose} aria-label="Close modal" />
      <div className="jra-modal">
        <button className="jra-modal-x" onClick={onClose} aria-label="Close">
          <Ico name="x" size={18} />
        </button>
        <div className="jra-modal-head">
          <span className="jra-eyebrow">{isRegister ? 'Guest account' : 'Welcome back'}</span>
          <h2>{isRegister ? 'Create an account' : 'Sign in'}</h2>
          <p>{isRegister ? 'Register as a customer to reserve rooms directly.' : "Access your Traveller's Inn account."}</p>
        </div>

        {error && <div className="jra-auth-error"><Ico name="x" size={15} /> {error}</div>}

        <form className="jra-auth-form" onSubmit={submit}>
          {isRegister && (
            <div className="jra-auth-row">
              <label>
                <span>First name</span>
                <input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required />
              </label>
              <label>
                <span>Last name</span>
                <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required />
              </label>
            </div>
          )}
          <label>
            <span>{isRegister ? 'Username' : 'Username or email'}</span>
            <input value={form.username} onChange={(e) => update('username', e.target.value)} required autoFocus />
          </label>
          {isRegister && (
            <>
              <label>
                <span>Email</span>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </label>
              <label>
                <span>Phone</span>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+63 9xx xxx xxxx" />
              </label>
            </>
          )}
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          </label>
          {isRegister && (
            <label>
              <span>Confirm password</span>
              <input type="password" value={form.password2} onChange={(e) => update('password2', e.target.value)} required />
            </label>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="jra-auth-switch">
          {isRegister ? 'Already have an account?' : 'New guest?'}
          <button onClick={() => onMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(null);
  const innContact = useInnContact();

  useEffect(() => {
    api.get('/landing/')
      .then((res) => setData(res.data))
      .catch(() => setData(fallback))
      .finally(() => setLoading(false));
  }, []);

  const cheapest = useMemo(() => {
    const prices = (data.room_types || []).map((rt) => rt.base_price).filter(Boolean);
    return prices.length ? Math.min(...prices) : 0;
  }, [data.room_types]);

  return (
    <main className="jra-site" id="top">
      <section className="jra-hero">
        <nav className="jra-nav">
          <Link to="/" className="jra-brand">
            <BrandMark className="jra-brand-mark" size={50} radius={14} iconSize={26} shadow={false} />
            <span className="jra-brand-name"><b>JRA Travellers' Inn</b><small>By the bay</small></span>
          </Link>
          <div className="jra-nav-links">
            <a href="#rooms">Rooms</a>
            <a href="#stay">Stay</a>
            <button className="jra-link-btn" onClick={() => setAuthMode('register')}>Register</button>
            <button className="jra-link-btn jra-nav-signin" onClick={() => setAuthMode('login')}>Sign in</button>
          </div>
        </nav>

        <div className="jra-hero-inner">
          <div className="jra-hero-copy">
            <div className="jra-rating-pill">
              <Ico name="star" size={15} color="#e8951c" />
              <b>{data.stats.avg_rating}</b>
              <span className="jra-dot" />
              <span>{data.stats.customers.toLocaleString()} guests</span>
            </div>
            <h1>Your stay <em>by the bay</em></h1>
            <p>
              Book direct at JRA Travellers' Inn with live room availability, transparent nightly rates,
              and a warm hillside welcome over the water. No agencies, no markups.
            </p>
            <p className="jra-tagline">Comfortable stays. Memorable journeys.</p>
            <div className="jra-actions">
              <button className="jra-btn jra-btn-primary" onClick={() => setAuthMode('register')}>
                Register to book <Ico name="arrowR" size={17} color="#fff" sw={2.2} />
              </button>
              <button className="jra-btn jra-btn-ghost" onClick={() => setAuthMode('login')}>Sign in</button>
            </div>
          </div>

          <div className="jra-hero-media">
            <div className="jra-hero-photo" />
            <div className="jra-hero-float">
              <span className="jra-hero-float-ic"><Ico name="shield" size={20} /></span>
              <span><b>Book direct</b><small>Live rates from existing rooms</small></span>
            </div>
          </div>
        </div>
      </section>

      <div className="jra-stats">
        <Stat label="active rooms" value={loading ? '...' : data.stats.rooms} />
        <Stat label="booking records" value={loading ? '...' : data.stats.bookings.toLocaleString()} />
        <Stat label="customers" value={loading ? '...' : data.stats.customers.toLocaleString()} />
        <Stat label="rates from" value={loading ? '...' : money(cheapest)} />
      </div>

      <section id="rooms" className="jra-section">
        <div className="jra-head">
          <div>
            <span className="jra-eyebrow">Where you'll stay</span>
            <h2>Featured rooms, ready to book</h2>
          </div>
          <p>{data.stats.completed_stays.toLocaleString()} completed stays power our live pricing and availability.</p>
        </div>
        <div className="jra-rooms">
          {(data.featured_rooms || []).map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      </section>

      <section id="stay" className="jra-section jra-types">
        <div className="jra-head">
          <div>
            <span className="jra-eyebrow">Room types</span>
            <h2>Find the room that fits your trip</h2>
          </div>
        </div>
        <div className="jra-type-grid">
          {(data.room_types || []).map((rt) => (
            <div className="jra-type" key={rt.name}>
              <Ico name="bed" size={21} />
              <h3>{rt.name}</h3>
              <p>{rt.count} active rooms - sleeps {rt.capacity}</p>
              <strong>{money(rt.base_price)} base rate</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="jra-cta">
        <div>
          <span className="jra-eyebrow">Direct booking</span>
          <h2>Ready for a stay by the bay?</h2>
          <p>Register as a guest to reserve available rooms and keep every trip in one account.</p>
        </div>
        <button className="jra-btn jra-btn-primary" onClick={() => setAuthMode('register')}>Create guest account</button>
      </section>

      <footer className="jra-footer">
        <div className="jra-footer-grid">
          <div className="jra-footer-brand">
            <Link to="/" className="jra-footer-logo jra-brand">
              <BrandMark className="jra-brand-mark" size={44} radius={12} iconSize={24} shadow={false} />
              <span className="jra-brand-name"><b>JRA Travellers' Inn</b><small>By the bay</small></span>
            </Link>
            <p>A family-run inn by the bay. {data.stats.rooms} rooms, warm welcome, booked direct with live availability.</p>
            <div className="jra-footer-contact">
              <span><Ico name="phone" size={14} /> {innContact.phone}</span>
              <span><Ico name="mail" size={14} /> {innContact.email}</span>
            </div>
          </div>
          <div className="jra-footer-col">
            <span>Explore</span>
            <a href="#rooms">Rooms & suites</a>
            <a href="#stay">Room types</a>
            <button onClick={() => setAuthMode('register')}>Availability</button>
            <button onClick={() => setAuthMode('login')}>Guest access</button>
          </div>
          <div className="jra-footer-col">
            <span>Booking</span>
            <button onClick={() => setAuthMode('register')}>Book direct</button>
            <button onClick={() => setAuthMode('login')}>Manage a booking</button>
            <a href="#rooms">Nightly rates</a>
            <a href="#stay">Group stays</a>
          </div>
          <div className="jra-footer-col">
            <span>Inn</span>
            <a href="#top">Our story</a>
            <button onClick={() => setAuthMode('login')}>Owner portal</button>
            <button onClick={() => setAuthMode('login')}>Admin portal</button>
            <a href={`mailto:${innContact.email}`}>Contact</a>
          </div>
        </div>
        <div className="jra-footer-bottom">
          <span>© 2026 JRA Travellers' Inn - 12 Seaside Avenue</span>
          <div>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Accessibility</a>
          </div>
        </div>
      </footer>

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onMode={setAuthMode} />}
    </main>
  );
}
