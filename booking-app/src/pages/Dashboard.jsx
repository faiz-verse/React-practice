import React, { useEffect, useState } from 'react';

import { BsPlus, BsPerson, BsChevronRight, BsChevronLeft } from "react-icons/bs";

import './Dashboard.css'

// importing components
import Month from '../components/Month'
import Week from '../components/Week'
import Days from '../components/Days'
import Appointments from '../components/Appointments'
import AppointmentModal from '../components/AppointmentModal'

function Dashboard() {

    const [activeView, setActiveView] = useState("month")
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrev = () => {
        const prevMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        setCurrentDate(new Date(prevMonth)); // update state with a new Date instance
    };
    
      const handleNext = () => {
        const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        setCurrentDate(new Date(nextMonth));
    };

    // FOR APPOINTMENTS
    const [toggleAppointmentModal, setToggleAppointmentModal] = useState(false)

    const [appointments, setAppointments] = useState([])

    // Load todos from local storage when the app starts
    useEffect(()=> {
        const storedAppointments = localStorage.getItem('appointments');
        if (storedAppointments) {
            setAppointments(JSON.parse(storedAppointments))
            console.log("✅ Updated stored appointments \n", JSON.parse(storedAppointments))
        }
    }, [])

    return (
        <div id='dashboard'>

            {/* NAV */}
            <div id='dashboard-nav'>
                <div id="container-options">
                    <div className="option" style={{background: (activeView === "month")? "dodgerblue": "rgb(232, 246, 255)", color: (activeView === "month")? "white": "black"}} onClick={() => setActiveView("month")}>Month</div>
                    <div className="option" style={{pointerEvents: 'auto',background: (activeView === "week")? "dodgerblue": "rgb(232, 246, 255)", color: (activeView === "week")? "white": "black"}} onClick={() => setActiveView("week")}>Week</div>
                    <div className="option" style={{pointerEvents: 'none',background: (activeView === "day")? "dodgerblue": "rgb(232, 246, 255)", color: (activeView === "day")? "white": "black"}} onClick={() => setActiveView("day")}>Day</div>
                    <div className="option" style={{pointerEvents: 'none',background: (activeView === "appointments")? "dodgerblue": "rgb(232, 246, 255)", color: (activeView === "appointments")? "white": "black"}} onClick={() => setActiveView("appointments")}>Appointments</div>
                </div>

                <div id='container-date'>
                    <button id='prev' onClick={handlePrev}><BsChevronLeft size={20} color='rgb(100, 100, 100)' strokeWidth={1}/></button>
                    <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button id='next' onClick={handleNext}><BsChevronRight size={20} color='rgb(100, 100, 100)' strokeWidth={1}/></button>
                </div>

                <div id='buttons-container'>
                    <button id='new-appointment' onClick={()=> setToggleAppointmentModal(!toggleAppointmentModal)}> <BsPlus size={28} color='rgb(100, 100, 100)'/> New Appointment</button>
                    <button id='profile-btn' style={{pointerEvents: 'none'}}><BsPerson size={28} color='rgb(100, 100, 100)'/></button>
                </div>
            </div>

            {/* CALENDAR SECTIONS */}
            <div id="calendar-content">
                {activeView === "month" && <Month currentDate={currentDate}/>}
                {activeView === "week" && <Week/>}
                {activeView === "day" && <Days/>}
                {activeView === "appointments" && <Appointments/>}
            </div>

            <AppointmentModal toggleAppointmentModal={toggleAppointmentModal} setToggleAppointmentModal={setToggleAppointmentModal} monthNames={monthNames} appointments={appointments} setAppointments={setAppointments}/>

        </div>
    )
}

export default Dashboard
