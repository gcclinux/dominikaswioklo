import { useState, useEffect } from 'react'
import { API } from '../config/api'
import './MobileScheduler.css'
import BrandingFooter from './BrandingFooter'
import Toast from './Toast'

const MobileScheduler = ({ onClose, appointmentType = null, onSwitchToDesktop }) => {
  console.log('MobileScheduler rendered with props:', { onClose: !!onClose, appointmentType, onSwitchToDesktop: !!onSwitchToDesktop })
  console.log('appointmentType details:', appointmentType)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [bookedSlots, setBookedSlots] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'info' })
  const [bookingData, setBookingData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: ''
  })
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(17)
  const [displayAvailability, setDisplayAvailability] = useState(4)
  const [availabilityLocked, setAvailabilityLocked] = useState(false)
  const [availabilityLockedUntil, setAvailabilityLockedUntil] = useState(null)
  const [headerMessage, setHeaderMessage] = useState('')
  const [bookingDuration, setBookingDuration] = useState(30)
  const [includeWeekend, setIncludeWeekend] = useState(true)
  const [allow30Min, setAllow30Min] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [confirmedAppointment, setConfirmedAppointment] = useState(null)
  const [step, setStep] = useState('date') // 'date', 'time', 'form'
  const [localAppointmentType, setLocalAppointmentType] = useState(null)

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    const s = parseInt(startHour, 10)
    const e = parseInt(endHour, 10)
    for (let hour = s; hour < e; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`)
      if (allow30Min) {
        slots.push(`${String(hour).padStart(2, '0')}:30`)
      }
    }
    return slots
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const parseLockEnd = (val) => {
    if (!val) return null
    if (val instanceof Date) return val
    if (typeof val === 'number') return new Date(val)
    let s = String(val).trim()
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s)) {
      s = s.replace(' ', 'T')
    }
    const d = new Date(s)
    if (isNaN(d.getTime())) return null
    return d
  }

  const parsedLockEnd = parseLockEnd(availabilityLockedUntil)
  const parsedLockEndMs = parsedLockEnd ? parsedLockEnd.getTime() : null

  const hhmmToMinutes = (hhmm) => {
    const [h, m] = (hhmm || '0:0').split(':').map(n => parseInt(n, 10))
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
  }

  const minutesToHHMM = (mins) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const isSlotLocked = (day, time) => {
    if (availabilityLocked && !parsedLockEndMs) return true
    if (!parsedLockEndMs) return false
    const slotDateTime = new Date(day)
    const [h, m] = time.split(':').map(n => parseInt(n, 10))
    slotDateTime.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0)
    return slotDateTime.getTime() < parsedLockEndMs
  }

  const fetchBookedSlots = async (date) => {
    if (!date) return
    
    setLoading(true)
    const bookedSet = new Set()

    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`${API}/appointments/date/${dateStr}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          data.data.forEach(appointment => {
            if (!appointment.cancelled) {
              const startM = hhmmToMinutes(appointment.timeStart)
              const endM = hhmmToMinutes(appointment.timeEnd)
              for (let t = startM; t < endM; t += 30) {
                const tStr = minutesToHHMM(t)
                bookedSet.add(tStr)
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch appointments for ${date}:`, error)
    }

    setBookedSlots(bookedSet)
    setLoading(false)
  }

  const fetchAppointmentType = async (tag) => {
    try {
      const response = await fetch(`${API}/appointment-types`)
      const data = await response.json()
      if (data.success && data.data.types) {
        const type = data.data.types.find(t => t.appTag === tag)
        if (type) {
          setLocalAppointmentType({
            name: type.appName,
            tag: type.appTag,
            price: type.appPrice,
            currency: data.data.currency
          })
        }
      }
    } catch (error) {
      console.error('Error fetching appointment type:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setStartHour(json.data.startHour ?? 9)
          setEndHour(json.data.endHour ?? 17)
          setDisplayAvailability(json.data.displayAvailability ?? 4)
          setAvailabilityLocked((json.data.availabilityLocked ?? 0) === 1)
          setAvailabilityLockedUntil(json.data.availabilityLockedUntil || null)
          setHeaderMessage(json.data.headerMessage || '')
          setIncludeWeekend((json.data.includeWeekend ?? 1) === 1)
          setAllow30Min((json.data.allow30Min ?? 1) === 1)
          if (!json.data.allow30Min) setBookingDuration(60)
          if (json.data.license) {
            setIsPremium(json.data.license.isPremium)
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch settings', err)
    }
  }

  useEffect(() => {
    fetchSettings()
    
    // Check for appTag in URL and fetch appointment type
    const params = new URLSearchParams(window.location.search)
    const appTag = params.get('appTag')
    if (appTag) {
      fetchAppointmentType(appTag)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate)
    }
  }, [selectedDate])

  const isDateAvailable = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false
    
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + (displayAvailability * 7))
    if (date > maxDate) return false
    
    if (!includeWeekend && (date.getDay() === 0 || date.getDay() === 6)) return false
    
    if (availabilityLocked && !parsedLockEndMs) return false
    
    if (parsedLockEndMs) {
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      if (parsedLockEndMs >= dayEnd.getTime()) return false
    }
    
    return true
  }

  const isTimeAvailable = (time) => {
    if (!selectedDate) return false
    
    const slotDateTime = new Date(selectedDate)
    const [h, m] = time.split(':').map(n => parseInt(n, 10))
    slotDateTime.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0)
    
    if (slotDateTime < new Date()) return false
    if (isSlotLocked(selectedDate, time)) return false
    if (bookedSlots.has(time)) return false
    
    if (bookingDuration === 60) {
      const startM = hhmmToMinutes(time)
      const nextM = startM + 30
      const nextTime = minutesToHHMM(nextM)
      const endBoundary = parseInt(endHour, 10) * 60
      if (nextM >= endBoundary) return false
      if (bookedSlots.has(nextTime)) return false
    }
    
    return true
  }

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date)) return
    
    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    setSelectedDate(date)
    setSelectedTime(null)
    setStep('time')
  }

  const handleTimeSelect = (time) => {
    if (!isTimeAvailable(time)) return
    
    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    setSelectedTime(time)
    setStep('form')
    setShowBookingForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const submitBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingData.name || !bookingData.surname || !bookingData.email) {
      setToast({ message: 'Please fill in all required fields', type: 'warning' })
      return
    }

    setBooking(true)

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0]
      const [sh, sm] = selectedTime.split(':').map(n => parseInt(n, 10))
      const startDate = new Date(0, 0, 0, sh, sm || 0, 0, 0)
      const endDate = new Date(startDate.getTime() + bookingDuration * 60 * 1000)
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

      const appointmentData = {
        date: formattedDate,
        timeStart: selectedTime,
        timeEnd: endTime,
        repeat: 'none',
        appTag: (appointmentType || localAppointmentType)?.tag || null,
        user: {
          name: bookingData.name,
          middle: bookingData.middle || '',
          surname: bookingData.surname,
          email: bookingData.email,
          phone: bookingData.phone || ''
        }
      }

      const response = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newBookedSlots = new Set(bookedSlots)
        newBookedSlots.add(selectedTime)
        setBookedSlots(newBookedSlots)

        setConfirmedAppointment({
          date: selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: `${selectedTime} - ${endTime}`,
          duration: `${bookingDuration} minutes`,
          name: `${bookingData.name} ${bookingData.surname}`,
          email: bookingData.email
        })

        setShowSuccessModal(true)
        resetForm()
      } else {
        setToast({ message: result.error || 'Booking failed', type: 'error' })
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      setToast({ message: 'Failed to book appointment. Please try again.', type: 'error' })
    }

    setBooking(false)
  }

  const resetForm = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    setShowBookingForm(false)
    setStep('date')
    setBookingData({
      name: '',
      surname: '',
      email: '',
      phone: ''
    })
  }

  const goBack = () => {
    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
    
    if (step === 'form') {
      setStep('time')
      setShowBookingForm(false)
    } else if (step === 'time') {
      setStep('date')
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }

  const timeSlots = generateTimeSlots()
  const calendarDays = generateCalendarDays()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="mobile-scheduler-overlay">
      <div className="mobile-scheduler-container">
        <div className="mobile-scheduler-header">

          <button 
            className="desktop-view-toggle" 
            onClick={onSwitchToDesktop}
            title="Switch to desktop view"
          >
            💻
          </button>
          

          
          <div className="mobile-header-content">
            <h2 className="mobile-header-title">
              {(appointmentType || localAppointmentType)?.name || 
               (step === 'date' ? 'Select Date' : 
                step === 'time' ? 'Select Time' : 'Your Details')}
            </h2>
            {(appointmentType || localAppointmentType) && (
              <div className="mobile-price-badge">
                {(appointmentType || localAppointmentType).price} {(appointmentType || localAppointmentType).currency}
              </div>
            )}
          </div>
        </div>

        <div className="mobile-scheduler-content">
          {step === 'date' && (
            <div className="mobile-calendar">
              <div className="mobile-calendar-header">
                <button 
                  className="mobile-nav-button"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                >
                  ‹
                </button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button 
                  className="mobile-nav-button"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                >
                  ›
                </button>
              </div>
              
              <div className="mobile-calendar-grid">
                <div className="mobile-day-header">Sun</div>
                <div className="mobile-day-header">Mon</div>
                <div className="mobile-day-header">Tue</div>
                <div className="mobile-day-header">Wed</div>
                <div className="mobile-day-header">Thu</div>
                <div className="mobile-day-header">Fri</div>
                <div className="mobile-day-header">Sat</div>
                
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isAvailable = isDateAvailable(day)
                  const isToday = day.toDateString() === new Date().toDateString()
                  
                  return (
                    <button
                      key={index}
                      className={`mobile-calendar-day ${
                        !isCurrentMonth ? 'other-month' : ''
                      } ${
                        !isAvailable ? 'unavailable' : 'available'
                      } ${
                        isToday ? 'today' : ''
                      }`}
                      onClick={() => handleDateSelect(day)}
                      disabled={!isAvailable}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 'time' && selectedDate && (
            <div className="mobile-time-picker">
              <div className="mobile-selected-date">
                <div>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <button className="mobile-date-back-button" onClick={goBack}>
                  Change Date
                </button>
              </div>
              

              
              <div className="mobile-time-slots">
                {loading ? (
                  <div className="mobile-loading">Loading available times...</div>
                ) : (
                  timeSlots.map(time => {
                    const available = isTimeAvailable(time)
                    return (
                      <button
                        key={time}
                        className={`mobile-time-slot ${available ? 'available' : 'unavailable'}`}
                        onClick={() => handleTimeSelect(time)}
                        disabled={!available}
                      >
                        {time}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {step === 'form' && showBookingForm && (
            <div className="mobile-booking-form">
              <div className="mobile-appointment-summary">
                <div className="mobile-summary-item">
                  <span className="mobile-summary-label">Date:</span>
                  <span className="mobile-summary-value">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="mobile-summary-item">
                  <span className="mobile-summary-label">Time:</span>
                  <span className="mobile-summary-value">{selectedTime}</span>
                </div>
                <div className="mobile-summary-item">
                  <span className="mobile-summary-label">Duration:</span>
                  <span className="mobile-summary-value">{bookingDuration} min</span>
                </div>
              </div>

              <button
                className="mobile-change-date-button"
                onClick={() => {
                  setStep('date')
                  setSelectedDate(null)
                  setSelectedTime(null)
                  setShowBookingForm(false)
                }}
              >
                Change Date
              </button>

              <div className="mobile-form-fields">
                <div className="mobile-form-group">
                  <label htmlFor="name">First Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={bookingData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mobile-form-group">
                  <label htmlFor="surname">Last Name *</label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    value={bookingData.surname}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mobile-form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mobile-form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button
                className="mobile-submit-button"
                onClick={submitBooking}
                disabled={booking}
              >
                {booking ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          )}
        </div>

        <BrandingFooter isPremium={isPremium} />
      </div>

      {/* Success Modal */}
      {showSuccessModal && confirmedAppointment && (
        <div className="mobile-success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="mobile-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-success-header">
              <div className="mobile-success-icon">✓</div>
              <h2>Appointment Confirmed!</h2>
            </div>
            <div className="mobile-success-body">
              <p>Your appointment has been successfully scheduled.</p>
              <div className="mobile-success-details">
                <div className="mobile-success-row">
                  <span>📅 {confirmedAppointment.date}</span>
                </div>
                <div className="mobile-success-row">
                  <span>🕐 {confirmedAppointment.time}</span>
                </div>
                <div className="mobile-success-row">
                  <span>👤 {confirmedAppointment.name}</span>
                </div>
              </div>
              <p className="mobile-success-note">
                A confirmation email has been sent to <strong>{confirmedAppointment.email}</strong>
              </p>
              <button 
                className="mobile-success-button" 
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  )
}

export default MobileScheduler