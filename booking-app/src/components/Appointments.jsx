import React from 'react'

import { format } from 'date-fns';

import './Appointments.css'

function Appointments({ appointments, setAppointments }) {
    return (
        <div id='appointments' className='content'>
            {appointments.map((appt, index) => {
                return (
                    <div className='appt' key={index}>
                        <div className='appt-wrapper-1'>
                            <div className='appt-date'><span>{format(appt.selectedDate, "EEEE do MMM yyyy")}</span></div>

                        </div>

                        <div className='appt-wrapper-2'>
                            <div className='appt-content-wrapper'>
                                <span><b>Type: </b>{appt.appointmentType}</span>
                                <span><b>Title: </b>{appt.appointmentTitle}</span>
                            </div>
                            <div className='appt-content-wrapper'>
                                <span><b>Duration: </b>{appt.duration}</span>
                                <span><b>Time Slot: </b>{appt.selectedTimeSlot}</span>
                                <span><b>Time Zone: </b>{appt.selectedTimezone}</span>
                            </div>
                        </div>

                    </div>
                );
            })}

        </div>
    )
}

export default Appointments
