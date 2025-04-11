import React,{ useState, useEffect } from 'react'
import { color, motion } from "framer-motion";
// import { Link } from 'react-router-dom'  //WAY 1
import { useNavigate } from 'react-router-dom'  //WAY 2

import './Home.css'

function Home() {

    // TO enable navigation WAY 2
    const navigate = useNavigate()

    return (
        <div id='home'>
            <div id='nav'>
                <div id='title'>
                    <img src="/vite.svg" alt="logo" />
                    <span><span style={{color: 'dodgerblue'}}>Appointment Booking</span> App</span>
                </div>
                {/* <div id='login-options'>
                    <span>Sign-up</span>
                    <button>Login</button>
                </div> */}
            </div>

            <div id="home-content">
                <span><svg width="600" height="130" viewBox="0 0 600 130">
                    <motion.text
                        x="50"
                        y="100"
                        fontSize="90"
                        fontFamily="Arial, sans-serif"
                        fill="none"
                        stroke="dodgerblue"
                        strokeWidth="2"
                        strokeDasharray="600"
                        strokeDashoffset="600"
                        initial={{ strokeDashoffset: 600 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 5, ease: "easeInOut" }}
                    >
                        Booking App
                    </motion.text>
                </svg></span>
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta ullam, repudiandae adipisci, pariatur obcaecati ex reiciendis expedita illo doloribus earum a dolore sit nostrum excepturi minima dolorum quod asperiores? Voluptatibus voluptatem reiciendis qui vitae possimus?</p>
                {/* <Link to='/dashboard'><button>Getting started</button></Link> */}
                <button onClick={()=> navigate('/dashboard')}>Getting started</button>

            </div>
        </div>
    )
}

export default Home
