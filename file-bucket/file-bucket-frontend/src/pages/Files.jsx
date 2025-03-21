import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCopy, FiUpload, FiPlus, FiTrash, FiChevronDown, FiDownload, FiInfo, FiX } from "react-icons/fi";
import {
    FaFile, FaFileAlt, FaFileArchive, FaFileAudio, FaFileCode, FaFileCsv,
    FaFileExcel, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileVideo, FaFileWord
} from "react-icons/fa"; // react file icons
import { CiFileOff, CiFileOn } from "react-icons/ci"; // react file icons

import QRCode from "react-qr-code";

import PropertiesModal from "../components/propertiesModal.jsx";
import '../components/PropertiesModal.css';

function Files() {

    const API_URL = import.meta.env.VITE_API_URL; // to communicate with the deployed backend server

    const { url } = useParams(); // getting url as parameter
    const [copied, setCopied] = useState(false); // for copy link feature
    const [files, setFiles] = useState([]); // Store fetched files
    const [uploading, setUploading] = useState(false); // for showing upload status
    const [error, setError] = useState(""); // for showing error
    const fileInputRef = useRef(null);
    const navigate = useNavigate(); // to route without reloading page

    const [moreToggle, setMoreToggle] = useState(false); // to toggle more options
    // Toggle function for a specific file index
    const toggleMoreOptions = (index) => {
        setMoreToggle(prevState => ({
            ...prevState,
            [index]: !prevState[index] // Toggle only the clicked row
        }));
    };

    const fullURL = `https://file-bucket.onrender.com/${url}`;

    // State for Countdown Timers
    const [expiresAt, setExpiresAt] = useState(null);
    const [emptyTerminationAt, setEmptyTerminationAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [emptyTimeLeft, setEmptyTimeLeft] = useState("");

    const [createdAt, setCreatedAt] = useState(null);
    const [timeActive, setTimeActive] = useState("");

    // Fetch bucket details and files on mount
    useEffect(() => {
        fetchBucketAndFiles();
    }, [url]);

    // ✅ To fetch all bucket and files
    const [bucketStatus, setBucketStatus] = useState(null); // New state to track bucket status
    const [loading, setLoading] = useState(true); // Track loading state

    const fetchBucketAndFiles = async () => {
        try {
            const bucketResponse = await fetch(`${API_URL}/api/buckets/${url}`);
            const bucketData = await bucketResponse.json();

            if (!bucketData.success && bucketData.status === "not_found") {
                setError("❌ Bucket does not exist! Please create a new one.");
                const userWantsCreate = confirm(`Bucket does not exists!\nWould you like to create one?`);
                if (userWantsCreate) {
                    await createNewBucket()
                }

                setLoading(false);
                return;
            }

            // ✅ Update expiration and status
            setExpiresAt(new Date(bucketData.expiresAt));
            setEmptyTerminationAt(bucketData.emptyTerminationAt ? new Date(bucketData.emptyTerminationAt) : null);

            setCreatedAt(new Date(bucketData.createdAt)); // ✅ Store bucket creation time

            if (bucketData.status === "expired" || bucketData.status === "destroyed") {
                setError(`❌ Bucket has been ${bucketData.status}!`);
                setBucketStatus(bucketData.status);

                const userWantsRestore = confirm(`Bucket has been ${bucketData.status}!\nWould you like to re-create it?`);
                if (userWantsRestore) {
                    await restoreBucket();  // ✅ Correct approach! Restore the bucket instead of creating a new one.
                }

                setLoading(false);
                return;
            }

            // ✅ Bucket is active
            setBucketStatus("active");
            const filesResponse = await fetch(`${API_URL}/api/files/${url}`);
            const filesData = await filesResponse.json();
            setFiles(filesData.success ? filesData.files : []);

            setLoading(false); // Stop loading

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("❌ Server error. Try again later.");
            setBucketStatus("error");
            setLoading(false);
        }
    };

    // ✅ Restore bucket
    const restoreBucket = async () => {
        try {
            const response = await fetch(`${API_URL}/api/buckets/${url}/restore`, {
                method: "PUT",  // ✅ Use PUT request to update existing bucket
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (data.success) {
                alert("Bucket has been re-created!");
                fetchBucketAndFiles();  // ✅ Reload bucket details after restoring
            } else {
                setError("❌ Failed to re-create bucket.");
            }
        } catch (err) {
            console.error("Error restoring bucket:", err);
            setError("❌ Server error. Try again later.");
        }
    };


    // ✅ Create a New Bucket When Redirecting
    const createNewBucket = async () => {
        try {
            setError(""); // ✅ Clear error before creating

            const response = await fetch(`${API_URL}/api/buckets/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();
            if (data.success) {
                navigate(`/${data.url}`);
                fetchBucketAndFiles();  // ✅ Reload bucket details after restoring
            } else {
                setError("❌ Failed to create new bucket.");
            }
        } catch (err) {
            setError("❌ Server error. Try again later.");
        }
    };


    // Function to calculate the time left
    const calculateTimeLeft = (endTime) => {
        if (!endTime) return "";

        const diff = endTime - new Date();
        if (diff <= 0) {
            return "Expired";
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days > 0 ? days + "d" : ""} ${hours > 0 ? hours + "h" : ""} ${minutes > 0 ? minutes + "m" : ""} ${seconds}s`.trim();
    };

    // calculate active time
    const calculateTimeActive = (startTime) => {
        if (!startTime) return "0s"; // If no startTime, return default

        const now = new Date();
        const diff = now - startTime; // Get the difference in milliseconds

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days > 0 ? days + "d" : ""} ${hours > 0 ? hours + "h" : ""} ${minutes > 0 ? minutes + "m" : ""} ${seconds}s`.trim();
    };


    // ✅ Use countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft(expiresAt));
            setEmptyTimeLeft(calculateTimeLeft(emptyTerminationAt));
            setTimeActive(calculateTimeActive(createdAt)); // ✅ Active time counter

            // 🚨 If expired, disable actions
            if (expiresAt && new Date() > expiresAt) {
                setUploading(false);
                setError("❌ Bucket expired! Please create a new one.");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, emptyTerminationAt, createdAt]);

    // Using coutdown for file time
    const [fileTimes, setFileTimes] = useState({});

    useEffect(() => {
        const updateFileTimes = () => {
            setFileTimes(prevTimes => {
                const newTimes = { ...prevTimes };

                files.forEach(file => {
                    if (file.uploadedAt) {
                        newTimes[file._id] = calculateTimeActive(new Date(file.uploadedAt));
                    }
                });

                return newTimes;
            });
        };

        updateFileTimes(); // Initial calculation
        const interval = setInterval(updateFileTimes, 1000); // Update every second

        return () => clearInterval(interval);
    }, [files]);


    // Function to copy URL to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullURL).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => console.error("Failed to copy:", err));
    };

    // Open file explorer
    const openFileExplorer = () => {
        fileInputRef.current.click();
    };

    // Handle file upload
    const handleFileChange = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length > 0) {
            await uploadFiles(selectedFiles);
        }
    };

    // ✅ Upload files and refresh file list
    const uploadFiles = async (selectedFiles) => {
        setUploading(true);
        setError("");

        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("files", file));
        formData.append("bucketUrl", url);

        try {
            const response = await fetch(`${API_URL}/api/files/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                alert("Files uploaded successfully!");
                setEmptyTerminationAt(null); // Remove empty bucket countdown
                fetchBucketAndFiles(); // ✅ Refresh file list after upload
            } else {
                setError("File upload failed. Try again.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
            console.error("Error:", err);
        } finally {
            setUploading(false);
        }
    };

    // ❌ Function to delete the bucket
    const deleteBucket = async () => {

        try {
            const response = await fetch(`${API_URL}/api/buckets/${url}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                alert("Bucket destroyed successfully!");
                navigate("/"); // Redirect to home
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Error destroying bucket:", err);
            setError("Server error. Please try again later.");
        }
    };

    // formatFileSize Function
    const formatFileSize = (sizeInBytes) => {
        if (sizeInBytes >= 1024 * 1024 * 1024) {  // 1 GB = 1024 * 1024 * 1024 bytes
            return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        } else if (sizeInBytes >= 1024 * 1024) {  // 1 MB = 1024 * 1024 bytes
            return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
        } else if (sizeInBytes >= 1024) {  // 1 KB = 1024 bytes
            return Math.round(sizeInBytes / 1024) + " KB";
        } else {
            return sizeInBytes + " B"; // Bytes (B) case
        }
    };

    // function to download all files
    const handleDownloadAllFiles = async () => {
        try {
            const downloadURL = `${API_URL}/api/files/download-all/${url}`;

            // ✅ Create a hidden link to trigger download
            const link = document.createElement("a");
            link.href = downloadURL;
            link.target = "_self";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("✅ All files are being downloaded as a ZIP.");
        } catch (error) {
            console.error("❌ Failed to download ZIP:", error);
        }
    };


    // ✅ function to download files
    const handleDownloadFile = async (file) => {
        try {
            let downloadURL = file.filePath;
            let originalFileName = file.fileName.replace(/^\d{13}-/, ""); // ✅ Remove timestamp (13-digit Unix time)

            // ✅ If the file is from Cloudinary, force correct download
            if (file.provider === "Cloudinary") {
                downloadURL = file.filePath.replace("/upload/", "/upload/fl_attachment/");
                console.log("🔍 Cloudinary Download URL:", downloadURL);

                // ✅ Create a hidden link to trigger download
                const link = document.createElement("a");
                link.href = downloadURL;
                link.target = "_self"; // ✅ Ensure it triggers download directly
                link.setAttribute("download", originalFileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log("✅ Cloudinary File Download Triggered:", file.fileName);
                return;
            }

            // ✅ If the file is from Google Drive, open in a new tab
            if (file.provider === "Google Drive") {
                console.log("Inside the if google drive");
                const fileIdMatch = file.filePath.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
                const fileId = fileIdMatch ? fileIdMatch[1] : null;
                if (fileId) {
                    console.log("Inside the if google drive fileId = true");
                    downloadURL = `https://drive.google.com/uc?export=download&id=${fileId}`;
                    // ✅ Open Google Drive files directly in a new tab
                    window.open(downloadURL, "_blank");
                }
            }

        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const [toggleModal, setToggleModal] = useState(false);
    const [fileProperties, setFileProperties] = useState([]);

    // for identifying file icons
    const getFileIcon = (mimeType) => {
        const mimeMapping = {
            "text/plain": <FaFileAlt />,
            "text/csv": <FaFileCsv />,
            "text/html": <FaFileCode />,
            "application/json": <FaFileCode />,
            "application/xml": <FaFileCode />,

            "application/pdf": <FaFilePdf />,
            "application/msword": <FaFileWord />,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": <FaFileWord />,
            "application/vnd.ms-excel": <FaFileExcel />,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": <FaFileExcel />,
            "application/vnd.ms-powerpoint": <FaFilePowerpoint />,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": <FaFilePowerpoint />,

            "image/jpeg": <FaFileImage />,
            "image/png": <FaFileImage />,
            "image/gif": <FaFileImage />,
            "image/svg+xml": <FaFileImage />,
            "image/webp": <FaFileImage />,

            "audio/mpeg": <FaFileAudio />,
            "audio/wav": <FaFileAudio />,
            "audio/ogg": <FaFileAudio />,

            "video/mp4": <FaFileVideo />,
            "video/webm": <FaFileVideo />,
            "video/x-msvideo": <FaFileVideo />,

            "application/zip": <FaFileArchive />,
            "application/x-rar-compressed": <FaFileArchive />,
            "application/x-7z-compressed": <FaFileArchive />,

            "application/octet-stream": <CiFileOff /> // Unknown file type
        };

        return mimeMapping[mimeType] || <FaFile />; // Default icon if MIME type not found
    };

    // handle file opening
    const handleOpenFile = async (file) => {
        try {
            let fileURL = file.filePath;

            // ✅ If Cloudinary file is NOT an image, use Google Docs Viewer
            if (file.provider === "Cloudinary") {
                console.log("🔍 Cloudinary File Detected:", fileURL);

                if (!fileURL.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                    console.log("📂 Non-image file detected, using Google Docs Viewer");
                    fileURL = `https://docs.google.com/gview?url=${encodeURIComponent(fileURL)}`;
                }

                console.log("🌐 Opening Cloudinary File:", fileURL);
                window.open(fileURL, "_blank");
                return;
            }

            // ✅ If Google Drive file, open in Google Drive Viewer
            if (file.provider === "Google Drive") {
                console.log("Inside Google Drive open logic");
                const fileIdMatch = file.filePath.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
                const fileId = fileIdMatch ? fileIdMatch[1] : null;
                if (fileId) {
                    console.log("Google Drive file detected, opening in a new tab");
                    fileURL = `https://drive.google.com/file/d/${fileId}/view`;
                }
            }

            // ✅ Open file in a new tab
            window.open(fileURL, "_blank");
            console.log("✅ File Opened:", file.fileName);

        } catch (error) {
            console.error("Failed to open file:", error);
        }
    };


    // Handling delete file
    const handleDeleteAllFiles = async () => {
        try {
            const response = await fetch(`${API_URL}/api/files/delete-all/${url}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                alert("All files deleted successfully!");
                setFiles([]); // ✅ Clear all files from state
            } else {
                alert("Failed to delete files.");
            }
        } catch (error) {
            console.error("❌ Error deleting all files:", error);
        }
    };

    const handleDeleteFile = async (file) => {
        try {
            const response = await fetch(`${API_URL}/api/files/delete/${file._id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                alert("File deleted successfully!");
                setFiles(files.filter(f => f._id !== file._id)); // ✅ Remove from state
            } else {
                alert("Failed to delete file.");
            }
        } catch (error) {
            console.error("❌ Error deleting file:", error);
        }
    };

    const getStorageUsed = () => {
        let sumStorage = 0
        files.forEach(file => {
            sumStorage += Number(file.fileSize)
        });
        return sumStorage
    }


    return (
        <>

            <h1
                style={{
                    transition: 'filter 0.4s ease-in-out, opacity 0.4s ease-in-out',
                    filter: toggleModal ? 'blur(4px)' : 'blur(0px)',
                    pointerEvents: toggleModal ? 'none' : 'auto', // ❌ Disables clicks when true
                    opacity: toggleModal ? 0.6 : 1 // 🛑 Slightly fade out when disabled
                }}
            >File Bucket</h1>

            <span
                style={{
                    transition: 'filter 0.4s ease-in-out, opacity 0.4s ease-in-out',
                    filter: toggleModal ? 'blur(4px)' : 'blur(0px)',
                    pointerEvents: toggleModal ? 'none' : 'auto', // ❌ Disables clicks when true
                    opacity: toggleModal ? 0.6 : 1 // 🛑 Slightly fade out when disabled
                }}
            >Bucket URL - <b>{fullURL}</b></span>

            {/* Buttons for actions */}
            <div id="buttons-container"
                style={{
                    transition: 'filter 0.4s ease-in-out, opacity 0.4s ease-in-out',
                    filter: toggleModal ? 'blur(4px)' : 'blur(0px)',
                    pointerEvents: toggleModal ? 'none' : 'auto', // ❌ Disables clicks when true
                    opacity: toggleModal ? 0.6 : 1 // 🛑 Slightly fade out when disabled
                }}
            >
                <button id="create-new-button" onClick={() => navigate(`/`)}>
                    <FiPlus size={20} color="white" />Create new bucket
                </button>
                <button id="destroy-button" onClick={() => {
                    if (!confirm("Are you sure you want to delete this bucket?\nIf you have uploaded any files, they will be deleted as well!")) {
                        return;
                    }
                    deleteBucket();
                }}>
                    <FiTrash size={20} color="white" />Destroy bucket
                </button>
            </div>

            <div style={{ height: "auto", width: "fit-content", fontWeight:'500' , position: "absolute", top: "250px", right: "70px"}}>Scan to Share!</div>
            {/* BucketQR code */}
            <div id="qrcode" style={{ height: "auto", margin: "0 auto", maxWidth: 120, width: "100%", position: "absolute", top: "120px", right: "60px" }}>
                <QRCode
                    bgColor="transparent"
                    fgColor="white"
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={"https://file-bucket.onrender.com/" + url}
                    viewBox={`0 0 256 256`}
                />
            </div>

            {loading ? ( // 🔄 Show loading while waiting for the bucket status
                <div id='loading-message'>⏱ Loading...</div>
            ) : bucketStatus !== "active" ? ( // 🚨 Show error only if bucket is expired/destroyed
                <div id='error-message' style={{ color: "red" }}>{error}</div>
            ) : (
                <div
                    style={{
                        transition: 'filter 0.4s ease-in-out, opacity 0.4s ease-in-out',
                        filter: toggleModal ? 'blur(4px)' : 'blur(0px)',
                        pointerEvents: toggleModal ? 'none' : 'auto', // ❌ Disables clicks when true
                        opacity: toggleModal ? 0.6 : 1 // 🛑 Slightly fade out when disabled
                    }}
                >
                    <div id="bucket-info">This bucket was created <b>{timeActive}</b> ago</div>

                    {/* Copy URL container */}
                    <div id="copy-container">
                        <div id="copy-url">{fullURL}</div>
                        <div id="copy-icon" onClick={copyToClipboard}>
                            <FiCopy size={20} id="fi-copy-icon" />
                        </div>
                        <div id="copy-notifier-wrapper">{copied && <div id="copy-notifier">Copied!</div>}</div>
                        <div id="copied-info">Make sure you copy and remember the link for future!</div>
                    </div>

                    {/* Countdown Timers */}
                    <div id="countdown-wrapper">
                        {timeLeft && (
                            <div id="main-expiry">
                                ⏳ <b>Bucket Expiration: </b>
                                {timeLeft.includes("0h 0m 0s") ? <b>Expired!</b> : <>Bucket will be destroyed in <b>{timeLeft}</b></>}
                            </div>

                        )}
                        {(emptyTimeLeft && files.length <= 0) && (
                            <div id="empty-expiry">
                                ⚠️ <b>Inactive Bucket Deletion: </b>
                                {emptyTimeLeft.includes("0h 0m 0s") ? <b>Expired!</b> : <>Bucket will be destroyed in <b>1 hour</b> if the bucket stays empty!</>}
                            </div>
                        )}
                    </div>

                    <div id="storageUsed" style={{ marginTop: '10px' }}> <b>📂 Bucket size: {formatFileSize(getStorageUsed())}</b> {(getStorageUsed() > 0) ? "(" + getStorageUsed() + " B)" : ""}</div>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

                    {/* buttons */}
                    <div id="files-buttons-container">
                        {/* Upload Button */}
                        <button id="upload-files-button" onClick={openFileExplorer} disabled={uploading}>
                            <FiUpload size={20} color="white" />
                            {uploading ? "Uploading..." : files.length > 0 ? "Upload more files" : "Upload files"}
                        </button>
                        {/* download files Button */}
                        <button id="download-files-button" onClick={() => files.length > 1 ? handleDownloadAllFiles() : handleDownloadFile(files[0])}>
                            <FiDownload size={20} color="white" />
                            {files.length > 1 ? "Download files" : "Download file"}
                        </button>
                        {/* delete files Button */}
                        <button id="delete-files-button" onClick={() => files.length > 1 ? handleDeleteAllFiles() : handleDeleteFile(files[0])}>
                            <FiTrash size={20} color="white" />
                            {files.length > 1 ? "Delete files" : "Delete file"}
                        </button>
                    </div>

                    {/* Display Uploaded Files */}
                    <h3 style={{ marginBottom: "0px" }}>Uploaded Files:</h3>
                    <div id="uploaded-files">
                        <div id="file-item-header">
                            <span className="file-header">File Name</span>
                            <span className="file-header">Content Type</span>
                            <span className="file-header">File Size</span>
                            <span className="file-header">Uploaded</span>
                            <span className="file-header">More</span>
                        </div>

                        {files.length > 0 ? (
                            [...files].reverse().map((file, index) => (
                                <div key={index} className="file-item">
                                    <span className="file-info file-name" onClick={() => handleOpenFile(file)}
                                        style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        {getFileIcon(file.fileType)}
                                        {file.fileName}
                                    </span>
                                    {/* <span className="file-info file-name">{file.fileName}</span> */}
                                    <span className="file-info file-type">{file.fileType}</span>
                                    <span className="file-info file-size">{formatFileSize(file.fileSize)}</span>
                                    <span className="file-info file-upload">{fileTimes[file._id] || "Just now"} ago</span>


                                    {/* More Options Dropdown */}
                                    {moreToggle[index] && (
                                        <div className="more-option-wrapper">
                                            <div className="more-option">
                                                <div className="download-option" onClick={() => { handleDownloadFile(file); setMoreToggle(false) }}><FiDownload size={20} color="yellowgreen" />Download file</div>
                                                <div className="properties-option" onClick={() => { setToggleModal(true); setMoreToggle(false); setFileProperties(file) }}><FiInfo size={20} color="cornflowerblue" />File properties</div>
                                                <div className="delete-option" onClick={() => { handleDeleteFile(file); setMoreToggle(false) }}><FiTrash size={20} color="tomato" />Delete file</div>
                                            </div>
                                        </div>
                                    )}

                                    <span className="file-info file-more">
                                        {/* Toggle Icon */}
                                        <div
                                            className="more-option-icon"
                                            style={{ rotate: moreToggle[index] ? "90deg" : "0deg" }}
                                            onClick={() => toggleMoreOptions(index)}
                                        >
                                            <FiChevronDown className='fi-more-icon' size={24} />
                                        </div>
                                    </span>

                                </div>
                            ))
                        ) : (
                            <div>
                                <p
                                    style={{ position: 'relative', top: '140px' }}
                                >No files uploaded yet.</p>
                                {/* empty bucket svg */}
                                <svg width="140" height="140" viewBox="0 0 305 369" fill="none" xmlns="http://www.w3.org/2000/svg"
                                    style={{ position: 'relative', top: '-50px' }}
                                >
                                    <g id="Empty Bucket">
                                        <g id="bucket">
                                            <path id="Back" d="M4.42299 165.334C2.6133 167.039 3.54617 170.051 6.01193 170.367C69.7231 178.55 267.444 176.86 300.959 170.598C303.016 170.214 303.396 167.953 301.889 166.5L265.905 131.802C264.042 130.004 261.553 129 258.964 129H46.9679C44.4193 129 41.9668 129.973 40.1116 131.72L4.42299 165.334Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2" />
                                            <path id="Front" d="M2.99914 169C-2.00085 178 310.5 179 302.999 169L264.607 360.961C263.672 365.635 259.568 369 254.801 369H51.1972C46.4304 369 42.3262 365.635 41.3914 360.961L2.99914 169Z" fill="white" fillOpacity="0.5" stroke="white" strokeWidth="2" />
                                            <path id="Note" d="M65.6357 247.531C65.3045 245.691 66.7186 244 68.5882 244H236.447C238.305 244 239.716 245.671 239.405 247.503L231.925 291.503C231.679 292.945 230.43 294 228.967 294H76.5082C75.0564 294 73.8129 292.96 73.5557 291.531L65.6357 247.531Z" fill="#FBFF95" />
                                            <path id="Text" d="M115.6 265.44L116.24 264.08C116.373 263.707 116.427 263.413 116.4 263.2C116.4 262.987 116.4 262.813 116.4 262.68C116.4 262.547 116.387 262.387 116.36 262.2C116.333 261.987 116.24 261.787 116.08 261.6C115.947 261.387 115.8 261.253 115.64 261.2C115.507 261.12 115.24 261 114.84 260.84L113.96 260.8C113.16 260.64 112.48 260.707 111.92 261C111.92 261.587 111.773 262.813 111.48 264.68L111.24 267.44L111.04 268.88C111.227 268.88 111.707 268.733 112.48 268.44L113.04 267.96C113.147 267.933 113.48 267.64 114.04 267.08C114.173 267.027 114.32 266.893 114.48 266.68L114.88 266.2C114.96 266.227 115.107 266.093 115.32 265.8L115.6 265.44ZM110.96 276.12L111.04 277.08C111.147 277.32 111.147 277.667 111.04 278.12C110.933 278.573 110.92 278.92 111 279.16C111 279.613 111.013 279.88 111.04 279.96C111.28 279.96 111.64 279.853 112.12 279.64C112.627 279.427 112.947 279.307 113.08 279.28C113.213 279.253 113.387 279.147 113.6 278.96C114.267 278.613 114.96 278.213 115.68 277.76L116.6 276.92C117.373 275.987 117.907 275.307 118.2 274.88L118.44 274.16C118.787 273.413 118.453 272.707 117.44 272.04C117.227 271.72 116.787 271.507 116.12 271.4H116.08C115.147 271.133 114.6 271.027 114.44 271.08L112.68 271.48C112.36 271.64 112.067 271.72 111.8 271.72C111.56 271.72 111.293 271.6 111 271.36L111.04 272.48C110.853 272.987 110.8 273.48 110.88 273.96C110.987 274.44 111.013 275.16 110.96 276.12ZM112.72 283.24H112.36C112.093 283.293 111.573 283.253 110.8 283.12C109.44 282.907 108.347 282.48 107.52 281.84C107.28 281.627 107 281.347 106.68 281C106.387 280.627 106.24 280.373 106.24 280.24C106.24 280.107 106.24 279.933 106.24 279.72C106.267 279.507 106.253 279.293 106.2 279.08V278.76C106.12 278.6 106.133 278.32 106.24 277.92C106.347 277.493 106.373 277.147 106.32 276.88C106.267 276.533 106.227 276.16 106.2 275.76C106.12 275.653 106.16 275.36 106.32 274.88C106.533 271.28 106.64 269.307 106.64 268.96L106.84 267.76C106.707 266.96 106.733 266.267 106.92 265.68V264.8C106.893 264.427 107 263.347 107.24 261.56C107.133 261.24 106.773 260.827 106.16 260.32C106.027 260.187 105.893 259.987 105.76 259.72C105.627 259.427 105.68 258.973 105.92 258.36C106.08 258.147 106.547 257.8 107.32 257.32C107.373 257.16 108.093 256.853 109.48 256.4L110.24 256.08C110.613 255.947 111.36 255.893 112.48 255.92C113.093 256 113.587 256.12 113.96 256.28C115.32 256.947 116.573 257.707 117.72 258.56C118.067 258.72 118.307 258.933 118.44 259.2C118.92 259.52 119.36 260.04 119.76 260.76C120.187 261.453 120.427 261.893 120.48 262.08C120.613 262.933 120.48 263.96 120.08 265.16C119.893 265.773 119.013 267.053 117.44 269C117.707 269.08 118.16 269.307 118.8 269.68C118.88 269.787 119.16 269.973 119.64 270.24C119.693 270.32 119.76 270.413 119.84 270.52C119.947 270.627 120.027 270.72 120.08 270.8L120.4 271L120.8 271.6L121.4 272.12C121.667 272.387 121.88 272.68 122.04 273C122.44 273.373 122.653 273.68 122.68 273.92L122.76 274.68C122.733 274.973 122.333 275.933 121.56 277.56C121.267 278.147 120.893 278.6 120.44 278.92L119.84 279.64C119.68 279.853 119.373 280.12 118.92 280.44C118.493 280.76 118.133 281.067 117.84 281.36C117.707 281.413 117.493 281.533 117.2 281.72C116.933 281.907 116.52 282.133 115.96 282.4C115.427 282.667 115.067 282.827 114.88 282.88C114.347 283.04 113.627 283.16 112.72 283.24ZM137.937 270.92L137.977 271.68C137.977 271.76 138.057 272.6 138.217 274.2V274.68C138.217 275.32 138.324 276.28 138.537 277.56C138.537 278.12 138.817 279.093 139.377 280.48C139.51 280.56 139.604 280.747 139.657 281.04L139.617 281.44C139.67 281.573 139.604 281.72 139.417 281.88C139.417 282.067 139.164 282.16 138.657 282.16C138.15 282.16 137.83 282.187 137.697 282.24C137.564 282.293 137.35 282.267 137.057 282.16C136.95 282.213 136.63 282.107 136.097 281.84C135.857 281.787 135.67 281.547 135.537 281.12L135.217 280.36C135.217 279.88 135.084 279.453 134.817 279.08C134.817 278.947 134.75 278.707 134.617 278.36C134.51 278.013 134.43 277.827 134.377 277.8C134.11 278.867 133.777 279.693 133.377 280.28C133.377 280.413 133.297 280.573 133.137 280.76L132.737 281.52C132.737 281.573 132.617 281.72 132.377 281.96C132.217 282.307 131.857 282.48 131.297 282.48C130.79 282.48 130.177 282.347 129.457 282.08C129.27 282.053 128.897 281.933 128.337 281.72C128.177 281.747 127.924 281.707 127.577 281.6C127.257 281.467 127.07 281.4 127.017 281.4C126.937 281.32 126.75 281.187 126.457 281L125.777 280.28C125.75 280.253 125.697 280.133 125.617 279.92C125.564 279.68 125.55 279.52 125.577 279.44C125.604 279.333 125.604 279.187 125.577 279C125.55 278.813 125.564 278.627 125.617 278.44C125.617 277.907 125.67 277.32 125.777 276.68C125.75 276.6 125.737 276.507 125.737 276.4C125.737 276.293 125.79 276.093 125.897 275.8C125.87 275.667 125.857 275.573 125.857 275.52L126.057 273.96C126.057 273.587 126.07 273.32 126.097 273.16V272.56C126.124 272.453 126.137 272.307 126.137 272.12L126.337 270.2C126.337 269.907 126.35 269.72 126.377 269.64V269.24C126.43 269.187 126.457 268.973 126.457 268.6L126.817 267.48L127.097 267C127.124 266.893 127.27 266.773 127.537 266.64C127.964 266.373 128.577 266.24 129.377 266.24C129.697 266.293 130.044 266.427 130.417 266.64C130.497 266.613 130.684 266.667 130.977 266.8C131.51 267.04 131.537 267.72 131.057 268.84C130.95 269.56 130.897 269.933 130.897 269.96C130.79 270.173 130.737 270.347 130.737 270.48C130.577 271.333 130.497 271.787 130.497 271.84C130.604 271.733 130.564 271.893 130.377 272.32L130.217 273.8C130.03 274.44 129.95 275.147 129.977 275.92L129.817 276.44C129.844 276.573 129.83 276.987 129.777 277.68C129.83 277.76 129.857 277.853 129.857 277.96L129.897 278.28C129.87 278.36 129.884 278.44 129.937 278.52C129.99 278.573 130.137 278.6 130.377 278.6C130.644 278.573 130.87 278.507 131.057 278.4C131.43 277.947 131.684 277.48 131.817 277C131.95 276.493 132.017 276.2 132.017 276.12C132.47 274.973 132.75 274.307 132.857 274.12C132.99 273.4 133.217 272.573 133.537 271.64C133.484 271.507 133.484 271.24 133.537 270.84L134.057 268.72C134.297 268.32 134.417 268.08 134.417 268C134.417 267.893 134.577 267.52 134.897 266.88C134.897 266.773 134.977 266.56 135.137 266.24C135.324 265.947 135.657 265.667 136.137 265.4H136.257C136.844 265.347 137.35 265.427 137.777 265.64C137.83 265.747 137.857 265.933 137.857 266.2C137.91 266.467 137.964 266.947 138.017 267.64V268.04L137.857 268.92C138.07 269.587 138.097 270.253 137.937 270.92ZM143.715 268.64C143.715 268.293 143.888 268 144.235 267.76C144.235 267.733 144.235 267.707 144.235 267.68C144.235 267.493 144.435 267.16 144.835 266.68C145.262 266.2 145.502 265.907 145.555 265.8C146.142 265.453 146.528 265.253 146.715 265.2C146.928 265.253 147.075 265.28 147.155 265.28H147.235C148.008 265.093 148.888 265.12 149.875 265.36C150.888 265.6 151.595 266.027 151.995 266.64C152.208 267.04 152.422 267.573 152.635 268.24C152.955 269.173 153.115 269.853 153.115 270.28C153.275 270.973 153.288 271.613 153.155 272.2L153.115 272.6C153.115 272.707 153.048 272.813 152.915 272.92C152.782 273.027 152.622 273.08 152.435 273.08C152.275 273.053 152.128 273.12 151.995 273.28C151.862 273.413 151.582 273.48 151.155 273.48C150.755 273.48 150.542 273.36 150.515 273.12C150.435 273.093 150.302 273 150.115 272.84C149.955 272.68 149.875 272.56 149.875 272.48L149.675 272.2C149.675 272.147 149.622 272.067 149.515 271.96C149.275 271.48 149.182 271.107 149.235 270.84C149.368 270.147 149.408 269.773 149.355 269.72C149.355 269.32 149.222 268.92 148.955 268.52C148.928 268.493 148.875 268.48 148.795 268.48C148.742 268.453 148.662 268.427 148.555 268.4C148.502 268.213 148.448 268.12 148.395 268.12C148.208 268.173 148.008 268.32 147.795 268.56C147.422 269.6 147.195 270.293 147.115 270.64L146.875 273.08V274.92C146.928 275.88 147.035 276.467 147.195 276.68C147.195 276.787 147.248 276.973 147.355 277.24C147.382 277.587 147.662 278.2 148.195 279.08L148.395 279.32C148.528 279.693 148.755 279.88 149.075 279.88C149.395 279.88 149.848 279.507 150.435 278.76C150.408 278.68 150.582 278.36 150.955 277.8C151.328 277.293 151.915 277.093 152.715 277.2C153.062 277.253 153.235 277.453 153.235 277.8C153.262 278.04 153.182 278.64 152.995 279.6C152.728 279.867 152.595 280.133 152.595 280.4C152.408 280.88 152.315 281.147 152.315 281.2C152.235 281.2 152.155 281.24 152.075 281.32L151.875 281.72C151.768 281.72 151.702 281.773 151.675 281.88C151.382 282.227 151.182 282.4 151.075 282.4C150.995 282.48 150.782 282.52 150.435 282.52C149.928 282.733 149.555 282.84 149.315 282.84L148.635 282.88L148.195 282.72L147.835 282.68C147.515 282.547 147.262 282.48 147.075 282.48C146.915 282.507 146.795 282.493 146.715 282.44C146.635 282.413 146.528 282.347 146.395 282.24C146.075 281.973 145.862 281.84 145.755 281.84C145.675 281.84 145.528 281.76 145.315 281.6C145.102 281.547 144.928 281.453 144.795 281.32L144.635 280.92C144.688 280.733 144.662 280.627 144.555 280.6C144.208 280.6 144.008 280.533 143.955 280.4L143.715 280.08C143.715 279.867 143.608 279.587 143.395 279.24L142.915 277.8C142.862 277.747 142.862 277.653 142.915 277.52V276.8L142.435 273.68V273.12C142.675 272.24 142.795 271.787 142.795 271.76C142.768 271.173 142.902 270.653 143.195 270.2C143.195 269.693 143.368 269.173 143.715 268.64ZM158.169 257.64C158.169 257.56 158.182 257.467 158.209 257.36V256.08C158.236 256 158.249 255.893 158.249 255.76C158.249 255.6 158.276 255.467 158.329 255.36C158.329 255.013 158.476 254.693 158.769 254.4C158.876 254.187 159.022 254.053 159.209 254C159.556 253.867 160.222 253.973 161.209 254.32C161.182 254.293 161.209 254.307 161.289 254.36C161.396 254.387 161.462 254.4 161.489 254.4C161.756 254.427 161.982 254.667 162.169 255.12C162.169 255.413 162.222 256.373 162.329 258C162.436 259.627 162.449 260.96 162.369 262V262.4C162.289 264.427 162.249 266.133 162.249 267.52C162.196 267.68 162.196 267.853 162.249 268.04C162.196 268.36 162.169 269.133 162.169 270.36L162.489 269.92L162.689 269.52C162.689 269.44 162.742 269.347 162.849 269.24C162.956 269.107 163.022 269.013 163.049 268.96C163.076 268.88 163.116 268.813 163.169 268.76C163.222 268.68 163.262 268.613 163.289 268.56C163.342 268.48 163.489 268.36 163.729 268.2C163.729 268.12 163.876 267.947 164.169 267.68L166.009 265.36L167.049 264.64C167.156 264.48 167.422 264.347 167.849 264.24C168.302 264.107 168.716 264.053 169.089 264.08C169.489 263.84 170.076 263.973 170.849 264.48C171.249 264.853 171.262 265.32 170.889 265.88C170.222 266.867 169.822 267.44 169.689 267.6L167.969 270L167.489 270.76C166.556 271.96 165.969 272.68 165.729 272.92C165.516 273.133 165.422 273.32 165.449 273.48C165.796 273.827 166.089 274.053 166.329 274.16C166.436 274.293 166.529 274.413 166.609 274.52C166.716 274.6 166.769 274.653 166.769 274.68L168.689 276.6C169.676 277.667 170.409 278.547 170.889 279.24L172.729 281.28C173.182 281.547 173.409 281.827 173.409 282.12C173.409 282.413 173.156 282.667 172.649 282.88C172.489 283.04 171.996 283.08 171.169 283C170.609 283.107 170.196 283.093 169.929 282.96C169.182 282.933 168.462 282.68 167.769 282.2C167.316 281.853 167.089 281.6 167.089 281.44C166.956 281.253 166.822 281.093 166.689 280.96C166.529 280.747 166.396 280.547 166.289 280.36C166.076 280.253 165.809 279.907 165.489 279.32C165.249 279.16 165.129 279.067 165.129 279.04C165.129 278.987 165.049 278.893 164.889 278.76C164.729 278.627 164.622 278.547 164.569 278.52C164.569 278.413 164.342 278.08 163.889 277.52C163.729 277.44 163.596 277.333 163.489 277.2C163.409 277.04 163.382 276.96 163.409 276.96L162.649 276L162.329 275.52C162.329 277.547 162.529 279.587 162.929 281.64C162.982 282.067 163.009 282.32 163.009 282.4C163.036 282.48 163.049 282.547 163.049 282.6C163.076 282.68 163.089 282.733 163.089 282.76L162.809 282.64C162.889 282.693 162.969 282.84 163.049 283.08C163.129 283.32 163.156 283.48 163.129 283.56C162.889 283.827 162.729 284 162.649 284.08C162.596 284.16 162.422 284.213 162.129 284.24C161.862 284.267 161.716 284.227 161.689 284.12C161.209 283.88 160.929 283.72 160.849 283.64C160.689 283.613 160.369 283.48 159.889 283.24C159.862 283.133 159.822 283.053 159.769 283C159.529 282.84 159.342 282.64 159.209 282.4C159.102 282.347 158.982 282.16 158.849 281.84C158.609 281.387 158.489 280.893 158.489 280.36C158.436 280.147 158.396 280.027 158.369 280C158.342 279.973 158.329 279.867 158.329 279.68L158.209 278.64C158.129 278.347 158.116 278.093 158.169 277.88L157.969 277.24L157.889 275.84L157.969 275.28C157.809 275.04 157.796 274.693 157.929 274.24V274C157.902 273.947 157.876 273.707 157.849 273.28C157.822 272.853 157.822 272.6 157.849 272.52C157.876 272.44 157.889 272.347 157.889 272.24C157.836 271.867 157.809 271.533 157.809 271.24V270.8C157.676 268.133 157.609 266.773 157.609 266.72V265.6C157.582 265.413 157.596 264.973 157.649 264.28C157.729 263.587 157.756 263.027 157.729 262.6C157.729 262.173 157.756 261.907 157.809 261.8C157.809 261.56 157.836 261.32 157.889 261.08V260.64C157.916 260.56 157.942 260.307 157.969 259.88L158.169 257.64ZM181.206 267.32C181.153 267.187 180.966 267.133 180.646 267.16C180.353 267.187 180.126 267.347 179.966 267.64C178.873 269.373 178.286 271.227 178.206 273.2C179.113 273.413 179.886 273.013 180.526 272C181.353 269.387 181.579 267.827 181.206 267.32ZM178.086 283.2L177.686 283.12L177.126 282.56C176.966 282.56 176.846 282.493 176.766 282.36C176.473 282.013 175.939 281.32 175.166 280.28L174.566 278.08C174.566 277.653 174.486 277.28 174.326 276.96C174.059 275.76 173.899 275.08 173.846 274.92C173.793 274.733 173.753 274.24 173.726 273.44C173.726 272.64 173.766 272.053 173.846 271.68C173.926 271.173 174.419 269.92 175.326 267.92C175.566 267.68 175.713 267.36 175.766 266.96L176.406 266.04C176.993 265.347 177.619 264.84 178.286 264.52C178.286 264.467 178.739 264.333 179.646 264.12C179.833 264.093 180.259 264.16 180.926 264.32C182.526 264.693 183.526 265.16 183.926 265.72L184.046 265.92C184.553 266.64 184.846 267.747 184.926 269.24C184.846 269.907 184.779 270.467 184.726 270.92C184.673 271.373 184.379 272.2 183.846 273.4C183.446 274.147 183.059 274.747 182.686 275.2C182.099 275.627 181.699 275.84 181.486 275.84C181.379 275.893 181.153 275.92 180.806 275.92H179.886C179.806 275.893 179.633 275.88 179.366 275.88C179.099 275.88 178.713 275.813 178.206 275.68C178.206 276.267 178.366 277.107 178.686 278.2C179.033 279.267 179.313 279.92 179.526 280.16C180.086 280.587 180.526 280.867 180.846 281C181.166 281.133 181.593 281.16 182.126 281.08C182.659 280.973 183.046 280.787 183.286 280.52L184.326 279.24C184.993 278.333 185.673 278.253 186.366 279C186.686 279.347 186.806 279.693 186.726 280.04C186.673 280.36 186.406 281.013 185.926 282C185.526 282.64 185.099 283.173 184.646 283.6C183.819 284.027 183.326 284.24 183.166 284.24C182.926 284.267 182.553 284.227 182.046 284.12C181.779 284.253 181.326 284.24 180.686 284.08C180.686 284.027 180.606 283.987 180.446 283.96C180.313 283.96 180.126 283.92 179.886 283.84L179.966 283.8C179.913 283.8 179.753 283.8 179.486 283.8L178.366 283.2H178.086ZM187.645 266.32C187.565 265.92 187.512 265.693 187.485 265.64C187.352 265.373 187.285 265.133 187.285 264.92C187.285 264.707 187.272 264.6 187.245 264.6C187.298 263.987 187.538 263.533 187.965 263.24C188.392 262.92 188.992 262.84 189.765 263L191.045 263.48L192.885 263.92L193.805 261.28C194.045 260.853 194.165 260.56 194.165 260.4C194.192 260.24 194.245 260.067 194.325 259.88C194.432 259.507 194.538 259.227 194.645 259.04L194.805 258.4C194.992 258.053 195.365 257.827 195.925 257.72C196.245 257.587 196.525 257.587 196.765 257.72C197.485 257.747 198.032 258.013 198.405 258.52C198.405 258.653 198.365 258.867 198.285 259.16C198.205 259.453 198.138 259.84 198.085 260.32L197.085 264.32H197.405L198.405 264.28C198.538 264.307 198.685 264.32 198.845 264.32C199.432 264.187 199.885 264.107 200.205 264.08C200.525 264.027 200.738 263.987 200.845 263.96C200.925 263.987 201.152 263.987 201.525 263.96C201.898 263.933 202.285 264.053 202.685 264.32C203.085 264.56 203.285 264.867 203.285 265.24C203.285 265.587 203.032 265.893 202.525 266.16L202.165 266.64C201.738 266.8 201.365 266.987 201.045 267.2C200.672 267.413 199.138 267.773 196.445 268.28L196.165 270.32C196.218 270.453 196.245 270.56 196.245 270.64C196.058 271.787 195.898 273.213 195.765 274.92C195.792 275.533 195.805 275.947 195.805 276.16V277.24C195.778 277.293 195.765 277.467 195.765 277.76C195.765 278.427 195.845 279.213 196.005 280.12C196.165 281 196.258 281.533 196.285 281.72C196.312 281.907 196.325 282.12 196.325 282.36C196.298 282.813 196.112 283.107 195.765 283.24C194.912 283.24 194.192 283.093 193.605 282.8C193.125 282.72 192.912 282.613 192.965 282.48C192.778 282.347 192.565 282.093 192.325 281.72C192.325 281.507 192.312 281.387 192.285 281.36C192.098 281.28 192.005 281.067 192.005 280.72C191.978 280.693 191.952 280.6 191.925 280.44L191.645 279.44C191.405 279.12 191.325 278.693 191.405 278.16C191.405 278.053 191.365 277.92 191.285 277.76V277.48C191.285 277.267 191.298 277.107 191.325 277C191.192 276.253 191.205 275.373 191.365 274.36C191.525 273.32 191.632 272.573 191.685 272.12C191.632 271.987 191.658 271.813 191.765 271.6C191.765 271.36 191.818 270.987 191.925 270.48L192.285 268.2C192.125 268.147 191.965 268.12 191.805 268.12C190.392 267.8 189.658 267.6 189.605 267.52L189.125 267.24C188.938 267.24 188.672 267.147 188.325 266.96C187.978 266.747 187.752 266.533 187.645 266.32Z" fill="black" />
                                        </g>
                                        <path id="!" d="M138.151 91.1608C141.116 90.7968 143.512 91.4053 145.339 92.9864C147.167 94.5674 148.252 96.7555 148.596 99.5505C148.928 102.261 148.405 104.646 147.024 106.707C145.644 108.768 143.344 109.996 140.126 110.392C137.161 110.755 134.76 110.105 132.922 108.439C131.169 106.763 130.136 104.654 129.824 102.113C129.491 99.4029 130.015 97.0173 131.396 94.9564C132.766 92.8108 135.018 91.5456 138.151 91.1608ZM123.549 23.7015L139.684 21.7204L143.129 80.2327L130.678 81.7615L123.549 23.7015Z" fill="white" />
                                        <path id="!_2" d="M167.157 93.1006C169.396 93.1788 171.1 93.9107 172.268 95.2963C173.436 96.6819 173.984 98.4301 173.91 100.541C173.838 102.588 173.171 104.293 171.906 105.658C170.642 107.023 168.794 107.663 166.364 107.578C164.125 107.5 162.423 106.736 161.257 105.286C160.154 103.839 159.637 102.156 159.704 100.237C159.775 98.1901 160.443 96.4843 161.708 95.1196C162.974 93.691 164.791 93.0179 167.157 93.1006ZM164.255 41.4158L176.44 41.8413L172.127 85.5894L162.724 85.2611L164.255 41.4158Z" fill="white" />
                                    </g>
                                </svg>

                            </div>
                        )}
                    </div>
                </div>
            )}

            <PropertiesModal toggleModal={toggleModal} setToggleModal={setToggleModal} fileProperties={fileProperties} formatFileSize={formatFileSize} calculateTimeActive={calculateTimeActive} timeLeft={timeLeft} handleDownloadFile={handleDownloadFile} handleDeleteFile={handleDeleteFile} handleOpenFile={handleOpenFile} />


        </>

    );

}

export default Files;