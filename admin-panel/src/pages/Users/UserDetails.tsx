import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsers, type User } from './UsersContext';
import { formatCurrency } from '../../data/mockDb';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, updateUser, deleteUser } = useUsers();

  const selectedUser = users.find(u => u.id === id) || users[0] || null;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editName, setEditName] = useState(selectedUser?.name || '');
  const [editEmail, setEditEmail] = useState(selectedUser?.email || '');
  const [editPhone, setEditPhone] = useState(selectedUser?.phone || '');
  const [editRole, setEditRole] = useState<User['role']>(selectedUser?.role || 'Customer');
  const [editStatus, setEditStatus] = useState<User['status']>(selectedUser?.status || 'Active');
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setEditName(selectedUser.name);
      setEditEmail(selectedUser.email);
      setEditPhone(selectedUser.phone);
      setEditRole(selectedUser.role);
      setEditStatus(selectedUser.status);
    }
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="bg-white border border-[#BEC9BE] rounded-xl p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
        <svg className="w-12 h-12 text-[#6F7A70] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-[#111E16]">No Users Found</h3>
        <p className="text-sm text-[#6F7A70] mt-1">Please create a user first in the User List tab.</p>
        <button
          onClick={() => navigate('/dashboard/users')}
          className="mt-4 px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg transition-all"
        >
          Go to User List
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!editEmail.trim() || !/\S+@\S+\.\S+/.test(editEmail)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!editPhone.trim()) {
      setFormError('Phone number is required');
      return;
    }

    updateUser(selectedUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      status: editStatus
    });

    setFormError('');
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleBlock = () => {
    const nextStatus = selectedUser.status === 'Blocked' ? 'Active' : 'Blocked';
    updateUser(selectedUser.id, { status: nextStatus });
  };

  const handleDeleteUser = () => {
    deleteUser(selectedUser.id);
    setShowDeleteConfirm(false);
    navigate('/dashboard/users');
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    navigate(`/dashboard/users/details/${targetId}`);
  };

  const mockOrders = [
    { id: 'ORD-8923', date: 'Jun 15, 2026', amount: selectedUser.spent * 0.4 || 12000, status: 'Completed', method: 'Razorpay UPI' },
    { id: 'ORD-8841', date: 'May 02, 2026', amount: selectedUser.spent * 0.35 || 8990, status: 'Completed', method: 'Razorpay Cards' },
    { id: 'ORD-8711', date: 'Dec 18, 2025', amount: selectedUser.spent * 0.25 || 4500, status: 'Refunded', method: 'Razorpay NetBanking' }
  ].filter(() => selectedUser.orders > 0);

  const avgOrderValue = selectedUser.orders > 0 ? selectedUser.spent / selectedUser.orders : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Customer Profile Details
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Review detailed purchases, contact specifications, and credential parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider block whitespace-nowrap">View Profile:</label>
          <div className="relative w-full sm:w-56">
            <select
              value={selectedUser.id}
              onChange={handleUserChange}
              className="w-full appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} (#{u.id})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-[#E8F8E9] border border-[#00522E]/20 text-[#00522E] rounded-lg px-4 py-3 text-sm font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <svg className="w-5 h-5 text-[#00522E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>User profile successfully saved!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs relative">
            <div className="flex flex-col items-center text-center space-y-4">
              <span className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl text-[#00522E] bg-[#E8F8E9] border border-[#BEC9BE]/60 select-none">
                {selectedUser.name.charAt(0)}
              </span>

              <div>
                <h3 className="text-xl font-bold text-[#111E16]">{selectedUser.name}</h3>
                <span className="text-xs font-semibold text-[#6F7A70] block">Member ID: #{selectedUser.id}</span>
              </div>

              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                selectedUser.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                selectedUser.status === 'Blocked' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                {selectedUser.status}
              </span>

              <div className="w-full pt-4 border-t border-[#BEC9BE]/40 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#6F7A70] block uppercase tracking-wider text-[10px]">Orders</span>
                  <span className="text-lg font-bold text-[#111E16] font-mono">{selectedUser.orders}</span>
                </div>
                <div className="text-center border-x border-[#BEC9BE]/40">
                  <span className="text-xs font-semibold text-[#6F7A70] block uppercase tracking-wider text-[10px]">Spent</span>
                  <span className="text-lg font-bold text-[#00522E] font-mono">{formatCurrency(selectedUser.spent)}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#6F7A70] block uppercase tracking-wider text-[10px]">AOV</span>
                  <span className="text-lg font-bold text-[#111E16] font-mono">{formatCurrency(avgOrderValue)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#BEC9BE]/40 space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6F7A70] font-semibold">Email:</span>
                <span className="text-[#111E16] font-bold">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A70] font-semibold">Phone:</span>
                <span className="text-[#111E16] font-bold">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A70] font-semibold">Role Level:</span>
                <span className="text-[#111E16] font-bold">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F7A70] font-semibold">Registered:</span>
                <span className="text-[#111E16] font-bold">{selectedUser.createdDate}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#BEC9BE]/40 grid grid-cols-2 gap-3 select-none">
              <button
                onClick={handleToggleBlock}
                className={`w-full py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedUser.status === 'Blocked'
                    ? 'border-[#BEC9BE] text-[#00522E] hover:bg-[#E8F8E9]'
                    : 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                {selectedUser.status === 'Blocked' ? 'Unblock User' : 'Block Account'}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-[#BA1A1A] border border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#BEC9BE]/40">
              <h3 className="text-lg font-bold text-[#111E16]">Credential Settings</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8E9] hover:bg-[#E2F2E3] text-[#00522E] rounded-lg text-xs font-bold cursor-pointer transition-all border border-[#BEC9BE]"
                >
                  <svg className="w-4 h-4 text-[#00522E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
                {formError && (
                  <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Role Type</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Account Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#BEC9BE]/40 flex items-center justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormError('');
                    }}
                    className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] rounded-lg text-sm font-semibold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold cursor-pointer transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider block mb-1">Billing Location</span>
                  <p className="text-[#111E16] font-bold">Flat 404, Maker Towers, Nariman Point</p>
                  <p className="text-[#6F7A70]">Mumbai, Maharashtra 400021, India</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider block mb-1">Shipping Details</span>
                  <p className="text-[#111E16] font-bold">Flat 404, Maker Towers, Nariman Point</p>
                  <p className="text-[#6F7A70]">Mumbai, Maharashtra 400021, India</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider block mb-1">Preferred Payments</span>
                  <p className="text-[#111E16] font-bold">UPI / Razorpay (SBI Credit Card)</p>
                  <p className="text-xs text-[#6F7A70]">Reference: pay_9028302190</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider block mb-1">Security Details</span>
                  <p className="text-[#111E16] font-bold">Two-Factor Authentication: Enabled</p>
                  <p className="text-xs text-emerald-700">Verified Mobile Number</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#111E16] pb-4 border-b border-[#BEC9BE]/40">Recent Order Activity</h3>
            
            {mockOrders.length === 0 ? (
              <div className="py-8 text-center text-[#6F7A70]">
                No recent transactions found for this customer.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4 rounded-lg border border-[#BEC9BE]/50">
                <table className="w-full border-collapse text-left text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-[#E8F8E9]/30 text-[#6F7A70] border-b border-[#BEC9BE]/40">
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Order ID</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Payment Method</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right">Amount</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/20">
                    {mockOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#E8F8E9]/10">
                        <td className="py-3 px-4 font-mono font-bold text-[#00522E]">{order.id}</td>
                        <td className="py-3 px-4 font-medium text-[#111E16]">{order.date}</td>
                        <td className="py-3 px-4 text-[#6F7A70]">{order.method}</td>
                        <td className="py-3 px-4 font-mono font-bold text-right text-[#111E16]">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            order.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm shadow-xl p-6 space-y-4 animate-scale-up">
            <h4 className="text-lg font-bold text-[#BA1A1A]">Delete User Account?</h4>
            <p className="text-sm text-[#6F7A70]">
              Are you sure you want to permanently delete {selectedUser.name}'s account? This action is destructive and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 select-none">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
