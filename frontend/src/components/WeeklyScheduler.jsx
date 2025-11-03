import { useState, useEffect } from 'react'
import { API } from '../config/api'
import './WeeklyScheduler.css'
import BrandingFooter from './BrandingFooter'
import Toast from './Toast'
import MobileScheduler from './MobileScheduler'

const WeeklyScheduler = ({ onClose, appointmentType = null, forceMobile = false }) => {
  // ALL hooks must be called at the top level, always in the same order
  const [useMobileView, setUseMobileView] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
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

  const isMobile = () => {
    const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const screenSize = window.innerWidth <= 768
    return userAgent || screenSize
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

  // ALL useEffect hooks must be called here, always
  useEffect(() => {
    const checkMobile = () => {
      setUseMobileView(forceMobile || isMobile())
    }
    setTimeout(checkMobile, 100)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [forceMobile])

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (!useMobileView && useMobileView !== null) {
      // Only fetch for desktop view
      const fetchBookedSlots = async () => {
        setLoading(true)
        const bookedSet = new Set()
        try {
          const generateWeekDays = (startDate) => {
            const days = []
            const start = new Date(startDate)
            const monday = new Date(start)
            monday.setDate(start.getDate() - start.getDay() + 1)
            for (let i = 0; i < 7; i++) {
              const day = new Date(monday)
              day.setDate(monday.getDate() + i)
              days.push(day)
            }
            return days
          }
          
          const weekDays = generateWeekDays(currentWeek)
          const displayedWeekDays = includeWeekend ? weekDays : weekDays.slice(0, 5)
          
          const hhmmToMinutes = (hhmm) => {
            const [h, m] = (hhmm || '0:0').split(':').map(n => parseInt(n, 10))
            return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
          }
          
          const minutesToHHMM = (mins) => {
            const h = Math.floor(mins / 60)
            const m = mins % 60
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          }
          
          for (const day of displayedWeekDays) {
            const dateStr = day.toISOString().split('T')[0]
            try {
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
                        const slotKey = `${day.toDateString()}-${tStr}`
                        bookedSet.add(slotKey)
                      }
                    }
                  })
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch appointments for ${dateStr}:`, error)
            }
          }
        } catch (error) {
          console.error('Error fetching booked slots:', error)
        }
        setBookedSlots(bookedSet)
        setLoading(false)
      }
      fetchBookedSlots()
    }
  }, [currentWeek, includeWeekend, useMobileView])

  useEffect(() => {
    if (!allow30Min) {
      if (bookingDuration !== 60) setBookingDuration(60)
      if (selectedSlot && /:\s*30$/.test(selectedSlot)) {
        setSelectedSlot(null)
      }
    }
  }, [allow30Min])

  useEffect(() => {
    if (!selectedSlot) return
    const [dateStr, time] = selectedSlot.split('-')
    const day = new Date(dateStr)
    // This will be handled in the desktop component
  }, [bookingDuration])

  // Now handle the rendering logic AFTER all hooks
  if (useMobileView === null) {
    return (
      <div className="scheduler-overlay">
        <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>
      </div>
    )
  }

  if (useMobileView) {
    return (
      <MobileScheduler 
        onClose={onClose} 
        appointmentType={appointmentType}
        onSwitchToDesktop={() => setUseMobileView(false)}
      />
    )
  }

  // Desktop scheduler component
  return <DesktopScheduler 
    onClose={onClose}
    appointmentType={appointmentType}
    currentWeek={currentWeek}
    setCurrentWeek={setCurrentWeek}
    selectedSlot={selectedSlot}
    setSelectedSlot={setSelectedSlot}
    bookedSlots={bookedSlots}
    setBookedSlots={setBookedSlots}
    loading={loading}
    setLoading={setLoading}
    booking={booking}
    setBooking={setBooking}
    showBookingForm={showBookingForm}
    setShowBookingForm={setShowBookingForm}
    toast={toast}
    setToast={setToast}
    bookingData={bookingData}
    setBookingData={setBookingData}
    startHour={startHour}
    endHour={endHour}
    displayAvailability={displayAvailability}
    availabilityLocked={availabilityLocked}
    availabilityLockedUntil={availabilityLockedUntil}
    headerMessage={headerMessage}
    bookingDuration={bookingDuration}
    setBookingDuration={setBookingDuration}
    includeWeekend={includeWeekend}
    allow30Min={allow30Min}
    isPremium={isPremium}
    showSuccessModal={showSuccessModal}
    setShowSuccessModal={setShowSuccessModal}
    confirmedAppointment={confirmedAppointment}
    setConfirmedAppointment={setConfirmedAppointment}
    setUseMobileView={setUseMobileView}
  />
}

// Separate desktop component to avoid hook issues
const DesktopScheduler = ({ 
  onClose, appointmentType, currentWeek, setCurrentWeek, selectedSlot, setSelectedSlot,
  bookedSlots, setBookedSlots, loading, booking, setBooking, showBookingForm, setShowBookingForm,
  toast, setToast, bookingData, setBookingData, startHour, endHour, displayAvailability,
  availabilityLocked, availabilityLockedUntil, headerMessage, bookingDuration, setBookingDuration,
  includeWeekend, allow30Min, isPremium, showSuccessModal, setShowSuccessModal,
  confirmedAppointment, setConfirmedAppointment, setUseMobileView
}) => {
  
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

  const generateWeekDays = (startDate) => {
    const days = []
    const start = new Date(startDate)
    const monday = new Date(start)
    monday.setDate(start.getDate() - start.getDay() + 1)
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - d.getDay() + 1)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const timeSlots = generateTimeSlots()
  const weekDays = generateWeekDays(currentWeek)
  const displayedWeekDays = includeWeekend ? weekDays : weekDays.slice(0, 5)

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

  const isSlotInPast = (day, time) => {
    const now = new Date()
    const slotDateTime = new Date(day)
    const [h, m] = time.split(':').map(n => parseInt(n, 10))
    slotDateTime.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0)
    return slotDateTime < now
  }

  const isDateLocked = (day) => {
    if (parsedLockEndMs) {
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)
      if (parsedLockEndMs >= dayEnd.getTime()) return true
    } else if (availabilityLocked) {
      return true
    }
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + (displayAvailability * 7))
    const slotDate = new Date(day)
    if (slotDate > maxDate) return true
    return false
  }

  const isSlotBooked = (day, time) => {
    const slotKey = `${day.toDateString()}-${time}`
    return bookedSlots.has(slotKey)
  }

  const isSlotAvailable = (day, time) => {
    const slotDateTime = new Date(day)
    const [h, m] = time.split(':').map(n => parseInt(n, 10))
    slotDateTime.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0)

    if (availabilityLocked && !parsedLockEndMs) return false
    if (parsedLockEndMs) {
      if (slotDateTime.getTime() < parsedLockEndMs) return false
    }
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + (displayAvailability * 7))
    if (slotDateTime > maxDate) return false
    if (isSlotBooked(day, time) || slotDateTime < new Date()) return false

    if (bookingDuration === 60) {
      const [h, m] = time.split(':').map(n => parseInt(n, 10))
      const startM = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
      const nextM = startM + 30
      const nextTime = minutesToHHMM(nextM)
      const endBoundary = parseInt(endHour, 10) * 60
      if (nextM >= endBoundary) return false
      if (isSlotBooked(day, nextTime)) return false
    }
    return true
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSlotClick = (day, time) => {
    if (!isSlotAvailable(day, time)) return
    const slotKey = `${day.toDateString()}-${time}`
    setSelectedSlot(slotKey)
  }

  const isSlotSelected = (day, time) => {
    const slotKey = `${day.toDateString()}-${time}`
    return selectedSlot === slotKey
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction * 7))
    const newMonday = getStartOfWeek(newDate)
    const currentMonday = getStartOfWeek(new Date())
    if (newMonday < currentMonday) return
    const today = new Date()
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + (displayAvailability * 7))
    const monday = getStartOfWeek(newDate)
    if (monday > maxDate) return
    setCurrentWeek(newDate)
    setSelectedSlot(null)
  }

  const getSlotClass = (day, time) => {
    let classes = 'time-slot'
    if (isDateLocked(day)) return classes + ' past'
    if (isSlotLocked(day, time)) return classes + ' past'
    if (isSlotSelected(day, time)) {
      classes += ' selected'
    } else if (isSlotInPast(day, time)) {
      classes += ' past'
    } else if (isSlotBooked(day, time)) {
      classes += ' booked'
    } else {
      classes += ' available'
    }
    return classes
  }

  const getWeekRange = () => {
    const start = displayedWeekDays[0]
    const end = displayedWeekDays[displayedWeekDays.length - 1]
    if (!start || !end) return ''
    return `${formatDate(start)} - ${formatDate(end)}, ${start.getFullYear()}`
  }

  const handleConfirmBooking = () => {
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
    if (!selectedSlot || !bookingData.name || !bookingData.surname || !bookingData.email) {
      setToast({ message: 'Please fill in all required fields (Name, Surname, Email)', type: 'warning' })
      return
    }

    setBooking(true)
    try {
      const [dateStr, time] = selectedSlot.split('-')
      const selectedDate = new Date(dateStr)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      const [sh, sm] = time.split(':').map(n => parseInt(n, 10))
      const startDate = new Date(0, 0, 0, sh, sm || 0, 0, 0)
      const endDate = new Date(startDate.getTime() + bookingDuration * 60 * 1000)
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

      const appointmentData = {
        date: formattedDate,
        timeStart: time,
        timeEnd: endTime,
        repeat: 'none',
        appTag: appointmentType?.tag || null,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newBookedSlots = new Set(bookedSlots)
        newBookedSlots.add(selectedSlot)
        setBookedSlots(newBookedSlots)

        const selectedDate = new Date(dateStr)
        setConfirmedAppointment({
          date: selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: `${time} - ${endTime}`,
          duration: `${bookingDuration} minutes`,
          name: `${bookingData.name} ${bookingData.surname}`,
          email: bookingData.email
        })

        setShowSuccessModal(true)
        setSelectedSlot(null)
        setShowBookingForm(false)
        setBookingData({ name: '', surname: '', email: '', phone: '' })
      } else {
        setToast({ message: result.error || 'Booking failed', type: 'error' })
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      setToast({ message: 'Failed to book appointment. Please try again.', type: 'error' })
    }
    setBooking(false)
  }

  const cancelBooking = () => {
    setShowBookingForm(false)
    setSelectedSlot(null)
    setBookingData({ name: '', surname: '', email: '', phone: '' })
  }

  return (
    <div className="scheduler-overlay">
      <div className="scheduler-container">
        <div className="scheduler-header">
          <button className="close-button" onClick={onClose}>✕</button>
          <button 
            className="mobile-view-toggle" 
            onClick={() => setUseMobileView(true)}
            title="Switch to mobile view"
          >📱</button>
          {(() => {
            const isWeekLocked = displayedWeekDays && displayedWeekDays.length > 0
              ? displayedWeekDays.every(day => isDateLocked(day))
              : (availabilityLocked || (availabilityLockedUntil && new Date(availabilityLockedUntil) >= new Date()));

            const hasCustomHeader = headerMessage && headerMessage.toString().trim().length > 0;
            const defaultAvailableMsg = 'Select Your Appointment Time';
            const defaultBookedMsg = 'We are currently fully booked';
            const displayText = hasCustomHeader ? headerMessage : (isWeekLocked ? defaultBookedMsg : defaultAvailableMsg);

            return (
              <div style={{ textAlign: 'center' }}>
                {appointmentType ? (
                  <>
                    <h2 className="header-title" style={{ marginBottom: '0.5rem' }}>
                      <span className="header-message-badge">{appointmentType.name}</span>
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#fff', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '0.4rem 1rem', borderRadius: '20px', display: 'inline-block' }}>
                      Price: {appointmentType.price} {appointmentType.currency}
                    </div>
                  </>
                ) : (
                  <h2 className="header-title">
                    <span className="header-message-badge">{displayText}</span>
                  </h2>
                )}
                {parsedLockEndMs && (
                  <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '-0.25rem' }}>
                    Locked until {new Date(parsedLockEndMs).toLocaleString()}
                  </div>
                )}
              </div>
            )
          })()}

          <div className="week-navigation">
            <button
              className="nav-button"
              onClick={() => navigateWeek(-1)}
              disabled={loading || (getStartOfWeek(currentWeek) <= getStartOfWeek(new Date()))}
            >← Previous Week</button>
            <span className="week-range">
              {loading ? 'Loading...' : getWeekRange()}
            </span>
            <button
              className="nav-button"
              onClick={() => navigateWeek(1)}
              disabled={loading}
            >Next Week →</button>
          </div>
        </div>

        <div className={`scheduler-grid ${includeWeekend ? 'days-7' : 'days-5'}`}>
          <div className="time-header"></div>
          {displayedWeekDays.map((day) => (
            <div key={day.toDateString()} className="day-header">
              <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="day-date">{formatDate(day)}</div>
            </div>
          ))}

          {timeSlots.map(time => (
            <div key={time} className="time-row">
              <div className="time-label">{time}</div>
              {displayedWeekDays.map(day => (
                <div
                  key={`${day.toDateString()}-${time}`}
                  className={getSlotClass(day, time)}
                  onClick={() => handleSlotClick(day, time)}
                  title={
                    isDateLocked(day)
                      ? 'Unavailable - bookings are currently locked or beyond available window'
                      : isSlotLocked(day, time)
                        ? 'Unavailable - booking locked until specified time'
                        : isSlotInPast(day, time)
                          ? 'Past time slot'
                          : isSlotBooked(day, time)
                            ? 'Already booked'
                            : 'Available - Click to select'
                  }
                >
                  <span className="slot-time">{time}</span>
                  {isSlotBooked(day, time) && (
                    <span className="booked-indicator">●</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="scheduler-footer">
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-color past"></div>
              <span>Past</span>
            </div>
            <div className="legend-item">
              <div className="legend-color selected"></div>
              <span>Selected</span>
            </div>
          </div>

          {selectedSlot && !showBookingForm && (
            <div className="selected-info">
              <p>Selected: {selectedSlot.replace('-', ' at ')} · {bookingDuration} min</p>
              <button className="confirm-button" onClick={handleConfirmBooking}>
                Confirm Appointment
              </button>
            </div>
          )}

          {showBookingForm && (
            <div className="booking-form">
              <h3>Book Your Appointment</h3>
              <p className="selected-time">
                {selectedSlot && `${selectedSlot.replace('-', ' at ')}`}
              </p>

              <div className="form-grid">
                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

              <div className="form-actions">
                <button
                  className="cancel-button"
                  onClick={cancelBooking}
                  disabled={booking}
                >Cancel</button>
                <button
                  className="submit-button"
                  onClick={submitBooking}
                  disabled={booking}
                >
                  {booking ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </div>
          )}
        </div>
        <BrandingFooter isPremium={isPremium} />
      </div>

      {showSuccessModal && confirmedAppointment && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-header">
              <div className="success-icon">✓</div>
              <h2>Appointment Confirmed!</h2>
            </div>
            <div className="success-modal-body">
              <p className="success-message">
                Your appointment has been successfully scheduled.
              </p>
              <div className="appointment-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Date:</span>
                  <span className="detail-value">{confirmedAppointment.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Time:</span>
                  <span className="detail-value">{confirmedAppointment.time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span className="detail-value">{confirmedAppointment.duration}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">👤 Name:</span>
                  <span className="detail-value">{confirmedAppointment.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{confirmedAppointment.email}</span>
                </div>
              </div>
              <div className="confirmation-note">
                <p>
                  <strong>What's next?</strong><br />
                  A confirmation email has been sent to <strong>{confirmedAppointment.email}</strong> with your appointment details and a cancellation link if needed.
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                  Your appointment is pending confirmation. You'll receive another email once confirmed.
                </p>
              </div>
            </div>
            <div className="success-modal-footer">
              <button 
                className="success-close-button" 
                onClick={() => setShowSuccessModal(false)}
              >Close</button>
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

export default WeeklyScheduler