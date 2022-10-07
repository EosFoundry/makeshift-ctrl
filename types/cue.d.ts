export interface ICueAPI {
  loadPromptBook: (path?: string) => Promise<CueSheet>
  savePromptBook: (sheet: CueSheet, path?: string) => Promise<Message>
}

/**
 * 
 */
export interface Cue {
  run: () => void

}

export interface PromptBook {
  sheetLabels: Array<string>
  live: CueSheet;
  [index: string]: CueSheet;
}

export interface CueSheet {
  by: {
    event: any
    name: any
  }
}