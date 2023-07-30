import { ref } from "vue";
import { View } from "../renderer";

const selectedView = ref<View>('blockly')
const ViewList: View[] = ['blockly', 'code']
export function useView() {
  function setView(view: View) {
    console.log(`setView(${view})`)
    selectedView.value = view
    console.log(`selectedView.value: ${selectedView.value}`)
  }
  return {
    selectedView,
    ViewList,
    setView
  }
}