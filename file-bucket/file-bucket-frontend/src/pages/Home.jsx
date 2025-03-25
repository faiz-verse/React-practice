import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from 'react-icons/fi';
import { HiCursorClick } from 'react-icons/hi';

function Home({ uniqueURL, createURL, setCreateURL, inputRef }) {

    const API_URL = import.meta.env.VITE_API_URL; // to communicate with the deployed backend server

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();  // ✅ Initialize React Router navigation

    // Function to create a new bucket by sending a request to the backend
    const handleCreateBucket = async (createBucketURL) => {
        if (createBucketURL.length <= 3) return; // Ensure the URL is valid

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/buckets/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: createBucketURL }),
            });

            const data = await response.json();
            if (data.success) {
                navigate(`/${data.url}`);  // ✅ Navigate only after bucket is successfully created
            } else {
                setError("Failed to create bucket. Try again.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="home-page">
            <h1 id="title">File Bucket</h1>

            {/* Main heading */}
            <span id="info">Store & Share your files securely in few steps without registration</span>

            <div id="points-wrapper">

                {/* point 1 */}
                <div className="point">
                    <div className="point-content">Generated link is <span id="unique-url" onClick={() => handleCreateBucket(uniqueURL)}>{uniqueURL}</span></div>
                    <div className="point-content">Click <HiCursorClick style={{ marginLeft: '5px' }} size={20} color='white' /> <FiChevronRight size={20} color='white' /></div><div>Visit created bucket <FiChevronRight size={20} color='white' /></div><div>Start uploading your files</div>
                </div>

                {/* point 2 */}
                <div className="point">
                    <div className="point-content">After you visit & complete your uploads, make sure that you copy and keep your link safe for future.</div>
                </div>

                {/* point 3 */}
                <div className="point">
                    <div className="point-content">Create your own link</div>
                    <div className="point-content"><div id="create-url" onClick={() => inputRef.current.focus()}>
                        https://file-bucket.onrender.com/ <input
                            type="text"
                            ref={inputRef}
                            placeholder="type your link here"
                            value={createURL}
                            onChange={(e) => setCreateURL(e.target.value.replace(/\s+/g, "-"))} // Replace spaces with hyphens
                        />
                    </div></div>
                    <div>
                        {/* Create Bucket button, calls handleCreateBucket when clicked */}
                        <button id="visit-url" disabled={createURL.length <= 3 || loading} onClick={() => handleCreateBucket(createURL)}>

                            {loading ? "Creating..." : "Create/Visit bucket"}
                        </button></div>

                    {/* Display warning if URL is too short */}
                    {createURL.length <= 3 && <div className="point-content" id="disabled-info">Link must contain at least 3 characters</div>}

                    {/* Display error message if bucket creation fails */}
                    {error && <div className="point-content" id="error-message">{error}</div>}
                </div>
            </div>
        </div>
    );
}

export default Home;