import { ref } from 'vue'

export function useBooleanState() {
  const state = ref(false)
  function toggle() {
    if (state.value) {
      state.value = false
    } else {
      state.value = true
    }
  }
  return {
    state,
    toggle
  }
}
