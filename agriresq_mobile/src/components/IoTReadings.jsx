import './IoTReadings.css'

export default function IoTReadings({ temp, humidity, ethylene, compact = false }) {
  return (
    <div className={`iot-readings ${compact ? 'compact' : ''}`}>
      <div className="iot-item">
        <span className="iot-icon">🌡️</span>
        <div>
          <span className="iot-value">{temp != null ? `${Number(temp).toFixed(1)}°C` : '—'}</span>
          <span className="iot-label">Temperature</span>
        </div>
      </div>
      <div className="iot-item">
        <span className="iot-icon">💧</span>
        <div>
          <span className="iot-value">{humidity != null ? `${Number(humidity).toFixed(0)}%` : '—'}</span>
          <span className="iot-label">Humidity</span>
        </div>
      </div>
      {ethylene != null && (
        <div className="iot-item">
          <span className="iot-icon">⚗️</span>
          <div>
            <span className="iot-value">{Number(ethylene).toFixed(2)} ppm</span>
            <span className="iot-label">Ethylene</span>
          </div>
        </div>
      )}
    </div>
  )
}
