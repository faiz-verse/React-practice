import "./button.css"

const Button = (props) => {
    return (
      <button className="Button" onClick={props.onClick} style={{ padding: "10px" }}>
        {props.text}
      </button>
    );
  };
  
  export default Button;

// // Case: if the component is a custom component and we want it to be referred by useRef().
    // import React, { forwardRef } from "react";
    // const Button = forwardRef((props, ref) => {
    //     return (
    //         <button ref={ref} onClick={props.onClick} style={{ padding: "10px" }}>
    //             {props.text}
    //         </button>
    //     );
    // });
    // export default Button;
  