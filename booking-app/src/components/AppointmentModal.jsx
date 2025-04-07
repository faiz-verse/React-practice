import React, { useEffect, useState } from 'react'
import { BsPlus, BsPerson, BsChevronRight, BsChevronLeft } from "react-icons/bs";

import './AppointmentModal.css'

function AppointmentModal({ toggleAppointmentModal, setToggleAppointmentModal, monthNames }) {

    const [currentDate, setCurrentDate] = useState(new Date());

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

    // for appointments dropdown
    const appointmentTypes = [
        "Doctor Appointment",
        "Dentist Appointment",
        "Therapy Session",
        "Physiotherapy",
        "Mental Health Check-in",
        "Nutrition Consultation",
        "Study Session",
        "Tutoring Session",
        "Exam Preparation",
        "Group Study",
        "Online Class",
        "Assignment Review",
        "Team Meeting",
        "Client Meeting",
        "Project Planning",
        "Performance Review",
        "Interview",
        "Demo Call",
        "One-on-One Chat",
        "Goal Setting",
        "Life Coaching",
        "Time Management Session",
        "Family Catch-up",
        "Personal Development"
    ];

    const [appointmentType, setAppointmentType] = useState("")
    const [appointmentTitle, setAppointmentTitle] = useState("")

    // FOR Calendar within the modal
    const [selectedDate, setSelectedDate] = useState(null)

    const handlePrev = () => {
        const prevMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        setCurrentDate(new Date(prevMonth)); // update state with a new Date instance
    };

    const handleNext = () => {
        const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        setCurrentDate(new Date(nextMonth));
    };

    // TIME ZONES
    const appointmentTimeZones = {
        "India - Asia/Kolkata": "IST",
        "United States - America/New_York": "EST",
        "United States - America/Chicago": "CST",
        "United States - America/Denver": "MST",
        "United States - America/Los_Angeles": "PST",
        "United States - Pacific/Honolulu": "HST",
        "Canada - America/Toronto": "EST",
        "Canada - America/Vancouver": "PST",
        "United Kingdom - Europe/London": "GMT",
        "Germany - Europe/Berlin": "CET",
        "Russia - Europe/Moscow": "MSK",
        "Brazil - America/Sao_Paulo": "BRT",
        "Argentina - America/Argentina/Buenos_Aires": "ART",
        "Mexico - America/Mexico_City": "CST",
        "South Africa - Africa/Johannesburg": "SAST",
        "United Arab Emirates - Asia/Dubai": "GST",
        "China - Asia/Shanghai": "CST",
        "Japan - Asia/Tokyo": "JST",
        "South Korea - Asia/Seoul": "KST",
        "Australia - Australia/Sydney": "AEST",
        "Australia - Australia/Perth": "AWST",
        "New Zealand - Pacific/Auckland": "NZST"
    }

    // TIME SLOTS
    const [selectedTimezone, setSelectedTimezone] = useState("India - Asia/Kolkata");
    const [duration, setDuration] = useState("30 minutes")
    const [timeSlots, setTimeSlots] = useState([]);
    const durationOptions = [
        "15 minutes",
        "30 minutes",
        "45 minutes",
        "1 hour",
        "1 hour 30 minutes",
        "2 hours",
        "2 hours 30 minutes",
        "3 hours"
    ]

    // Convert duration string like "1 hour 30 minutes" to total minutes
    const getDurationInMinutes = (label) => {
        const match = label.match(/(\d+)\s*hour(?:s)?(?:\s*(\d+)\s*minutes)?|(\d+)\s*minutes/);
        if (!match) return 30;

        if (match[1]) {
            const hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            return hours * 60 + minutes;
        } else {
            return parseInt(match[3]);
        }
    };

    const formatTime = (totalMinutes) => {
        const hour = Math.floor(totalMinutes / 60) % 24;
        const min = totalMinutes % 60;
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMin = min.toString().padStart(2, "0");
        const ampm = hour < 12 ? "AM" : "PM";
        return `${formattedHour}:${formattedMin} ${ampm}`;
    };

    const roundUpToNearest = (minutes, interval) => {
        return Math.ceil(minutes / interval) * interval;
    };

    useEffect(() => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const interval = getDurationInMinutes(duration);

        const startMinutes = roundUpToNearest(currentMinutes, interval);
        const endOfDay = 24 * 60;

        const slotList = [];
        for (let start = startMinutes; start + interval <= endOfDay; start += interval) {
            const end = start + interval;
            slotList.push(`${formatTime(start)} - ${formatTime(end)}`);
        }

        setTimeSlots(slotList);
    }, [duration]);

    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)


    return (
        <div id='set-appointment-modal' style={{ display: toggleAppointmentModal ? 'block' : 'none' }}>
            <div id='modal-title'>Add Appointment</div>
            <div id='appointment-content-wrapper'>
                <div id="appointment-type">
                    <span id='type-label'>Appointment Type</span>
                    <input type="text" value={appointmentType} onChange={(e) => { setAppointmentType(e.target.value) }} />
                    <select onChange={(e) => { setAppointmentType(e.target.value) }} name="appointment-type" id="appointment-type-dropdown">
                        {appointmentTypes.map((appointment, index) => (
                            <option key={index} value={appointment}>{appointment}</option>
                        ))}
                    </select>
                </div>
                <div id='appointment-title'>
                    <span id='title-label'>Appointment Title</span>
                    <input type="text" onChange={(e) => { setAppointmentTitle(e.target.value) }} />
                </div>
                <div id='appointment-date'>
                    <span id='date-label'>Appointment Date</span>
                    <div id='date-container'>
                        <div id='appointment-container-month'>
                            <button id='prev' onClick={handlePrev}><BsChevronLeft size={16} color='rgb(100, 100, 100)' strokeWidth={1} /></button>
                            <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            <button id='next' onClick={handleNext}><BsChevronRight size={16} color='rgb(100, 100, 100)' strokeWidth={1} /></button>
                        </div>
                        <div id="appointment-calendar">
                            {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
                                <div className="appointment-calendar-header" key={index}>{d}</div>
                            ))}

                            {days.map((day, index) => {
                                if (!day) return <div key={index} className="appointment-calendar-cell not-date"></div>;

                                const today = new Date();
                                const thisDate = new Date();
                                thisDate.setDate(day); // Assuming day is just the day number (1–31)

                                const isPast = thisDate < today.setHours(0, 0, 0, 0); // Remove time from today
                                const isSelected = selectedDate && selectedDate.getDate() === day;

                                return (
                                    <div
                                        onClick={() => { setSelectedDate(thisDate) }}
                                        key={index}
                                        className={`appointment-calendar-cell ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                                        style={{ pointerEvents: isPast ? 'none' : 'auto' }}
                                    >
                                        {day}
                                    </div>
                                );
                            })}

                        </div></div>
                </div>
                <div id='appointment-timezone'>
                    <span id='timezone-label'>Timezone</span>
                    <select name="appointment-timezone" id="appointment-timezone-dropdown"
                        value={selectedTimezone} onChange={(e) => { setSelectedTimezone(e.target.value) }}>
                        {Object.entries(appointmentTimeZones).map(([key, value], index) => (
                            <option key={index} value={key}>{value}</option>
                        ))}
                    </select>
                </div>
                <div id="appointment-duration">
                    <span id='timezone-label'>Duration</span>
                    <select name="appointment-duration" id="appointment-duration-dropdown"
                        value={duration} onChange={(e) => { setDuration(e.target.value) }}>
                        {durationOptions.map((d, index) => (
                            <option key={index} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div id='appointment-time-slot'>
                    <span id='timeslot-label'>Time Slots</span>
                    <div id='time-slot-wrapper'>
                        {timeSlots.map((slot, index) => {
                            const isSelected = selectedTimeSlot === slot;

                            return (
                                <div
                                    onClick={() => setSelectedTimeSlot(slot)}
                                    className={`time-slot ${isSelected ? 'selected' : ''}`}
                                    key={index}
                                >
                                    {slot}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div id='appointment-buttons'>
                    <button id='appointment-cancel' onClick={() => setToggleAppointmentModal(!toggleAppointmentModal)}>Cancel</button>
                    <button id='appointment-add'>Add</button>
                </div>
            </div>
        </div>

    )
}

export default AppointmentModal
