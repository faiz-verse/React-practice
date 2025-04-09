import './AppointmentGroup.css'

import React, { useState, useEffect, useRef } from 'react';

function AppointmentGroup({ appointments }) {
  const [isHovered, setIsHovered] = useState(false);
  const [flipDirection, setFlipDirection] = useState(false); // true = stack left
  const groupRef = useRef();

  useEffect(() => {
    if (isHovered && groupRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      const screenMid = window.innerWidth / 2;

      // If in right half, flip direction to left
      setFlipDirection(rect.left > screenMid);
    }
  }, [isHovered]);

  return (
    <div
      ref={groupRef}
      className="appointment-message multiple"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {appointments.map((appointment, i) => {
        const offset = 110 * i;
        const translateX = isHovered
          ? flipDirection
            ? `-${offset}px` // right side → stack left
            : `${offset}px`  // left side → stack right
          : `-${5 * i}px`;    // default small cluster

        const translateY = isHovered ? `0px` : `-${5 * i}px`;

        return (
          <div
            className="appointment-info multiple"
            key={i}
            style={{
              transform: `translateX(${translateX}) translateY(${translateY})`,
              zIndex: `${appointments.length - i}`,
            }}
          >
            <span>{appointment.appointmentType}</span>
            <span>{appointment.appointmentTitle}</span>
            <span>{appointment.selectedTimeSlot}</span>
            <span>Duration: {appointment.duration}</span>
            <span>Time-zone: {appointment.selectedTimezone}</span>
          </div>
        );
      })}
    </div>
  );
}

export default AppointmentGroup;
