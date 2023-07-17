import { ref } from 'vue'
export function useBooleanState() {
  const state = ref<{
    eventString: string,
    sensorId: number,
    eventType: 'BUTTON' | 'DIAL',
  }>({
    eventString: '',
    sensorId: 0,
    eventType: 'BUTTON',
  })
  function toggle() {
  }
  return {
    state,
    toggle
  }
}
