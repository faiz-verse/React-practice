import React from 'react'

import './Month.css'

function Month({currentDate}) {

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

    return (
        <div id='month' className='content'>

            <div id="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div className="calendar-header" key={d}>{d}</div>
                ))}

                {days.map((day, idx) => (
                    <div className="calendar-cell" key={idx}>
                        {day ? day : ""}
                    </div>
                ))}
            </div>

        </div>
    )
}

export default Month
