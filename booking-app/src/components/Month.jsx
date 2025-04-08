import React from 'react'

import './Month.css'

function Month({ currentDate, appointments }) {

    const getDaysInMonth = (year, month) => {
        const date = new Date(year, month, 1);
        const days = []

        // Get the first day index (0 = Sunday, 1 = Monday, ...)
        const firstDayIndex = date.getDay();

        // Get the number of days in the month
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Add empty slots before the first day
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            days.push(day);
        }

        return days;
    }

    const currentMonth = currentDate.getMonth(); // 0-based (0 = Jan)
    const currentYear = currentDate.getFullYear();
    const days = getDaysInMonth(currentYear, currentMonth);

    // For getting appointment dates
    const appointmentDays = appointments
        .map(a => {
            const date = new Date(a.selectedDate); // ✅ correct key
            return isNaN(date) ? null : date.toISOString().slice(0, 10);
        })
        .filter(Boolean);

    // to get the specific appointment
    function getAppointmentsByDate(storedAppointments, targetDate) {
        return storedAppointments.filter(appointment => {
            const dateOnly = new Date(appointment.selectedDate).toISOString().slice(0, 10);
            return dateOnly === targetDate;
        });
    }

    return (
        <div id='month' className='content'>

            <div id="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => {
                    return (<div className="calendar-header" key={d}>{d}</div>)
                })}

                {days.map((day, idx) => {
                    const fullDate = new Date(currentYear, currentMonth, day).toISOString().split("T")[0];

                    const appointmentData = getAppointmentsByDate(appointments, fullDate); // Always get appointments
                    const hasAppointment = appointmentData.length > 0;

                    return (
                        <div className={`calendar-cell ${hasAppointment ? "has-appointment" : ""}`} key={idx}>
                            {day}

                            {hasAppointment && (
                                <div className="appointment-message">
                                    <div className="appointment-dot"></div>
                                    {/* Loop through all appointments on that day */}
                                    {appointmentData.map((appointment, i) => (
                                        <div className="appointment-info" key={i}>
                                            <span>{appointment.appointmentType}</span>
                                            <span>{appointment.appointmentTitle}</span>
                                            <span>{appointment.selectedTimeSlot}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    );
                })}

            </div>

        </div>
    )
}

export default Month
