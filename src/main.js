import { createApp, ref } from 'vue';
import { customAlphabet } from 'nanoid';
import App from './App.vue';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);
const dcDevice = {
    devicePath: '',
    portId: '',
    deviceSerial: ''
};
(async () => {
    const state = {
        makeShift: window.MakeShiftCtrl,
        connectedDevices: ref([]),
        currentDevice: ref(dcDevice),
        cues: ref(await window.MakeShiftCtrl.get.allCues()),
        logLevel: ref('info'),
        Events: await window.MakeShiftCtrl.get.events(),
        logRank: await window.MakeShiftCtrl.get.logRank(),
        initialDevices: await window.MakeShiftCtrl.get.connectedDevices(),
    };
    state.connectedDevices.value = state.initialDevices;
    if (state.initialDevices.length > 0) {
        state.currentDevice.value = state.initialDevices[0];
    }
    // watch(state.currentDevice, async (currDevice, prevDevice) => {
    // })
    window.MakeShiftCtrl.onEv.device.connected((garb, newfp) => {
        if (state.connectedDevices.value.length === 0) {
            state.currentDevice.value = newfp;
        }
        state.connectedDevices.value.push(newfp);
    });
    window.MakeShiftCtrl.onEv.device.disconnected((garb, dcfp) => {
        state.connectedDevices.value = state.connectedDevices.value.filter((currfp) => {
            return (currfp.portId !== dcfp.portId || currfp.devicePath !== dcfp.devicePath);
        });
        if (state.connectedDevices.value.length === 0) {
            state.currentDevice.value = dcDevice;
        }
    });
    window.MakeShiftCtrl.onEv.cue.added((garb, cue) => {
        state.cues.value.set(cue.id, cue);
    });
    window.MakeShiftCtrl.onEv.cue.changed((garb, cue) => {
        state.cues.value.set(cue.id, cue);
    });
    window.MakeShiftCtrl.onEv.cue.removed((garb, cue) => {
        state.cues.value.delete(cue.id);
    });
    // console.log(state.cues.value)
    // console.log(await state.makeShift.test())
    return state;
})().then((state) => {
    const app = createApp(App)
        .provide('logLevel', state.logLevel)
        .provide('makeshift', state.makeShift)
        .provide('makeshift-connected-devices', state.connectedDevices)
        .provide('current-device', state.currentDevice)
        .provide('makeshift-logRank', state.logRank)
        .provide('cues', state.cues)
        .provide('makeshift-events', state.Events)
        .provide('nanoid', nanoid)
        .mount('#app')
        .$nextTick(() => {
        postMessage({ payload: 'removeLoading' }, '*');
    });
});
//# sourceMappingURL=main.js.map