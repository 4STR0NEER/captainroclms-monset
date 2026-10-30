import { Link, useParams } from 'react-router'
import { Loading, PageHeader, PlaceholderTag, formatDate } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { getPost, getPosts } from '../../services/site'
import NotFound from '../shared/NotFound'

const postDate = (p) =>
  p.dateApproximate ? `${new Date(p.date).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })} (date to confirm)` : formatDate(p.date)

export function NewsList() {
  const { data: posts, loading } = useAsync(getPosts)
  if (loading) return <Loading />

  return (
    <>
      <PageHeader title="News from the ship's log" />
      <ul className="mx-auto max-w-6xl divide-y divide-line border-y border-line px-4 mb-20">
        {posts.map((p) => (
          <li key={p.id} className="grid gap-2 py-8 md:grid-cols-[14rem_1fr] md:gap-8">
            <p className="text-deep-soft">{postDate(p)}</p>
            <div>
              <h2 className="text-2xl sm:text-3xl">
                <Link to={`/news/${p.slug}`} className="text-deep no-underline hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 max-w-prose text-lg text-deep-soft">{p.excerpt}</p>
              {p.placeholder && (
                <p className="mt-3">
                  <PlaceholderTag>Placeholder post</PlaceholderTag>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export function NewsPost() {
  const { slug } = useParams()
  const { data: post, loading } = useAsync(() => getPost(slug), [slug])
  if (loading) return <Loading />
  if (!post) return <NotFound />

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <Link to="/news" className="font-bold text-lagoon">
        All news
      </Link>
      <h1 className="mt-6 text-4xl sm:text-5xl">{post.title}</h1>
      <p className="mt-4 text-deep-soft">{postDate(post)}</p>
      {post.placeholder && (
        <p className="mt-3">
          <PlaceholderTag>Placeholder post</PlaceholderTag>
        </p>
      )}
      <div className="mt-8 space-y-5 text-lg">
        {post.body.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  )
}
