import './App.css'

function App() {
  const projects = [
    {
      name: 'DevSecOps Microservices',
      description: 'A comprehensive PFE project for DevSecOps practices in microservices architecture',
      url: 'https://github.com/iyedboubakri12/-pfe-devsecops-microservices',
      language: 'Java',
      topics: ['DevSecOps', 'Microservices', 'Security']
    },
    {
      name: 'Sport App - Frontend',
      description: 'Modern frontend for sports tracking and management application',
      url: 'https://github.com/iyedboubakri12/frontSport',
      language: 'React/TypeScript',
      topics: ['React', 'Frontend', 'Sports']
    },
    {
      name: 'Sport App - Backend',
      description: 'Backend API for sports tracking and management system',
      url: 'https://github.com/iyedboubakri12/backendsport',
      language: 'Java',
      topics: ['Java', 'Backend', 'REST API']
    },
    {
      name: 'Tricount Exam App',
      description: 'A Flutter application for exam and expense tracking',
      url: 'https://github.com/iyedboubakri12/tricount-examApp',
      language: 'Dart',
      topics: ['Flutter', 'Exam', 'Tracker']
    },
    {
      name: 'Azure AKS Kubernetes Masterclass',
      description: 'Kubernetes and Azure AKS deployment and management guide',
      url: 'https://github.com/iyedboubakri12/azure-aks-kubernetes-masterclass',
      language: 'HCL',
      topics: ['Kubernetes', 'Azure', 'DevOps']
    },
    {
      name: 'EasyBuggy Vulnerable Application',
      description: 'A security practice application with intentional vulnerabilities for learning',
      url: 'https://github.com/iyedboubakri12/easybuggy-vulnerable-application',
      language: 'Java',
      topics: ['Security', 'Vulnerabilities', 'Learning']
    }
  ]

  const skills = [
    'Web Development',
    'Mobile Development',
    'DevSecOps',
    'Kubernetes',
    'Cloud Architecture',
    'Java',
    'TypeScript/React',
    'Flutter/Dart',
    'Security'
  ]

  return (
    <>
      <header className="header">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo-text">Iyed Boubakri</h1>
            <ul className="nav-menu">
              <li><a href="#about">About</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="https://github.com/iyedboubakri12" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to My Portfolio</h1>
          <p>Software Engineering Student | Web Developer | DevSecOps Enthusiast</p>
          <p className="subtitle">ESPRIT, Tunisia</p>
          <div className="hero-buttons">
            <a href="https://github.com/iyedboubakri12" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              View GitHub Profile
            </a>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="container">
          <h2>About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I am a final-year Software Engineering student at <strong>ESPRIT</strong> in Tunisia, with a strong passion for web development and software engineering. Throughout my academic journey, I have developed a solid foundation in various programming languages and technologies.
              </p>
              <p>
                My interests span across <strong>web development</strong>, <strong>mobile applications</strong>, <strong>cloud architecture</strong>, and <strong>DevSecOps practices</strong>. I am particularly fascinated by building secure, scalable systems and learning about modern development practices.
              </p>
              <p>
                I am motivated to apply my technical skills in a <strong>professional international environment</strong> and to continuously learn through real-world projects. I seek opportunities to collaborate with experienced teams and contribute to innovative solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="skills" id="skills">
        <div className="container">
          <h2>Skills & Expertise</h2>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <span className="skill-name">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="container">
          <h2>Featured Projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <h3>{project.name}</h3>
                <p className="description">{project.description}</p>
                <div className="tags">
                  {project.topics.map((topic, i) => (
                    <span key={i} className="tag">{topic}</span>
                  ))}
                </div>
                <p className="language">
                  <strong>Language:</strong> {project.language}
                </p>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  View Project →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Iyed Boubakri. All rights reserved.</p>
          <p className="footer-subtitle">Final-Year Software Engineering Student at ESPRIT, Tunisia</p>
          <div className="social-links">
            <a href="https://github.com/iyedboubakri12" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
