import { useState, useEffect } from 'react'
import { API } from '../config/api'
import WeeklyScheduler from '../components/WeeklyScheduler'
import '../components/WeeklyScheduler.css'

function Scheduler() {
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
      const response = await fetch(`${API}/appointment-types`)
      const data = await response.json()
      if (data.success && data.data.types) {
        const type = data.data.types.find(t => t.appTag === tag)
        if (type) {
          const appointmentTypeData = {
            name: type.appName,
            tag: type.appTag,
            price: type.appPrice,
            currency: data.data.currency
          }
          setAppointmentType(appointmentTypeData)
        }
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

export default Scheduler
