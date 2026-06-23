import React from 'react'
import '../userList/UserList.css'

const users = [
  { id: 1, name: 'John Doe', mobile: '123-456-7890', email: 'john.doe@example.com', start_date: '2024-03-11', profilePic: 'https://th.bing.com/th/id/OIP.Jg_SqbgXBk3ZLQ82dXS4zQHaJd?rs=1&pid=ImgDetMain' },
  { id: 2, name: 'Jane Smith', mobile: '987-654-3210', email: 'jane.smith@example.com', start_date: '2024-03-12', profilePic: 'https://th.bing.com/th/id/OIP.Jg_SqbgXBk3ZLQ82dXS4zQHaJd?rs=1&pid=ImgDetMain' },
  { id: 3, name: 'Alice Johnson', mobile: '555-555-5555', email: 'alice.johnson@example.com', start_date: '2024-03-13', profilePic: 'https://th.bing.com/th/id/OIP.Jg_SqbgXBk3ZLQ82dXS4zQHaJd?rs=1&pid=ImgDetMain' },
];

const NurseList = () => {
  return (
    <table className="user-table">
      <thead>
        <tr className='red-line'>
          <th>Profile Pic</th>
          <th>Name</th>
          <th>Mobile</th>
          <th>Email ID</th>
          <th>Start Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className={`${user.id%2===0 ? "blue-line":"black-line"}`}>
          <td><img src="https://thumbs.dreamstime.com/b/design-can-be-used-as-logo-icon-as-complement-to-design-nurse-logo-icon-design-128546385.jpg" alt={user.name} className="profile-pic" /></td>
            <td>{user.name}</td>
            <td>{user.mobile}</td>
            <td>{user.email}</td>
            <td>{user.start_date}</td>
            <td><button className="action-button" onClick={() => alert(`Clicked button for ${user.name}`)}>Click</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};



export default NurseList