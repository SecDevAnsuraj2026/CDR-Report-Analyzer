const contacts = [
  {
    name: 'Ansu Raj',
    role: 'Cyber Security',
    email: 'ansuraj1998rks@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ansuraj2026/',
    github: 'https://github.com/hackghosst001',
  },
  {
    name: 'Shruti Dubey',
    role: '',
    email: 'shrutidubey1811@gmail.com',
    linkedin: 'https://www.linkedin.com/in/shruti-dubey-a34368293',
    github: 'https://github.com/shruti750',
  },
  {
    name: 'Komal Lokhande',
    role: '',
    email: 'lokhandekomal116@gmail.com',
    linkedin: 'https://www.linkedin.com/in/shruti-dubey-a34368293',
    github: 'https://github.com/shruti750',
  },
];

function Contact() {
  return (
    <div className="content-page contact-info-page">
      <div className="page-card contact-info-card">
        <section className="contact-hero">
          <span className="contact-kicker">Contact</span>
          <h1 className="contact-title">Contact Details</h1>
          <p className="contact-intro">
            For queries, feedback, or collaboration, please use the contact details below.
          </p>
        </section>

        <section className="contact-section">
          <h2>Team Contacts</h2>
          <div className="contact-grid">
            {contacts.map((contact) => (
              <article className="contact-person-card" key={contact.name}>
                <h3>{contact.name}</h3>
                {contact.role && <p className="contact-role">{contact.role}</p>}

                <div className="contact-link-list">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </p>
                  <p>
                    <strong>LinkedIn:</strong>{' '}
                    <a href={contact.linkedin} target="_blank" rel="noreferrer">
                      {contact.linkedin}
                    </a>
                  </p>
                  <p className="mb-0">
                    <strong>GitHub:</strong>{' '}
                    <a href={contact.github} target="_blank" rel="noreferrer">
                      {contact.github}
                    </a>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section">
          <h2>Guided By</h2>
          <div className="contact-guide-card">
            <h3>Atul Shrivastava</h3>
            <p className="contact-role">State Cyber Cell, M.P. Police, Bhopal</p>
            <p>
              <strong>Location:</strong> 69GQ+X6M, Depot Chouraha, Police Radio Colony, Bhabhada
              Road, Bhopal, Madhya Pradesh 462003
            </p>
            <p className="mb-0">
              Focused on developing real-world solutions in Cybersecurity, Data Analysis, and
              Digital Investigation Systems.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
