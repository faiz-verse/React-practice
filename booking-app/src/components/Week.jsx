import React from 'react'

function Week({ currentDate, appointments }) {

    function getCurrentWeekDates(date = new Date()) {
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

    console.log(getCurrentWeekDates());

    const timeSlots = []
    for (let hour = 0; hour < 24; hour++) {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        timeSlots.push(`${formattedHour}:00 ${ampm}`);
    }


    return (
        <div id='week' className='content'>
            <div id='week-time-slots'>
                {timeSlots.map((slot, index) => (
                    <div className='time-slot' key={index}>{slot}</div>
                ))}
            </div>
            <div id='week-days-header'>
                {week.map((currentDay, index) => (
                    <div className='week-day' key={currentDay}>{currentDay}</div>
                ))}
            </div>
        </div>
    )
}

export default Week
