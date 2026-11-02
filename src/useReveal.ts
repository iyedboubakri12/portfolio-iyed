import { useEffect } from 'react'

// Fades .reveal elements in as they enter the viewport. Content stays visible
// when JS, IntersectionObserver or motion is unavailable, and a timeout makes
// sure nothing can stay hidden (e.g. after jumping to an anchor).
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'))
    const show = (el: Element) => el.classList.add('is-visible')
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(show)
      return
    }
    document.documentElement.classList.add('js-reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          show(e.target)
          io.unobserve(e.target)
        }
      }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el)
      else io.observe(el)
    })
    const fallback = window.setTimeout(() => els.forEach(show), 2500)
    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
