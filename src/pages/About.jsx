const keyFeatures = [
  {
    title: 'Automated Data Parsing',
    description:
      'Seamlessly import and parse large CSV or Excel files containing raw call data.',
  },
  {
    title: 'Geospatial Mapping',
    description:
      'Visualize tower locations and movement patterns of a target MSISDN on interactive maps.',
  },
  {
    title: 'Communication Profiling',
    description:
      'Identify top callers, interaction frequency, and call duration patterns between different parties.',
  },
  {
    title: 'IMEI & IMSI Tracking',
    description:
      'Track device and SIM card associations to monitor hardware changes over time.',
  },
  {
    title: 'Timeline Generation',
    description:
      'Create chronological sequences of events to reconstruct a person’s activities.',
  },
];

const projectPurpose = [
  {
    title: 'Reduce Manual Effort',
    description:
      'Automate the repetitive task of filtering and sorting thousands of call logs.',
  },
  {
    title: 'Uncover Hidden Networks',
    description:
      'Identify connections between different users and devices through relationship mapping.',
  },
  {
    title: 'Ensure Accuracy',
    description:
      'Minimize human error in data calculation and location plotting.',
  },
];

const technicalStack = [
  'Language: ReactJS (Primary analysis engine)',
  'Data Processing: Pandas, NumPy can be used for processing',
  'Visualization: In Future Folium (for maps), Matplotlib/Seaborn (for charts) are for better query logic',
  'Frontend: Responsive UI as for Desktop & Mobile',
];

function About() {
  return (
    <div className="content-page about-page">
      <div className="page-card about-card">
        <section className="about-hero">
          <span className="about-kicker">About</span>
          <h1 className="about-title">About CDR Report Analyzer</h1>
          <p className="about-intro">
            The CDR Report Analyzer is a specialized tool designed to process, analyze, and
            visualize Call Detail Records (CDRs) for digital forensics, telecommunication auditing,
            and investigative purposes. It simplifies the complex task of interpreting raw call
            logs by converting them into actionable insights and structured reports.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="about-grid">
            {keyFeatures.map((feature) => (
              <article className="about-item-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p className="mb-0">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Project Purpose</h2>
          <p>
            In modern investigations, CDRs serve as a digital breadcrumb trail. This tool was
            developed to help investigators, analysts, and security professionals:
          </p>
          <div className="about-grid">
            {projectPurpose.map((purpose) => (
              <article className="about-item-card" key={purpose.title}>
                <h3>{purpose.title}</h3>
                <p className="mb-0">{purpose.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Technical Stack</h2>
          <div className="about-note-card">
            <ul className="about-list mb-0">
              {technicalStack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="about-section">
          <h2>Open Source & Links</h2>
          <div className="about-link-panel">
            <p>
              This project is open-source and hosted on GitHub. We encourage contributions, bug
              reports, and feature requests from the community.
            </p>
            <p>
              <strong>GitHub Repository:</strong>{' '}
              <a
                href="https://github.com/hackghosst001/CDR-Report-Analyzer"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/hackghosst001/CDR-Report-Analyzer
              </a>
            </p>
            <p className="mb-0">
              <strong>License:</strong> [Till Not Gone for copyright]
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
