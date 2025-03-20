import { useState, useEffect, useRef } from 'react'

// App css
import './App.css'

// components
import Navbar from './components/navbar.jsx'
import Button from './components/button.jsx'
import Footer from './components/footer.jsx'

function App() {

    // HOOKS
    // useState
    const [count, setCount] = useState(0)

    // // Case 1: Run on every render (i.e. when any state changes the whole App.jsx renders again!)
    // useEffect(() => {
    //     alert("Welcome!");
    //   })

    // // Case 2: Run only on the first render
    // useEffect(() => {
    //   alert("Welcome!");
    // }, [])

    // // Case 3: Run only when certain value/state changes
    // useEffect(() => {
    //     alert("Welcome!");
    //   }, [count])

    // // Case 4: Run when the component is unmounted (removed)
    // useEffect(() => {
    //   return () => {
    //     alert("The component was unmounted") // move this to an component to remove and see unmounting
    //   }
    // }, [])

    // // useRef()
    // // Note: we should not use the ref constant to display inside DOM as it wont change on re rendering
    // // Case 1: Using useRef for persisting throughout rendering
    // const a = useRef(0); // initializes with value 0 and does not looses value (persists) on re rendering caused by change in state
    // a.current = a.current + 1 // to use value of current a we must use .current
    // console.log(a.current)

    // // Case 2: Using useRef to refer an component when it first renders
    // const ref = useRef() // Now we can add the ref to an component to refer it through state changes
    // useEffect(() => {
    //     alert("Count changed!");
    //     ref.current.style.backgroundColor = "red"
    // }, [count])

    // // Case 3: if the component is a custom component then e.g.
    // import React, { forwardRef } from "react";
    // const Button = forwardRef((props, ref) => {
    //     return (
    //         <button ref={ref} onClick={props.onClick} style={{ padding: "10px" }}>
    //             {props.text}
    //         </button>
    //     );
    // });
    // export default Button;


    // consitional rendering
    const [showInfo, setShowInfo] = useState(false)
    // useEffect(() => {
    //     console.log(showInfo);
    // }, [showInfo])


    // // todo component
    // const Todo = ({ todo }) => {
    //     return (
    //         <div id='TodoContainer'>
    //             <div>{todo.title}</div>
    //             <div>{todo.description}</div>
    //         </div>
    //     )
    // }

    // for rendering a list (creating a list)
    const [todoList, setTodoList] = useState([
        {
            title: "Todo 1",
            description: "Todo 1 description comes here!"
        },
        {
            title: "Todo 2",
            description: "Todo 2 description comes here!"
        },
        {
            title: "Todo 3",
            description: "Todo 3 description comes here!"
        }
    ])


    // fetching json api to put it into list for exercise
    const url = "https://jsonplaceholder.typicode.com/posts"
    const [postList, setPostList] = useState()

    const fetchPostList = (url) => {
        fetch(url)
            .then(response => response.json())
            .then(data => setPostList(data))
    }

    useEffect(() => {
        fetchPostList(url)
    }, [])

    useEffect(() => {
        console.log(postList)
    }, [postList])


    return (
        <>
            <Navbar navText="NAVBAR" />

            {showInfo ? <div className='showInfo'>Button is clicked !</div> : ""}

            {/* Rendering a list */}
            {todoList.map(currentTodo => {
                // return <Todo key={currentTodo.title} todo={currentTodo} />

                // directly returning the component
                return (
                    <div key={currentTodo.title} id='TodoContainer'>
                        <div>{currentTodo.title}</div>
                        <div>{currentTodo.description}</div>
                    </div>
                )
            })}

            {/* Rendering a exercise postList */}
            <div id='PostListMainContainer'>
            {(postList) ?
                postList.map(currentPost => {
                    // return <Todo key={currentTodo.title} todo={currentTodo} />

                    // directly returning the component
                    return (
                        <div key={currentPost.id} id='PostContainer'>
                            <div>{currentPost.id}</div>
                            <div>{currentPost.userId}</div>
                            <div>{currentPost.title}</div>
                            <div>{currentPost.body}</div>
                        </div>
                    )
                }) : ""
            }</div>

            <Button text={`Count is: ${count}`} onClick={() => {
                setCount(count + 1);
                showInfo ? "" : setShowInfo(true); setTimeout(() => { setShowInfo(false) }, 1000);
            }} />

            {/* For making the Button Referable through rendering */}
            {/* <button ref={ref} onClick={() => { setCount(count + 1) }} style = {{height: "40px", width: "150px"}} >
            Count is: {count}
            </button> */}
            {/* // if we want that the referred component to change on action of some other component then for e.g.
            <button onClick = {()=> {ref.current.style.display = "none"}}> Click me </button> */}

            <Footer footerText="Official footer © All rights reserved" />
        </>
    )
}

export default App
