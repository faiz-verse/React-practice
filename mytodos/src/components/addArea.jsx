// add area component
import { forwardRef } from "react";

const AddArea = ( {children} ) => {
  return (
    <div id="add-area">
        {children} {/*adding children to make it enable childrens to be inside, other components inside this in app.jsx */}
    </div>
  )
}

const InputField = forwardRef(({value, setTodo, handleAddTodo}, ref) => {
    return (
        <input ref={ref} id="input-area" type="text" placeholder="add what you want to do"
            value={value}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
        />
    )
})

const AddButton = ({onClick, disabled}) => {
    return (
        <button id="add-button" onClick={onClick} disabled={disabled}><svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16 12.75H12.75V16C12.75 16.41 12.41 16.75 12 16.75C11.59 16.75 11.25 16.41 11.25 16V12.75H8C7.59 12.75 7.25 12.41 7.25 12C7.25 11.59 7.59 11.25 8 11.25H11.25V8C11.25 7.59 11.59 7.25 12 7.25C12.41 7.25 12.75 7.59 12.75 8V11.25H16C16.41 11.25 16.75 11.59 16.75 12C16.75 12.41 16.41 12.75 16 12.75Z" fill="#ffffff"></path> </g></svg></button>
    )
}

export {AddArea, InputField, AddButton}

