import React from 'react'

function Week() {

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

    console.log(getCurrentWeekDates());

    const timeSlots = []
    for (let hour = 0; hour < 24; hour++) {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        timeSlots.push(`${formattedHour}:00 ${ampm}`);
    }


    return (
        <div id='week' className='content'>
            {timeSlots.map((slot, index) => (
                <div key={index}>{slot}</div>
            ))}
        </div>
    )
}

export default Week
