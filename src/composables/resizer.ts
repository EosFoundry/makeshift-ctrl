import { Ref, unref } from "vue";

const resizeDebounceInterval = 50;
let resizeTimeout: any = -1;
let resizer: ResizeObserver

export function watchResize(
  maybeRefTarget: HTMLElement | Ref<HTMLElement>,
  callback: Function
) {
  const target = unref(maybeRefTarget)
  resizer = new ResizeObserver(() => {
    callback()
    // if (resizeTimeout !== -1) { clearTimeout(resizeTimeout) }
    // resizeTimeout = setTimeout(callback, resizeDebounceInterval)
  })
  resizer.observe(target)
}