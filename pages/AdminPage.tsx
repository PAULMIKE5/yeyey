
import React from 'react';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import { UserMinusIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon, ADMIN_USER_ID } from '../constants';


const AdminPage: React.FC = () => {
  const { user, allUsers, withdrawalRequests, toggleUserBanStatus, updateWithdrawalStatus } = useUser();

  if (user.userId !== ADMIN_USER_ID) {
    return (
      <div className="p-6 text-center text-red-500">
        Access Denied. This page is for administrators only.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold text-center text-purple-400 mb-8">Admin Panel</h1>

      {/* User Management Section */}
      <section className="bg-[#2D1A4B] p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
              <tr>
                <th scope="col" className="px-4 py-3">User ID</th>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Earnings</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.filter(u => u.userId !== ADMIN_USER_ID).map((u) => (
                <tr key={u.userId} className="border-b border-gray-700 hover:bg-gray-600/30">
                  <td className="px-4 py-3 font-medium">{u.userId}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">${(u.earnings || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.isBanned ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant={u.isBanned ? 'primary' : 'secondary'}
                      onClick={() => u.userId && toggleUserBanStatus(u.userId)}
                      className={`py-1 px-3 text-xs ${u.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                      icon={u.isBanned ? <UserPlusIcon className="w-4 h-4" /> : <UserMinusIcon className="w-4 h-4" />}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {allUsers.filter(u => u.userId !== ADMIN_USER_ID).length === 0 && (
          <p className="text-center text-gray-400 py-4">No other users found.</p>
        )}
      </section>

      {/* Withdrawal Requests Section */}
      <section className="bg-[#2D1A4B] p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">Withdrawal Requests</h2>
        {withdrawalRequests.length === 0 ? (
          <p className="text-center text-gray-400">No pending withdrawal requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-4 py-3">Req ID</th>
                  <th scope="col" className="px-4 py-3">User Name</th>
                  <th scope="col" className="px-4 py-3">Amount</th>
                  <th scope="col" className="px-4 py-3">Wallet</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalRequests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-600/30">
                    <td className="px-4 py-3 font-medium truncate max-w-[50px]">{req.id}</td>
                    <td className="px-4 py-3">{req.userName}</td>
                    <td className="px-4 py-3">${req.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 truncate max-w-[100px]">{req.walletAddress}</td>
                    <td className="px-4 py-3">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'approved' ? 'bg-green-500 text-white' :
                        req.status === 'declined' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black' // pending
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateWithdrawalStatus(req.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-xs"
                            icon={<CheckCircleIcon className="w-4 h-4" />}
                            title="Approve"
                          >Approve</Button>
                          <Button
                            onClick={() => updateWithdrawalStatus(req.id, 'declined')}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 text-xs"
                            icon={<XCircleIcon className="w-4 h-4" />}
                             title="Decline"
                          >Decline</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
