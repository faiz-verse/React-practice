import React, { useEffect, useState } from 'react';
import { BsPlus, BsPerson, BsChevronRight, BsChevronLeft } from "react-icons/bs";
import { v4 as uuidv4 } from 'uuid';
import './AppointmentModal.css';

function AppointmentModal({ toggleAppointmentModal, setToggleAppointmentModal, monthNames, appointments, setAppointments }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointmentType, setAppointmentType] = useState("");
    const [appointmentTitle, setAppointmentTitle] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimezone, setSelectedTimezone] = useState("India - Asia/Kolkata");
    const [duration, setDuration] = useState("30 minutes");
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

    const appointmentTypes = [
        "Doctor Appointment", "Dentist Appointment", "Therapy Session", "Physiotherapy",
        "Mental Health Check-in", "Nutrition Consultation", "Study Session", "Tutoring Session",
        "Exam Preparation", "Group Study", "Online Class", "Assignment Review", "Team Meeting",
        "Client Meeting", "Project Planning", "Performance Review", "Interview", "Demo Call",
        "One-on-One Chat", "Goal Setting", "Life Coaching", "Time Management Session",
        "Family Catch-up", "Personal Development"
    ];

    const appointmentTimeZones = {
        "India - Asia/Kolkata": "IST", "United States - America/New_York": "EST",
        "United States - America/Chicago": "CST", "United States - America/Denver": "MST",
        "United States - America/Los_Angeles": "PST", "United States - Pacific/Honolulu": "HST",
        "Canada - America/Toronto": "EST", "Canada - America/Vancouver": "PST",
        "United Kingdom - Europe/London": "GMT", "Germany - Europe/Berlin": "CET",
        "Russia - Europe/Moscow": "MSK", "Brazil - America/Sao_Paulo": "BRT",
        "Argentina - America/Argentina/Buenos_Aires": "ART", "Mexico - America/Mexico_City": "CST",
        "South Africa - Africa/Johannesburg": "SAST", "United Arab Emirates - Asia/Dubai": "GST",
        "China - Asia/Shanghai": "CST", "Japan - Asia/Tokyo": "JST",
        "South Korea - Asia/Seoul": "KST", "Australia - Australia/Sydney": "AEST",
        "Australia - Australia/Perth": "AWST", "New Zealand - Pacific/Auckland": "NZST"
    };

    const durationOptions = [
        "15 minutes", "30 minutes", "45 minutes", "1 hour",
        "1 hour 30 minutes", "2 hours", "2 hours 30 minutes", "3 hours"
    ];

    const getDaysInMonth = (year, month) => {
        const date = new Date(year, month, 1);
        const days = [];
        const firstDayIndex = date.getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) days.push(null);
        for (let day = 1; day <= totalDays; day++) days.push(day);

        return days;
    };

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const days = getDaysInMonth(currentYear, currentMonth);

    const handlePrev = () => setCurrentDate(new Date(currentYear, currentMonth - 1));
    const handleNext = () => setCurrentDate(new Date(currentYear, currentMonth + 1));

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

    const roundUpToNearest = (minutes, interval) => Math.ceil(minutes / interval) * interval;

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

    const handleAddAppointment = () => {
        if (!appointmentType || !appointmentTitle || !selectedDate || !selectedTimeSlot) {
            alert("Please fill all fields and select a date/time slot.");
            return;
        }

        const newAppointment = {
            appointmentID: uuidv4(),
            appointmentType,
            appointmentTitle,
            selectedDate,
            selectedTimezone,
            duration,
            selectedTimeSlot
        };

        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);
        localStorage.setItem("appointments", JSON.stringify(updatedAppointments));

        console.log("Appointment Added ✅", updatedAppointments); // ✅ Corrected log

        // Reset form and close modal
        setAppointmentType("");
        setAppointmentTitle("");
        setSelectedDate(null);
        setSelectedTimezone("India - Asia/Kolkata");
        setDuration("30 minutes");
        setSelectedTimeSlot(null);
        setToggleAppointmentModal(false);
    };

    return (
        <div id='set-appointment-modal' style={{ display: toggleAppointmentModal ? 'block' : 'none' }}>
            <div id='modal-title'>Add Appointment</div>
            <div id='appointment-content-wrapper'>
                {/* Type & Title */}
                <div id="appointment-type">
                    <span id='type-label'>Appointment Type</span>
                    <input type="text" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} />
                    <select onChange={(e) => setAppointmentType(e.target.value)} value={appointmentType}>
                        <option value="">-- Select from list --</option>
                        {appointmentTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
                    </select>
                </div>

                <div id='appointment-title'>
                    <span id='title-label'>Appointment Title</span>
                    <input type="text" value={appointmentTitle} onChange={(e) => setAppointmentTitle(e.target.value)} />
                </div>

                {/* Calendar */}
                <div id='appointment-date'>
                    <span id='date-label'>Appointment Date</span>
                    <div id='date-container'>
                        <div id='appointment-container-month'>
                            <button id='prev' onClick={handlePrev}><BsChevronLeft size={16} /></button>
                            <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            <button id='next' onClick={handleNext}><BsChevronRight size={16} /></button>
                        </div>
                        <div id="appointment-calendar">
                            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="appointment-calendar-header">{d}</div>)}
                            {days.map((day, i) => {
                                if (!day) return <div key={i} className="appointment-calendar-cell not-date" />;
                                const cellDate = new Date(currentYear, currentMonth, day);
                                const isPast = cellDate < new Date().setHours(0, 0, 0, 0);
                                const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
                                return (
                                    <div key={i} onClick={() => !isPast && setSelectedDate(cellDate)}
                                         className={`appointment-calendar-cell ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                                         style={{ pointerEvents: isPast ? 'none' : 'auto' }}>
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Timezone & Duration */}
                <div id='appointment-timezone'>
                    <span id='timezone-label'>Timezone</span>
                    <select value={selectedTimezone} onChange={(e) => setSelectedTimezone(e.target.value)}>
                        {Object.entries(appointmentTimeZones).map(([key, value], i) => (
                            <option key={i} value={key}>{value}</option>
                        ))}
                    </select>
                </div>

                <div id="appointment-duration">
                    <span id='timezone-label'>Duration</span>
                    <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                        {durationOptions.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Time Slots */}
                <div id='appointment-time-slot'>
                    <span id='timeslot-label'>Time Slots</span>
                    <div id='time-slot-wrapper'>
                        {timeSlots.map((slot, i) => (
                            <div key={i} onClick={() => setSelectedTimeSlot(slot)}
                                 className={`time-slot ${selectedTimeSlot === slot ? 'selected' : ''}`}>
                                {slot}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div id='appointment-buttons'>
                    <button id='appointment-cancel' onClick={() => setToggleAppointmentModal(false)}>Cancel</button>
                    <button id='appointment-add' onClick={handleAddAppointment}>Add</button>
                </div>
            </div>
        </div>
    );
}

export default AppointmentModal;
