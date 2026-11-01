import React, { useState, useEffect } from 'react';
import { Users, Mail, CheckCircle2, Clock, FolderKanban, Plus, Shield, Search } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const Team = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Member Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    department: 'Engineering',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getUsers({ search });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [search]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim() || !newMemberForm.password) {
      alert('Name, email, and password are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await userAPI.createUser(newMemberForm);
      setIsAddModalOpen(false);
      setNewMemberForm({
        name: '',
        email: '',
        password: '',
        role: 'Member',
        department: 'Engineering',
      });
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Project Team & Workload
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor member capacity, active projects, and deliverables
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsAddModalOpen(true)} icon={Plus} size="sm">
            Add Team Member
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Loading team workload data..." size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((member) => (
            <div
              key={member._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Member Top Info */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={
                      member.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name
                      )}&background=6366f1&color=fff`
                    }
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h3>
                      {member.role === 'Admin' && (
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.2 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {member.email}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded">
                      {member.department || 'Engineering'}
                    </span>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed italic">
                    "{member.bio}"
                  </p>
                )}
              </div>

              {/* Workload Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                    Tasks
                  </span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                    {member.totalAssignedTasks || 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block mb-0.5">
                    Done
                  </span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                    {member.completedTasks || 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30">
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase block mb-0.5">
                    Pending
                  </span>
                  <span className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                    {member.pendingTasks || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
        subtitle="Provision access for a new collaborator"
      >
        <form onSubmit={handleCreateMember} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Jordan Hayes"
            value={newMemberForm.name}
            onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jordan@taskflow.com"
            value={newMemberForm.email}
            onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
            required
          />

          <Input
            label="Temporary Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={newMemberForm.password}
            onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Role"
              as="select"
              value={newMemberForm.role}
              onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </Input>

            <Input
              label="Department"
              placeholder="e.g. DevOps"
              value={newMemberForm.department}
              onChange={(e) => setNewMemberForm({ ...newMemberForm, department: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Team;
