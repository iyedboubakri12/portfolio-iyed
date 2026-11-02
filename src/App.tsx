import { useEffect, useState } from 'react'
import { PFE_PATH } from './data'
import { Nav, Footer } from './components/Layout'
import Home from './pages/Home'
import PfeProject from './pages/PfeProject'

function usePath() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (url.pathname.startsWith('/cv/')) return
      e.preventDefault()
      window.history.pushState({}, '', url.pathname + url.hash)
      setPath(url.pathname)
      if (url.hash) setTimeout(() => document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" }), 60)
      else window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPop)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', onPop)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return path.replace(/\/+$/, '') || '/'
}

export default function App() {
  const path = usePath()
  const isPfe = path === PFE_PATH

  useEffect(() => {
    document.title = isPfe
      ? 'DevSecOps Platform with AI Remediation – Iyed Boubakri'
      : 'Iyed Boubakri – Junior DevOps & DevSecOps Engineer | Kubernetes, GitLab CI/CD, Cloud'
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView()
  }, [isPfe])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav onProjectPage={isPfe} />
      <main id="main">{isPfe ? <PfeProject /> : <Home />}</main>
      <Footer />
    </>
  )
}
