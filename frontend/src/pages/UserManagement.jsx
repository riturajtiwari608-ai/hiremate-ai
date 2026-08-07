import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setError("");
    setLoading(true);

    try {
      const url = roleFilter ? `/users/all?role=${roleFilter}` : "/users/all";
      const response = await api.get(url);
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleUserStatus = async (user) => {
    const nextStatus = !user.is_active;

    const confirmText = nextStatus
      ? `Reactivate ${user.full_name}?`
      : `Deactivate ${user.full_name}?`;

    if (!window.confirm(confirmText)) return;

    try {
      await api.patch(`/users/${user.id}/status`, {
        is_active: nextStatus,
      });

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Status update failed");
    }
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header">
          <p className="eyebrow dark-eyebrow">Admin Control</p>
          <h1>User Management</h1>
          <p>
            View candidates/admins and activate or deactivate user accounts.
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="result-card">
          <div className="table-toolbar">
            <div>
              <h2>Users</h2>
              <p>Total users: {users.length}</p>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="small-select"
            >
              <option value="">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-pill ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            user.is_active
                              ? "status-pill active"
                              : "status-pill inactive"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={
                            user.is_active ? "danger-btn" : "secondary-btn"
                          }
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && <p>No users found.</p>}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default UserManagement;