import { useState, useEffect } from 'react'
import { API } from './config/api'
import WeeklyScheduler from './components/WeeklyScheduler'
import './App.css'

function App() {
  const [showScheduler, setShowScheduler] = useState(false)
  const [appointmentType, setAppointmentType] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const appTag = params.get('appTag')
    
    if (appTag) {
      fetchAppointmentType(appTag)
      setShowScheduler(true)
    }
  }, [])

  const fetchAppointmentType = async (tag) => {
    try {
      console.log('Fetching appointment types for tag:', tag)
  const response = await fetch(`${API}/appointment-types`)
      const data = await response.json()
      console.log('API Response:', data)
      if (data.success && data.data.types) {
        console.log('Available types:', data.data.types)
        const type = data.data.types.find(t => t.appTag === tag)
        console.log('Found type for tag:', type)
        if (type) {
          const appointmentTypeData = {
            name: type.appName,
            tag: type.appTag,
            price: type.appPrice,
            currency: data.data.currency
          }
          console.log('Setting appointmentType:', appointmentTypeData)
          setAppointmentType(appointmentTypeData)
        } else {
          console.log('No type found for tag:', tag)
        }
      } else {
        console.log('Invalid API response structure:', data)
      }
    } catch (error) {
      console.error('Error fetching appointment type:', error)
    }
  }

  return (
    <div className="app">
      {!showScheduler ? (
        <div className="landing-page">
          <div className="landing-content">
            <h1>Appointment Scheduler</h1>
            <p>Book your appointment with ease</p>
            <button 
              className="schedule-button"
              onClick={() => setShowScheduler(true)}
            >
              Schedule Appointment
            </button>
          </div>
        </div>
      ) : (
        <WeeklyScheduler onClose={() => setShowScheduler(false)} appointmentType={appointmentType} />
      )}
    </div>
  )
}

export default App