import { NavLink } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-title">CDR Report Analyzer</span>
          <span className="footer-copy">Built for desktop investigation and field-ready phone review.</span>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/user-guide">Guide</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="footer-meta">
          <a href="mailto:CDRReportAnalyzer@email.com" className="footer-email">
            CDRReportAnalyzer@email.com
          </a>
          <span className="footer-copy">Copyright &copy; {currentYear}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
