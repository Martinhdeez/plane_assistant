import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <svg
            className="flight-bg"
            viewBox="0 0 2000 600"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none'}}
          >
            <defs>
              <path
                id="flightPath"
                d="M -100,450 C 300,100 800,500 1200,200 S 2100,450 2500,350"
                className="flight-path"
                fill="none"
              />
            </defs>
            <use
              href="#flightPath"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="4"
              strokeDasharray="2800"
              strokeDashoffset="2800"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="2800"
                to="0"
                dur="20s"
                begin="0s"
                calcMode="linear"
                fill="freeze"
                repeatCount="indefinite"
              />
            </use>
            <image
              href="/assets/plane.svg"
              width="80"
              height="80"
              transform="translate(10,-40)" 
            >
              <animateMotion
                dur="20s"
                begin="0s"
                fill="freeze"
                rotate="auto"
                repeatCount="indefinite"
              >
                <mpath href="#flightPath" />
              </animateMotion>
            </image>
          </svg>
          <div className="cloud cloud-1">☁️</div>
          <div className="cloud cloud-2">☁️</div>
          <div className="cloud cloud-3">☁️</div>
          <div className="cloud cloud-4">☁️</div>
          <div className="cloud cloud-5">☁️</div>
          <div className="cloud cloud-6">☁️</div>
          <div className="cloud cloud-7">☁️</div>
          <div className="cloud cloud-8">☁️</div>
          <div className="cloud cloud-9">☁️</div>
          <div className="cloud cloud-10">☁️</div>
          <div className="cloud cloud-11">☁️</div>
          <div className="cloud cloud-12">☁️</div>
        </div>
        <div className="container hero-content">
          <h1 className="hero-title fade-in-up">
            Plane Assistant
          </h1>
          <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.2s' }}>
            Tu asistente inteligente especializado en mantenimiento aeronáutico
          </p>
          <p className="hero-description fade-in-up" style={{ animationDelay: '0.4s' }}>
            Accede a información técnica precisa, procedimientos de seguridad y guías paso a paso
            para el mantenimiento de aeronaves con la ayuda de IA avanzada.
          </p>
          <div className="hero-buttons fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a href="/login" className="btn btn-primary">Comenzar Ahora</a>
            <a href="#features" className="btn btn-secondary">Conocer Más</a>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Características Principales</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✈️</div>
              <h3>Asistencia Especializada</h3>
              <p>
                IA entrenada específicamente en mantenimiento aeronáutico con conocimiento
                de normativas ICAO, EASA y FAA.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Procedimientos Técnicos</h3>
              <p>
                Acceso a guías paso a paso para inspecciones, reparaciones y troubleshooting
                de sistemas aeronáuticos.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Manuales Técnicos</h3>
              <p>
                Interpretación de documentación oficial (AMM, CMM, SRM) con explicaciones
                claras y precisas.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Seguridad Primero</h3>
              <p>
                Priorización de normativas de seguridad y recomendaciones basadas en
                procedimientos oficiales.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Conversaciones Contextuales</h3>
              <p>
                Mantén múltiples chats con historial completo para seguimiento de
                tareas complejas.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Respuestas Instantáneas</h3>
              <p>
                Obtén información técnica precisa en segundos, optimizando tu tiempo
                de trabajo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container cta-content">
          <h2>¿Listo para optimizar tu trabajo?</h2>
          <p>
            Únete a los profesionales que ya confían en Plane Assistant para sus
            operaciones de mantenimiento aeronáutico.
          </p>
          <a href="/register" className="btn btn-primary btn-large">
            Crear Cuenta Gratis
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Plane Assistant. Todos los derechos reservados.</p>
          <p className="footer-disclaimer">
            Este asistente proporciona información de referencia. Siempre consulte
            la documentación oficial del fabricante y siga los procedimientos aprobados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
