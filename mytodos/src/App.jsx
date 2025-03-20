// necessary imports
import { useState, useEffect, useRef } from 'react'

// for generating unique ids
import { v4 as uuidv4 } from 'uuid';

// assets

// css
import './App.css'
import './components/nav.css'
import './components/addArea.css'

// components
import Nav from "./components/nav.jsx"
import { AddArea, AddButton, InputField } from './components/addArea.jsx'

function App() {

    const [todo, setTodo] = useState("")
    const [todos, setTodos] = useState([])

    const isFirstRender = useRef(true); // Prevent first render issue

    // Load todos from local storage when the app starts
    useEffect(() => {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos)); // ✅ Load saved todos
        }
    }, []);

    // Save todos to local storage whenever they change (except on first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; // ✅ Prevent first render overwrite
            return;
        }
        saveTodosToLS(todos) // ✅ Store updated todos
    }, [todos]);

    // to save todos to local storage
    const saveTodosToLS = (todoToStore) => {
        localStorage.setItem("todos", JSON.stringify(todoToStore))
    }

    const handleAddTodo = () => {
        if (todo.trim === "" || todo.length <= 3) {
            return
        }
        else {
            setTodos([...todos, { todoID: uuidv4(), todo, isCompleted: false }]) //adding the todo after todos
            setTodo("")
        }
    }

    const handleChange = (item) => {    
        let index = todos.findIndex(currentTodo => currentTodo.todoID === item.todoID);
        if (index !== -1) {
            let newTodos = [...todos]; // ✅ Create a new copy of the array
            newTodos[index] = { ...newTodos[index], isCompleted: !newTodos[index].isCompleted }; // ✅ Update the object
            setTodos(newTodos); // ✅ Update state correctly
        }
    };

    const inputRef = useRef() // to access the input field

    const handleEdit = (item) => {
        let index = todos.findIndex(currentTodo => {
            return currentTodo.todoID === item.todoID
        });
        if (index !== -1) {
            setTodo(todos[index].todo)
            inputRef.current.focus()
            handleDelete(item)
        }
    }

    const handleDelete = (item) => {
        let newTodos = todos.filter(currentTodo => {
            return currentTodo.todoID !== item.todoID; // ✅ Create a new copy of the array without the item
        })
        setTodos(newTodos);
    }


    return (
        <>
            <div id="main-container">
                <Nav></Nav>

                <span className='info-text-1'>Add a Todo: </span>

                <AddArea>
                    {/* passing todo as value and setTodo to set the Todo during onChange event */}
                    <InputField ref={inputRef} name="todo" value={todo} setTodo={setTodo} handleAddTodo={handleAddTodo} />
                    <AddButton onClick={handleAddTodo} disabled={todo.length <= 3}/>
                </AddArea>

                <span className='info-text-2'>Your Todos: </span>

                <div id='todo-list-container'>
                    {todos.length > 0 ? (
                        todos.map((item, index) => (
                            <div key={index} className='todo-list-item'>

                                <div className='list-left'>
                                    <input className='todo-checkbox'
                                        type="checkbox"
                                        checked={item.isCompleted}
                                        onChange={() => handleChange(item)
                                        }
                                    />
                                    <div className='todo-text'
                                        style={{
                                            textDecoration: item.isCompleted ? "line-through" : "none",
                                            textDecorationThickness: item.isCompleted ? "2px" : "none",
                                            textDecorationColor: item.isCompleted ? "red" : "none",
                                        }}>
                                        {item.todo}
                                    </div>
                                </div>

                                <div className='list-right'>
                                    <button className="edit-button" onClick={() => handleEdit(item)} disabled={item.isCompleted}><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="m3.99 16.854-1.314 3.504a.75.75 0 0 0 .966.965l3.503-1.314a3 3 0 0 0 1.068-.687L18.36 9.175s-.354-1.061-1.414-2.122c-1.06-1.06-2.122-1.414-2.122-1.414L4.677 15.786a3 3 0 0 0-.687 1.068zm12.249-12.63 1.383-1.383c.248-.248.579-.406.925-.348.487.08 1.232.322 1.934 1.025.703.703.945 1.447 1.025 1.934.058.346-.1.677-.348.925L19.774 7.76s-.353-1.06-1.414-2.12c-1.06-1.062-2.121-1.415-2.121-1.415z" fill="#ffffff"></path></g></svg></button>
                                    <button className="delete-button" onClick={() => handleDelete(item)}><svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" width="800px" height="800px" viewBox="0 0 24 24"><path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"/></svg></button>
                                </div>

                            </div>
                        ))
                    ) : (
                        <p>No todos yet. Add some!</p>
                    )}
                </div>

            </div >
        </>
    )
}

export default App
