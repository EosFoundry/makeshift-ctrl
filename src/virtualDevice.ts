import { MakeShiftDeviceEvents } from '@eos-makeshift/serial'
import { inject } from 'vue'

const DeviceMap = inject('device-maps') as any
const DeviceEvents = inject('makeshift-events') as MakeShiftDeviceEvents
const MakeshiftMap = DeviceMap.value.makeshift
console.log(MakeshiftMap)
console.log(DeviceEvents)