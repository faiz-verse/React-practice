import React, { useState, useEffect } from 'react'
import { BsChevronRight, BsChevronLeft } from "react-icons/bs";

import { format } from 'date-fns';

import './Days.css'

function Days({ currentDate, appointments, setAppointments }) {

    const [timeSlots, setTimeSlots] = useState([]);
    const [duration, setDuration] = useState("30 minutes");

    const [localDate, setLocalDate] = useState(currentDate)

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const durationOptions = [
        "15 minutes", "30 minutes", "45 minutes", "1 hour",
        "1 hour 30 minutes", "2 hours", "2 hours 30 minutes", "3 hours"
    ];

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
        if (!localDate) return;

        const now = new Date();
        const isToday = localDate.toDateString() === now.toDateString();

        const interval = getDurationInMinutes(duration);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = isToday ? roundUpToNearest(currentMinutes, interval) : 0;
        const endOfDay = 24 * 60;

        const slotList = [];
        for (let start = startMinutes; start + interval <= endOfDay; start += interval) {
            slotList.push(formatTime(start));
        }

        setTimeSlots(slotList);
    }, [duration, localDate]);

    const handlePrev = () => {
        const prevDate = new Date(localDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setLocalDate(prevDate);
    };

    const handleNext = () => {
        const nextDate = new Date(localDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setLocalDate(nextDate);
    };

    // Extract just the start time from "12:00 PM - 12:30 PM"
    const getStartTime = (timeRange) => timeRange.split('-')[0].trim();

    const roundDownToNearest = (minutes, interval) => Math.floor(minutes / interval) * interval;


    return (
        <div id='days' className='content'>

            <div id="date-wrapper">
                <button id='prev-date' onClick={handlePrev}><BsChevronLeft size={20} color='rgb(100, 100, 100)' strokeWidth={1} /></button>
                <span>{format(localDate, "EEEE do MMM yyyy")}</span>
                <button id='next-date' onClick={handleNext}><BsChevronRight size={20} color='rgb(100, 100, 100)' strokeWidth={1} /></button>
            </div>

            <div id="duration-dropdown">
                <span id='duration-label'>Duration</span>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                    {durationOptions.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
            </div>

            <div id='day-timeslots'>
                {timeSlots.map((slot, i) => {
                    const matchingAppointments = appointments.filter(appt => {
                        const apptDate = new Date(appt.selectedDate);
                        if (apptDate.toDateString() !== localDate.toDateString()) return false;
                    
                        // Convert appointment start time to total minutes
                        const startTimeStr = getStartTime(appt.selectedTimeSlot);
                        const [time, modifier] = startTimeStr.split(' ');
                        let [hour, minute] = time.split(':').map(Number);
                        if (modifier === "PM" && hour !== 12) hour += 12;
                        if (modifier === "AM" && hour === 12) hour = 0;
                    
                        const totalMinutes = hour * 60 + minute;
                        const interval = getDurationInMinutes(duration);
                        const slotMinutes = roundDownToNearest(totalMinutes, interval);
                    
                        // Compare with current slot
                        const formattedSlot = formatTime(slotMinutes);
                    
                        return formattedSlot === slot;
                    });
                    

                    return (
                        <div key={i} className={`day-time-slot`}>
                            <div className='time-slot-label'>{slot}</div>
                            <div className='day-appointment-wrapper'>
                                {matchingAppointments.map((appt, idx) => (
                                    <div key={idx} className="day-appointment">
                                        <span><b>Type: </b>{appt.appointmentType}</span>
                                        <span><b>Title: </b>{appt.appointmentTitle}</span>
                                        <span><b>Time: </b>{appt.selectedTimeSlot} , {appt.selectedTimezone}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    )
}

export default Days
