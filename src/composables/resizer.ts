import { Ref, unref } from "vue";

const resizeDebounceInterval = 5;
let resizeTimeout: any = -1;
let resizer: ResizeObserver

export function watchResize(
  maybeRefTarget: HTMLElement | Ref<HTMLElement>,
  callback: Function
) {
  const target = unref(maybeRefTarget)
  resizer = new ResizeObserver(() => {
    clearTimeout(resizeTimeout)
    const t = Date.now()
    resizeTimeout = setTimeout(callback, resizeDebounceInterval)
  })
  resizer.observe(target)
}