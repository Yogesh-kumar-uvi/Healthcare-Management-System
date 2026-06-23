import React from 'react';

const DoctorModal = (props) => {
  return (props.doctor?(
    <div>
      <div>
        <p><strong>Name:</strong> {props.doctor.name}</p>
        <p><strong>Mobile:</strong>+91 {props.doctor.phone}</p>
        <p><strong>Email:</strong> {props.doctor.email}</p>
        <p><strong>Specialization:</strong> {props.doctor.specialization}</p>
      </div>
    </div>
  ):""

  );
};

export default DoctorModal;
