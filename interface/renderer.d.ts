export interface IElectronAPI {
  onMPM: (callback) => void,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
