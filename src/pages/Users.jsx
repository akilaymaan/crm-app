import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track selected roles in dropdown before saving
  const [selectedRoles, setSelectedRoles] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      if (res.data.success) {
        setUsersList(res.data.data);
        const rolesMap = {};
        res.data.data.forEach(u => {
          rolesMap[u._id] = u.role;
        });
        setSelectedRoles(rolesMap);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  const updateRole = async (userId) => {
    try {
      const newRole = selectedRoles[userId];
      await usersAPI.updateRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers(); // Refetch after successful update per instructions
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
      fetchUsers(); // Revert selection visually on error by refetching
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="col-12">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="card"
           style={{ padding: '0' }}
        >
          <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="title-md">User Management</h2>
              <p className="label-sm" style={{ color: 'var(--text-muted)' }}>Manage user properties and roles.</p>
            </div>
            <button className="btn btn-primary" onClick={fetchUsers} disabled={loading}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
              <span style={{ fontSize: '12px' }}>REFRESH</span>
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>RULESET</th>
                  <th style={{ width: '250px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Loading users...</td></tr>
                ) : usersList.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>No users found.</td></tr>
                ) : (
                  usersList.map((u) => {
                    // Backwards compatible with both pure json JWT state (_id missing in my jwt payload context earlier if not handled) and db user object
                    const targetId = u._id || u.id; 
                    const isSelf = (targetId === user?.id || targetId === user?._id);
                    return (
                    <tr key={targetId}>
                      <td>
                        <span className="label-md">{u.name} {isSelf && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(You)</span>}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>
                         <span className="badge" style={{
                           background: u.role === 'admin' ? 'var(--primary)' : 'var(--surface-container-high)',
                           color: u.role === 'admin' ? 'var(--on-primary)' : 'var(--on-surface)'
                         }}>{u.role.toUpperCase()}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select 
                            className="input" 
                            style={{ padding: '8px', width: '120px' }}
                            value={selectedRoles[targetId] || u.role}
                            onChange={(e) => handleRoleChange(targetId, e.target.value)}
                            disabled={isSelf}
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="analyst">Analyst</option>
                            <option value="member">Member</option>
                          </select>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px' }}
                            onClick={() => updateRole(targetId)}
                            disabled={isSelf || (selectedRoles[targetId] === u.role)}
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
