 // client/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'tpo') return '/tpo-dashboard';
    if (user.role === 'company') return '/company-dashboard';
    return '/jobs';
  };

  return (
    <div style={styles.page}>
      {/* ===== HERO SECTION ===== */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>🎓 College Placement Portal</div>
          <h1 style={styles.heroTitle}>
            Launch Your Career With
            <span style={styles.highlight}> Smart Placement</span>
          </h1>
          <p style={styles.heroDesc}>
            The all-in-one platform connecting students with top companies. 
            AI-powered resume analysis, personalized interview prep, and intelligent job matching.
          </p>
          <div style={styles.heroButtons}>
            <Link to={getDashboardLink()} style={styles.btnPrimary}>
              {isAuthenticated ? 'Go to Dashboard →' : 'Get Started Free →'}
            </Link>
            {!isAuthenticated && (
              <Link to="/register" style={styles.btnSecondary}>
                Create Account
              </Link>
            )}
          </div>

          {/* Stats Row */}
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>500+</span>
              <span style={styles.statLabel}>Students Placed</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNumber}>50+</span>
              <span style={styles.statLabel}>Companies</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNumber}>200+</span>
              <span style={styles.statLabel}>Active Jobs</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNumber}>95%</span>
              <span style={styles.statLabel}>Success Rate</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div style={styles.heroVisual}>
          <div style={styles.visualCard('rgba(79,70,229,0.9)', 0)}>
            <div style={styles.visualIcon}>🎓</div>
            <div>
              <div style={styles.visualTitle}>Student Portal</div>
              <div style={styles.visualSub}>Apply · Analyze · Prepare</div>
            </div>
          </div>
          <div style={styles.visualCard('rgba(5,150,105,0.9)', 20)}>
            <div style={styles.visualIcon}>🏢</div>
            <div>
              <div style={styles.visualTitle}>Company Portal</div>
              <div style={styles.visualSub}>Post · Review · Hire</div>
            </div>
          </div>
          <div style={styles.visualCard('rgba(220,38,38,0.9)', -10)}>
            <div style={styles.visualIcon}>🛡️</div>
            <div>
              <div style={styles.visualTitle}>TPO Dashboard</div>
              <div style={styles.visualSub}>Manage · Monitor · Approve</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ROLE CARDS ===== */}
      {!isAuthenticated && (
        <section style={styles.rolesSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>GET STARTED</span>
            <h2 style={styles.sectionTitle}>Choose Your Path</h2>
            <p style={styles.sectionDesc}>Three powerful portals designed for each stakeholder</p>
          </div>

          <div style={styles.rolesGrid}>
            {/* Student Card */}
            <div style={styles.roleCard}>
              <div style={styles.roleHeader('#4f46e5')}>
                <span style={styles.roleEmoji}>🎓</span>
              </div>
              <div style={styles.roleBody}>
                <h3 style={styles.roleName}>Student</h3>
                <p style={styles.roleText}>
                  Browse jobs, apply with one click, get AI-powered resume feedback, 
                  and prepare for interviews with personalized questions.
                </p>
                <ul style={styles.featureList}>
                  <li style={styles.featureItem}>✅ Smart job matching</li>
                  <li style={styles.featureItem}>✅ AI resume analyzer</li>
                  <li style={styles.featureItem}>✅ Interview preparation</li>
                  <li style={styles.featureItem}>✅ Application tracking</li>
                </ul>
                <Link to="/register" style={{ ...styles.roleBtn, background: '#4f46e5' }}>
                  Join as Student →
                </Link>
              </div>
            </div>

            {/* Company Card */}
            <div style={styles.roleCard}>
              <div style={styles.roleHeader('#059669')}>
                <span style={styles.roleEmoji}>🏢</span>
              </div>
              <div style={styles.roleBody}>
                <h3 style={styles.roleName}>Company</h3>
                <p style={styles.roleText}>
                  Post job openings, review candidate applications, manage hiring pipeline, 
                  and connect with top college talent effortlessly.
                </p>
                <ul style={styles.featureList}>
                  <li style={styles.featureItem}>✅ Post unlimited jobs</li>
                  <li style={styles.featureItem}>✅ Review applications</li>
                  <li style={styles.featureItem}>✅ Candidate shortlisting</li>
                  <li style={styles.featureItem}>✅ Hiring analytics</li>
                </ul>
                <Link to="/register" style={{ ...styles.roleBtn, background: '#059669' }}>
                  Join as Company →
                </Link>
              </div>
            </div>

            {/* TPO Card */}
            <div style={styles.roleCard}>
              <div style={styles.roleHeader('#dc2626')}>
                <span style={styles.roleEmoji}>🛡️</span>
              </div>
              <div style={styles.roleBody}>
                <h3 style={styles.roleName}>TPO</h3>
                <p style={styles.roleText}>
                  Oversee the entire placement process, approve student and company registrations, 
                  monitor statistics, and ensure smooth operations.
                </p>
                <ul style={styles.featureList}>
                  <li style={styles.featureItem}>✅ Approval management</li>
                  <li style={styles.featureItem}>✅ Placement statistics</li>
                  <li style={styles.featureItem}>✅ User oversight</li>
                  <li style={styles.featureItem}>✅ Report generation</li>
                </ul>
                <Link to="/register" style={{ ...styles.roleBtn, background: '#dc2626' }}>
                  Join as TPO →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURES ===== */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>FEATURES</span>
          <h2 style={styles.sectionTitle}>Everything You Need</h2>
          <p style={styles.sectionDesc}>Powerful tools to streamline the placement process</p>
        </div>

        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap('#4f46e5')}>🤖</div>
            <h3 style={styles.featureTitle}>AI Resume Analyzer</h3>
            <p style={styles.featureText}>
              Upload your resume and get instant AI-powered feedback on skills, 
              formatting, and job match score.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap('#059669')}>🎯</div>
            <h3 style={styles.featureTitle}>Interview Prep</h3>
            <p style={styles.featureText}>
              Get AI-generated interview questions tailored to your target role 
              with difficulty levels and hints.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap('#dc2626')}>💼</div>
            <h3 style={styles.featureTitle}>Smart Job Matching</h3>
            <p style={styles.featureText}>
              Intelligent job recommendations based on your skills, CGPA, and 
              branch with match percentage.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap('#7c3aed')}>📊</div>
            <h3 style={styles.featureTitle}>Placement Tracking</h3>
            <p style={styles.featureText}>
              Track your applications in real-time, get notified on status updates, 
              and manage your pipeline.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap('#ea580c')}>🔔</div>
            <h3 style={styles.featureTitle}>Real-time Notifications</h3>
            <p style={styles.featureText}>
              Instant alerts for new job postings, application updates, and 
              approval status changes.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap('#0891b2')}>💬</div>
            <h3 style={styles.featureTitle}>AI Chat Assistant</h3>
            <p style={styles.featureText}>
              24/7 AI assistant for resume tips, career guidance, and technical 
              concept explanations.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Transform Your Placements?</h2>
        <p style={styles.ctaDesc}>
          Join thousands of students and companies already using Smart Placement
        </p>
        <Link to="/register" style={styles.ctaBtn}>Create Free Account →</Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <span style={{ fontSize: '24px' }}>🏫</span>
            <span style={styles.footerBrandText}>Smart Placement</span>
          </div>
          <p style={styles.footerText}>© 2026 Smart Placement. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    background: '#ffffff',
    minHeight: '100vh'
  },

  // ===== HERO =====
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    gap: '60px',
    flexWrap: 'wrap',
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: {
    flex: 1,
    minWidth: '320px',
    maxWidth: '640px',
    zIndex: 2
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.1)',
    color: '#a5b4fc',
    padding: '8px 20px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '28px',
    border: '1px solid rgba(255,255,255,0.15)'
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: '1.1',
    margin: '0 0 24px 0',
    letterSpacing: '-1px'
  },
  highlight: {
    background: 'linear-gradient(135deg, #e94560, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  heroDesc: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.8',
    margin: '0 0 36px 0',
    maxWidth: '520px'
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '48px'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #e94560, #dc2626)',
    color: '#ffffff',
    padding: '16px 36px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    display: 'inline-block',
    boxShadow: '0 10px 30px rgba(233,69,96,0.3)',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer'
  },
  btnSecondary: {
    background: 'transparent',
    color: '#ffffff',
    padding: '16px 36px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '700',
    display: 'inline-block',
    border: '2px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    padding: '24px 0',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff'
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: 'rgba(255,255,255,0.15)'
  },

  // Hero Visual
  heroVisual: {
    flex: 0.7,
    minWidth: '300px',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    zIndex: 2
  },
  visualCard: (bg, offset) => ({
    background: bg,
    padding: '24px 28px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transform: `translateX(${offset}px)`,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)'
  }),
  visualIcon: {
    fontSize: '36px',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '14px'
  },
  visualTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '2px'
  },
  visualSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px'
  },

  // ===== ROLES SECTION =====
  rolesSection: {
    padding: '100px 40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  sectionTag: {
    display: 'inline-block',
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '6px 18px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px 0'
  },
  sectionDesc: {
    fontSize: '18px',
    color: '#64748b',
    margin: 0
  },
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '28px'
  },
  roleCard: {
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column'
  },
  roleHeader: (color) => ({
    background: color,
    padding: '32px',
    textAlign: 'center'
  }),
  roleEmoji: {
    fontSize: '56px',
    display: 'block'
  },
  roleBody: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  roleName: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px 0'
  },
  roleText: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.7',
    margin: '0 0 20px 0'
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px 0',
    flex: 1
  },
  featureItem: {
    fontSize: '14px',
    color: '#475569',
    padding: '6px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  roleBtn: {
    display: 'block',
    textAlign: 'center',
    color: '#ffffff',
    padding: '14px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: 'auto'
  },

  // ===== FEATURES SECTION =====
  featuresSection: {
    background: '#f8fafc',
    padding: '100px 40px'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featureCard: {
    background: '#ffffff',
    padding: '36px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s'
  },
  featureIconWrap: (color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginBottom: '20px'
  }),
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0'
  },
  featureText: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.7',
    margin: 0
  },

  // ===== CTA =====
  ctaSection: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    padding: '100px 40px',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 16px 0'
  },
  ctaDesc: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 36px 0'
  },
  ctaBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #e94560, #dc2626)',
    color: '#ffffff',
    padding: '18px 48px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(233,69,96,0.3)'
  },

  // ===== FOOTER =====
  footer: {
    background: '#0f172a',
    padding: '40px',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  footerBrandText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#e94560'
  },
  footerText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    margin: 0
  }
};

export default Home;