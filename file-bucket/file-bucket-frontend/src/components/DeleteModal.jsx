import React from 'react'

const DeleteModal = () => {
  return (
    <div id="delete-modal" style={{
        // transform: toggleModal ? 'translateY(0%)' : 'translateY(-20%)',
        // opacity: toggleModal ? '1' : '0'
    }}>
        <button id="delete-modal-close" onClick={()=>{}}>Close</button>
        <span id='delete-modal-title'>Are you sure?</span>
        <div id="delete-modal-container">
            <span>Are you sure you want to delete this bucket?<br></br>If you have uploaded any files, they will be deleted as well!</span>
        </div>
        <div id="delete-modal-buttons-container">
            <button className="delete-modal-button" id="delete-modal-delete-button">
                {/* <FiTrash size={20} color='white' />Confirm */} Confirm
            </button>
            <button className="delete-modal-button" id="delete-modal-close-button" onClick={() => toggleModal ? setToggleModal(false) : setToggleModal(true)}>
                {/* <FiX size={20} color='white' />Cancel */} Cancel
            </button>
        </div>
    </div>
  )
}

export default DeleteModal
