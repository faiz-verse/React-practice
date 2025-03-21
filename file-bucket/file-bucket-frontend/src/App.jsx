// necessary imports
import { useEffect, useState, useRef } from "react";
// for unique urls (npm install nanoid)
import { nanoid } from "nanoid";
// for enabling routing (npm install react-router-dom)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// importing css files
import "./App.css";

// importing pages
import Home from "./pages/Home.jsx";
import Files from "./pages/Files.jsx";

// importing pages css
import "./pages/Home.css";
import "./pages/Files.css";

function App() {
    const [uniqueURL, setUniqueURL] = useState("");
    const [createURL, setCreateURL] = useState("");

    const inputRef = useRef();

    const generateShortUniqueURL = () => {
        setUniqueURL(nanoid(15)); // Generates a random 15-character string
    };

    useEffect(() => {
        generateShortUniqueURL()
    }, []);

    return (
        <>
            <Router>
                <Routes>
                    {/* Route for home */}
                    <Route path='/' element={
                        <Home
                            uniqueURL={uniqueURL}
                            createURL={createURL}
                            setCreateURL={setCreateURL}
                            inputRef={inputRef} />
                    }></Route>
                    {/* Route for Files */}
                    <Route path='/:url' element={
                        <Files/>
                    }></Route>
                </Routes>
            </Router >
        </>
    );
}

export default App;
