import React from 'react'

import './week.css'

function Week({ currentDate, appointments }) {

    function getCurrentWeekDates(date = currentDate) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday as start

        const week = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day.toISOString().split("T")[0]); // Format: YYYY-MM-DD
        }

        return week;
    }

    const week = getCurrentWeekDates()

    console.log(week);

    const timeSlots = []
    for (let hour = 0; hour < 24; hour++) {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        timeSlots.push(`${formattedHour}:00 ${ampm}`);
    }

    // to get the specific appointment
    function getAppointmentsByDate(storedAppointments, targetDate) {
        return storedAppointments.filter(appointment => {
            const dateOnly = new Date(appointment.selectedDate).toISOString().slice(0, 10);
            return dateOnly === targetDate;
        });
    }

    console.log(timeSlots)

    const currentMonth = currentDate.getMonth(); // 0-based (0 = Jan)
    const currentYear = currentDate.getFullYear();

    return (
        <div id='week' className='content'>
            <div id='time-slot-label'> Timings </div>
            <div id='week-time-slots'>
                {timeSlots.map((slot, index) => (
                    <div className='week-time-slot' key={index}>{slot}</div>
                ))}
            </div>
            <div id='week-days-header'>
                {week.map((currentDay, index) => {
                    const date = new Date(currentDay)
                    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }); // "Sunday"
                    const dayOfMonth = String(date.getDate()).padStart(2, '0');              // "06"
                    return(
                        <div className='week-day' key={currentDay}>
                                <div>
                                    <span>{dayOfWeek}</span>
                                    <span>{dayOfMonth}</span>
                                </div>
                        </div>
                    );   
                })}
            </div>

            <div id='week-appointments-wrapper'>
  {timeSlots.map((slot, slotIndex) =>
    week.map((day) => {
      const matchingAppointments = appointments.filter((appt) => {
        const apptDate = new Date(appt.selectedDate);

        // Fix timezone for correct day
        const formatted = apptDate.toLocaleString('en-US', {
          timeZone: appt.selectedTimezone.split(' - ')[1] || 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const [mm, dd, yyyy] = formatted.split('/');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        if (formattedDate !== day) return false;

        // Compare times
        const startTimeString = appt.selectedTimeSlot.split(' - ')[0].trim();
        const dummyDate = new Date().toDateString();

        const slotTime = new Date(`${dummyDate} ${slot}`);
        const nextSlot = timeSlots[slotIndex + 1];
        const nextSlotTime = nextSlot
          ? new Date(`${dummyDate} ${nextSlot}`)
          : new Date(`${dummyDate} 11:59 PM`);

        const apptStartTime = new Date(`${dummyDate} ${startTimeString}`);

        return apptStartTime >= slotTime && apptStartTime < nextSlotTime;
      });

      return (
        <div
          key={`${slot}-${day}`}
          className={`week-appointment ${matchingAppointments.length > 0 ? 'has-appointment' : ''}`}
        >
          {matchingAppointments.map((appt, idx) => (
            <div key={idx} className="appointment-item">
              {appt.appointmentTitle}
            </div>
          ))}
        </div>
      );
    })
  )}
</div>


        </div>
    )
}

export default Week
