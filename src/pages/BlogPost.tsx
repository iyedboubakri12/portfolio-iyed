import { PROFILE, PFE_PATH } from '../data'
import { BLOG_PATH, POSTS, formatDate, postPath, type Post } from '../blog/posts'
import { DownloadIcon, LinkedInIcon } from '../components/Icons'

export default function BlogPost({ post }: { post: Post | undefined }) {
  if (!post) {
    return (
      <section className="section">
        <div className="container prose">
          <h1>Article not found</h1>
          <p>This article does not exist or has moved.</p>
          <a className="btn" href={BLOG_PATH}>All articles</a>
        </div>
      </section>
    )
  }
  const i = POSTS.indexOf(post)
  const newer = POSTS[i - 1]
  const older = POSTS[i + 1]

  return (
    <article className="post">
      <header className="pfe__hero">
        <div className="container container--narrow">
          <a href={BLOG_PATH} className="link small">← All articles</a>
          <p className="eyebrow">{post.tags.join(' · ')}</p>
          <h1>{post.title}</h1>
          <p className="muted">
            By {PROFILE.name} · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.minutes} min read
          </p>
        </div>
      </header>

      <div className="container container--narrow">
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        <aside className="card author">
          <div className="nav__logo author__logo" aria-hidden="true">IB</div>
          <div>
            <strong>{PROFILE.name}</strong>
            <p className="muted small">
              Junior DevOps &amp; DevSecOps engineer (ESPRIT). I build secure CI/CD pipelines and Kubernetes platforms,
              and I am open to DevOps, DevSecOps and Cloud roles.
            </p>
            <div className="author__actions">
              <a className="btn btn--small" href={PFE_PATH}>See the project</a>
              <a className="btn btn--small btn--ghost" href={PROFILE.cv} download><DownloadIcon /> CV</a>
              <a className="btn btn--small btn--ghost" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /> LinkedIn</a>
            </div>
          </div>
        </aside>

        <nav className="post-nav" aria-label="More articles">
          {older ? <a className="card" href={postPath(older)}><span className="muted small">← Previous</span>{older.title}</a> : <span />}
          {newer ? <a className="card post-nav__next" href={postPath(newer)}><span className="muted small">Next →</span>{newer.title}</a> : <span />}
        </nav>
      </div>
    </article>
  )
}
