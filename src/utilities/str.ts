export function capitalizeFirstLetter(str: string) {
  str = str.toLowerCase()
  return (str.charAt(0).toUpperCase() + str.slice(1))
}
export function getEventDetails(event: string) {
  return {
    sensorId: parseInt(event.split('-')[1]),
    sensorType: event.split('-')[2].toUpperCase(),
    eventType: event.split('-')[3].toUpperCase(),
  }
}