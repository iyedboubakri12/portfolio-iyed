import { useState } from 'react'
import { POSTS, formatDate, postPath, type Post } from '../blog/posts'
import { ArrowIcon } from '../components/Icons'

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card post-card">
      <p className="post-card__meta muted small">
        <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.minutes} min read
      </p>
      <h3><a href={postPath(post)}>{post.title}</a></h3>
      <p className="muted">{post.description}</p>
      <ul className="chips chips--small">{post.tags.map((t) => <li key={t}>{t}</li>)}</ul>
      <a className="link post-card__more" href={postPath(post)} aria-label={`Read: ${post.title}`}>Read article <ArrowIcon /></a>
    </article>
  )
}

export default function Blog() {
  const tags = [...new Set(POSTS.flatMap((p) => p.tags))].sort()
  const [tag, setTag] = useState<string | null>(null)
  const shown = tag ? POSTS.filter((p) => p.tags.includes(tag)) : POSTS

  return (
    <>
      <header className="pfe__hero">
        <div className="container">
          <p className="eyebrow">Blog</p>
          <h1>DevOps &amp; DevSecOps notes from the field</h1>
          <p className="pfe__lead">
            Practical write-ups on secure CI/CD, Kubernetes, Policy-as-Code, supply chain security and runtime detection.
            Every article comes from things I built and ran, including what I would do differently.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <div className="tag-filter" role="group" aria-label="Filter by topic">
            <button className={!tag ? 'is-active' : ''} aria-pressed={!tag} onClick={() => setTag(null)}>All ({POSTS.length})</button>
            {tags.map((t) => (
              <button key={t} className={tag === t ? 'is-active' : ''} aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>{t}</button>
            ))}
          </div>
          <div className="posts">
            {shown.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </div>
      </section>
    </>
  )
}
