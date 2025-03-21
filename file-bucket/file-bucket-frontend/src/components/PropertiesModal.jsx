import { React, useState, useEffect } from 'react'
import { FiTrash, FiDownload, FiInfo, FiX } from "react-icons/fi";

const PropertiesModal = ({ toggleModal, setToggleModal, fileProperties, formatFileSize, calculateTimeActive, timeLeft, handleDownloadFile, handleDeleteFile, handleOpenFile }) => {

    // Using coutdown for file time
    const [fileTimes, setFileTimes] = useState({});

    useEffect(() => {
        const updateFileTimes = () => {
            setFileTimes(prevTimes => {
                const newTimes = { ...prevTimes };

                if (fileProperties.uploadedAt) {
                    newTimes[fileProperties._id] = calculateTimeActive(new Date(fileProperties.uploadedAt));
                }

                return newTimes;
            });
        };

        updateFileTimes(); // Initial calculation
        const interval = setInterval(updateFileTimes, 1000); // Update every second

        return () => clearInterval(interval);
    }, [fileProperties]);

    return (
        <div id="properties-modal" style={{
            transform: toggleModal ? 'translateY(0%)' : 'translateY(-200%)',
            opacity: toggleModal ? '1' : '0'
        }}>
            <button id="modal-close" onClick={() => toggleModal ? setToggleModal(false) : setToggleModal(true)}><FiX size={25} color='black' /></button>
            <span id='properties-title'>File Properties <FiInfo size={20} color="cornflowerblue" /></span>
            <div id="properties-container">
                <div className="property">
                    <span>File name:</span>
                    <span id='property-file-name' onClick={()=> handleOpenFile(fileProperties)}>{fileProperties.fileName}</span>
                </div>
                <div className="property">
                    <span>File type:</span>
                    <span>{fileProperties.fileType}</span>
                </div>
                <div className="property">
                    <span>File size:</span>
                    <span>{formatFileSize(fileProperties.fileSize)} ({fileProperties.fileSize} Bytes)</span>
                </div>
                <div className="property">
                    <span>File created:</span>
                    <span>{fileTimes[fileProperties._id]} ago</span>
                </div>
                <div className="property">
                    <span>File bucket:</span>
                    <span>{fileProperties.bucketUrl}</span>
                </div>
                <div className="property">
                    <span>File bucket expiry:</span>
                    <span>{timeLeft}</span>
                </div>
            </div>
            <div id="modal-buttons-container">
                <button className="modal-button" id="file-download-button" onClick={() => {handleDownloadFile(fileProperties); toggleModal ? setToggleModal(false) : setToggleModal(true)}}>
                    <FiDownload size={20} color='white' /> Download
                </button>
                <button className="modal-button" id="file-delete-button" onClick={() => {handleDeleteFile(fileProperties); toggleModal ? setToggleModal(false) : setToggleModal(true)}}>
                    <FiTrash size={20} color='white' /> Delete
                </button>
                <button className="modal-button" id="modal-close-button" onClick={() => toggleModal ? setToggleModal(false) : setToggleModal(true)}>
                    <FiX size={20} color='white' />Cancel
                </button>
            </div>
        </div>
    )
}

export default PropertiesModal
