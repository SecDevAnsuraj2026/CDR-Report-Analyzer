import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Home', end: true },
    { to: '/user-guide', label: 'User Guide' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo">
          <NavLink to="/" className="logo-link">
            <h1>CDR Report Analyzer</h1>
          </NavLink>
          <p className="header-tagline">Responsive telecom analysis workspace</p>
        </div>

        <button
          type="button"
          className="header-menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header-nav ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
