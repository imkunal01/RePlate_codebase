  import { logout } from '../services/authService';

const Dashboard = ({ user, onLogout }) => {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user.name}!</h2>
      <div className="user-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.activeRole}</p>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;