import { useEffect, useState } from 'react';
import { BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import './Week.css';

function Week({ currentDate, setCurrentDate, appointments }) {
    const [localDate, setLocalDate] = useState(currentDate);

    useEffect(() => {
        setCurrentDate(localDate);
    }, [localDate]);

    const addOrSubDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const getCurrentWeekDates = (date = localDate) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day.toISOString().split("T")[0];
        });
    };

    const week = getCurrentWeekDates();

    const timeSlots = Array.from({ length: 24 }, (_, hour) => {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        return `${formattedHour}:00 ${ampm}`;
    });

    const getRoundedHourSlot = (timeStr) => {
        const [time, ampm] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const totalMinutes = hours * 60 + minutes;
        const roundedHourMinutes = Math.floor(totalMinutes / 60) * 60;

        const roundedHour = Math.floor(roundedHourMinutes / 60) % 24;
        const formattedHour = roundedHour % 12 === 0 ? 12 : roundedHour % 12;
        const newAmpm = roundedHour < 12 ? 'AM' : 'PM';

        return `${formattedHour}:00 ${newAmpm}`;
    };

    const appointmentMap = {};
    appointments.forEach((appt) => {
        const apptDate = new Date(appt.selectedDate);
        const formatted = apptDate.toLocaleString('en-US', {
            timeZone: appt.selectedTimezone.split(' - ')[1] || 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const [mm, dd, yyyy] = formatted.split('/');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const originalStartTime = appt.selectedTimeSlot.split(' - ')[0].trim();
        const roundedTime = getRoundedHourSlot(originalStartTime);
        const key = `${roundedTime}-${formattedDate}`;

        if (!appointmentMap[key]) appointmentMap[key] = [];
        appointmentMap[key].push(appt);
    });

    return (
        <div id='week' className='content'>
            <div id='time-slot-label'>Timings</div>

            <div id='week-time-slots'>
                {timeSlots.map((slot, index) => (
                    <div className='week-time-slot' key={index}>{slot}</div>
                ))}
            </div>

            <div id='week-days-header'>
                <button id='button-left' onClick={() => setLocalDate(addOrSubDays(localDate, -7))}>
                    <BsChevronLeft size={24} color='gray' strokeWidth={1} />
                </button>

                {week.map((currentDay) => {
                    const date = new Date(currentDay);
                    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const dayOfMonth = String(date.getDate()).padStart(2, '0');
                    return (
                        <div className='week-day' key={currentDay}>
                            <div>
                                <span>{dayOfWeek}</span>
                                <span>{dayOfMonth}</span>
                            </div>
                        </div>
                    );
                })}

                <button id='button-right' onClick={() => setLocalDate(addOrSubDays(localDate, 7))}>
                    <BsChevronRight size={24} color='gray' strokeWidth={1} />
                </button>
            </div>

            <div id='week-appointments-wrapper'>
                {timeSlots.map((slot) =>
                    week.map((day) => {
                        const key = `${slot}-${day}`;
                        const matchingAppointments = appointmentMap[key] || [];

                        return (
                            <div
                                key={`${slot}-${day}`}
                                className={`week-appointment ${matchingAppointments.length === 1 ? 'has-appointment' : ''} ${matchingAppointments.length > 1 ? 'multiple' : ''}`}
                            >
                                {matchingAppointments.map((appt, idx) => (
                                    <div
                                        key={idx}
                                        className={`appointment-item ${matchingAppointments.length > 1 ? 'multiple' : ''}`}
                                        style={matchingAppointments.length > 1 ? {
                                            top: `-${idx * 2}px`,
                                            left: `${idx * 2}px`,
                                            position: 'absolute',
                                            zIndex: matchingAppointments.length - idx,
                                        } : {}}
                                    >
                                        <span>Title: {appt.appointmentTitle}</span>
                                        <span>Timing: {appt.selectedTimeSlot}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Week;
