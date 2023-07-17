import { nanoid } from "../utilities/nanoidTool"
import { Ref, inject, onMounted, onUnmounted, ref } from "vue"

const popupEvents = {
  show: 'show-popup',
  hide: 'hide-popup',
  okay: 'return-okay',
  cancel: 'return-cancel'
}

export interface PopupOptions {
  message: string,
  onOkay?: () => void,
}

export interface ConfirmPopupOptions {
  message: string,
  onOkay: (val: boolean) => void,
  onCancel: (val: boolean) => void,
}

export interface PromptPopupOptions {
  message: string,
  inputLabels: string[],
  onOkay: (val: string[]) => void,
  onCancel: (val: string[]) => void,
}

export class SimplePopup {
  readonly id: string
  readonly hasInput: boolean = false
  readonly hasCancel: boolean = false
  readonly inputLabels: string[] = []
  readonly inputValues: string[] = []
  message: string
  private simpleOkay: () => void

  constructor(opts: PopupOptions) {
    console.log(`creating popup with opts: ${JSON.stringify(opts)}`)

    this.message = opts.message
    this.id = nanoid()
    if (opts.onOkay) {
      this.simpleOkay = opts.onOkay
    } else {
      this.simpleOkay = () => { }
    }
  }
  okay(): void { this.simpleOkay() }
  cancel(): void { }
}

export class ConfirmPopup extends SimplePopup {

  readonly hasInput: boolean = false
  readonly hasCancel: boolean = true
  readonly inputLabels: string[] = []
  readonly inputValues: string[] = []

  private confirmOkay: (val: boolean) => void
  private confirmCancel: (val: boolean) => void

  constructor(opts: ConfirmPopupOptions) {
    super({
      message: opts.message,
    })
    this.message = opts.message
    this.confirmOkay = opts.onOkay
    this.confirmCancel = opts.onCancel
  }
  okay(): void {
    this.confirmOkay(true)
  }
  cancel(): void {
    this.confirmCancel(false)
  }
}

export class PromptPopup extends SimplePopup {
  readonly hasInput: boolean = true
  readonly hasCancel: boolean = true
  readonly inputLabels: string[]

  inputValues: string[] = []

  private promptOkay: (val: string[]) => void
  private promptCancel: (val: string[]) => void

  constructor(opts: PromptPopupOptions) {
    super({
      message: opts.message,
    })
    this.inputLabels = opts.inputLabels
    this.inputLabels.forEach(() => {this.inputValues.push('')})
    this.promptOkay = opts.onOkay
    this.promptCancel = opts.onCancel
    console.log(this)
  }
  okay(): void {
    this.promptOkay(this.inputValues)
  }
  cancel(): void {
    this.promptCancel(this.inputValues)
  }
}


export function usePopup() {
  const dialogs = inject('popups') as Ref<SimplePopup[]>

  const showPrompt = (opts: {
    message: string,
    inputLabels?: boolean | string | string[],
    onOkay?: (val: string[]) => void,
    onCancel?: (val: string[]) => void,
  }) => {
    if (typeof dialogs === 'undefined') { return }

    let input = ['']
    let okayCb = opts.onOkay ?? ((val: any) => { })
    let cancelCb = opts.onCancel ?? ((val: any) => { })

    console.log(`showing prompt ${opts.message}`)

    if (typeof opts.inputLabels === 'string') {
      input = [opts.inputLabels]
    } else if (Array.isArray(opts.inputLabels)) {
      input = opts.inputLabels
    }

    dialogs.value.push(new PromptPopup({
      message: opts.message,
      inputLabels: input,
      onOkay: okayCb,
      onCancel: cancelCb
    }))
  }

  const showConfirm = (opts: {
    message: string,
    onOkay?: (val: boolean) => void,
    onCancel?: (val: boolean) => void,
  }) => {
    if (typeof dialogs === 'undefined') { return }

    let okayCb = opts.onOkay ?? ((val: any) => { })
    let cancelCb = opts.onCancel ?? ((val: any) => { })

    dialogs.value.push(new ConfirmPopup({
      message: opts.message,
      onOkay: okayCb,
      onCancel: cancelCb
    }))
  }

  const showSimplePopup = (opts: {
    message: string,
    onOkay?: () => void,
  }) => {
    if (typeof dialogs === 'undefined') { return }

    let okayCb = opts.onOkay ?? (() => { })

    dialogs.value.push(new SimplePopup({
      message: opts.message,
      onOkay: okayCb,
    }))
  }

  onMounted(() => {

  })

  onUnmounted(() => {
  })

  return {
    showPrompt,
    showConfirm,
    showSimplePopup,
    // state,
    // toggle
  }
}