import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'

// importing pages
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<Home />}></Route>
                <Route path='/dashboard' element={<Dashboard />}></Route>
            </Routes>
        </Router>
    )
}

export default App
