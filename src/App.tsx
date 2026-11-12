import { useEffect, useState } from 'react'
import { PFE_PATH } from './data'
import { BLOG_PATH, POSTS } from './blog/posts'
import { Nav, Footer } from './components/Layout'
import Home from './pages/Home'
import PfeProject from './pages/PfeProject'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Recruiter from './pages/Recruiter'
import Assistant from './components/assistant/Assistant'
import { RECRUITER_PATH } from './ai/knowledge'

const HOME_TITLE = 'Iyed Boubakri – Junior DevOps & DevSecOps Engineer | Kubernetes, GitLab CI/CD, Cloud'

function usePath() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (url.pathname.startsWith('/cv/') || /\.[a-z0-9]+$/i.test(url.pathname)) return
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

function setMeta(title: string, description?: string) {
  document.title = title
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
}

export default function App() {
  const path = usePath()
  const isPfe = path === PFE_PATH
  const isBlog = path === BLOG_PATH
  const isRecruiter = path === RECRUITER_PATH
  const postSlug = path.startsWith(BLOG_PATH + '/') ? path.slice(BLOG_PATH.length + 1) : null
  const post = postSlug ? POSTS.find((p) => p.slug === postSlug) : undefined

  useEffect(() => {
    if (post) setMeta(`${post.title} – Iyed Boubakri`, post.description)
    else if (postSlug) setMeta('Article not found – Iyed Boubakri')
    else if (isBlog) setMeta('Blog – DevOps & DevSecOps articles by Iyed Boubakri', 'Practical articles on secure CI/CD, Kubernetes, Policy-as-Code, supply chain security and runtime detection.')
    else if (isPfe) setMeta('DevSecOps Platform with AI Remediation – Iyed Boubakri')
    else if (isRecruiter) setMeta('Recruiter mode – Iyed Boubakri, Junior DevOps & DevSecOps Engineer', 'Evaluate Iyed Boubakri with evidence: skill evidence levels, project explorer, interactive DevSecOps architecture, job-description match and technical interview questions.')
    else setMeta(HOME_TITLE)
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView()
  }, [isPfe, isBlog, isRecruiter, post, postSlug])

  let page
  if (postSlug) page = <BlogPost post={post} />
  else if (isBlog) page = <Blog />
  else if (isPfe) page = <PfeProject />
  else if (isRecruiter) page = <Recruiter />
  else page = <Home />

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav onSubPage={path !== '/'} />
      <main id="main">{page}</main>
      <Footer />
      <Assistant />
    </>
  )
}
