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
          
          <div className="user-management-list" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header Row */}
            <div className="user-row" style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 2fr 1fr auto',
              alignItems: 'center',
              padding: '12px 24px',
              borderBottom: '1px solid #222',
              fontWeight: '700',
              fontFamily: 'var(--font-headline)',
              letterSpacing: '0.05em',
              fontSize: '0.85rem'
            }}>
              <div>NAME</div>
              <div>EMAIL</div>
              <div>ROLE</div>
              <div style={{ textAlign: 'right' }}>ACTIONS</div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>Loading users...</div>
            ) : usersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>No users found.</div>
            ) : (
              usersList.map((u) => {
                const targetId = u._id || u.id; 
                const isSelf = (targetId === user?.id || targetId === user?._id);
                
                let roleBorderColor = '#4B5563'; // member (grey)
                if (u.role === 'admin') roleBorderColor = '#E11D48'; // red
                if (u.role === 'manager') roleBorderColor = '#3B82F6'; // blue
                if (u.role === 'analyst') roleBorderColor = '#F59E0B'; // orange backing

                return (
                  <div key={targetId} className="user-row" style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 2fr 1fr auto',
                    alignItems: 'center',
                    padding: '12px 24px',
                    borderBottom: '1px solid #222',
                    borderLeft: isSelf ? '4px solid #FFD700' : '4px solid transparent',
                    background: isSelf ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
                    paddingLeft: isSelf ? '20px' : '24px' // adjusting for border width physically
                  }}>
                    <div>
                      <span className="label-md">{u.name} {isSelf && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(You)</span>}</span>
                    </div>
                    
                    <div style={{ color: 'var(--text-muted)' }}>
                      {u.email}
                    </div>
                    
                    <div>
                       <select 
                         style={{ 
                           padding: '8px 12px', 
                           background: 'transparent',
                           border: `2px solid ${roleBorderColor}`,
                           color: 'white',
                           width: '120px',
                           fontFamily: 'var(--font-body)',
                           fontSize: '0.9rem',
                           outline: 'none',
                           cursor: isSelf ? 'not-allowed' : 'pointer',
                           opacity: isSelf ? 0.6 : 1
                         }}
                         value={selectedRoles[targetId] || u.role}
                         onChange={(e) => handleRoleChange(targetId, e.target.value)}
                         disabled={isSelf}
                       >
                         <option value="admin" style={{ background: '#111', color: '#fff' }}>Admin</option>
                         <option value="manager" style={{ background: '#111', color: '#fff' }}>Manager</option>
                         <option value="analyst" style={{ background: '#111', color: '#fff' }}>Analyst</option>
                         <option value="member" style={{ background: '#111', color: '#fff' }}>Member</option>
                       </select>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        style={{ 
                          padding: '8px 16px',
                          background: 'transparent',
                          border: '2px solid #FFD700',
                          color: '#FFD700',
                          fontFamily: 'var(--font-headline)',
                          fontWeight: 'bold',
                          cursor: (isSelf || selectedRoles[targetId] === u.role) ? 'not-allowed' : 'pointer',
                          opacity: (isSelf || selectedRoles[targetId] === u.role) ? 0.4 : 1,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelf && selectedRoles[targetId] !== u.role) {
                            e.currentTarget.style.background = '#FFD700';
                            e.currentTarget.style.color = '#000';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#FFD700';
                        }}
                        onClick={() => updateRole(targetId)}
                        disabled={isSelf || (selectedRoles[targetId] === u.role)}
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
