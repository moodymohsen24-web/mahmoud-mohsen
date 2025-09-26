import React, { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import type { User, UserRole } from '../types';
import { TrashIcon } from './icons/TrashIcon';

const UserManagementPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user: adminUser } = useAuth();
    const { t } = useI18n();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const usersFromDb = await authService.getAllUsers();
            setUsers(usersFromDb as unknown as User[]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('userManagement.error.fetch');
            console.error("Fetch users error:", err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setError('');
        setSuccessMessage('');
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) return;

        if(adminUser?.id === userId) {
            setError(t('userManagement.error.cannotChangeSelf'));
            return;
        }
        try {
            await authService.updateUserRoleAndPlan(userId, newRole, userToUpdate.subscription_plans?.id ?? null);
            setSuccessMessage(t('userManagement.updateSuccess'));
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            setError(err instanceof Error ? err.message : t('userManagement.error.update'));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm(t('userManagement.deleteConfirm'))) {
            return;
        }
        setError('');
        setSuccessMessage('');
        if(adminUser?.id === userId) {
            setError(t('userManagement.error.cannotDeleteSelf'));
            return;
        }
        try {
            await authService.deleteUser(userId);
            setSuccessMessage(t('userManagement.deleteSuccess'));
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (err) {
            setError(err instanceof Error ? err.message : t('userManagement.error.delete'));
        }
    };
    
    const RoleSelector: React.FC<{ user: User }> = ({ user }) => {
        const [selectedRole, setSelectedRole] = useState(user.role);
        const [isUpdating, setIsUpdating] = useState(false);

        const onUpdate = async () => {
            setIsUpdating(true);
            await handleRoleChange(user.id, selectedRole);
            setIsUpdating(false);
        };

        return (
            <div className="flex items-center gap-2">
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    disabled={user.id === adminUser?.id}
                    className="bg-accent dark:bg-dark-accent border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary text-sm rounded-lg focus:ring-highlight focus:border-highlight block w-full p-2"
                >
                    <option value="ADMIN">{t('userManagement.role.admin')}</option>
                    <option value="MODERATOR">{t('userManagement.role.moderator')}</option>
                    <option value="MEMBER">{t('userManagement.role.member')}</option>
                </select>
                {user.role !== selectedRole && (
                     <button 
                        onClick={onUpdate}
                        disabled={isUpdating}
                        className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-semibold py-2 px-4 rounded-lg shadow-sm border border-border dark:border-dark-border hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                        {isUpdating ? '...' : t('userManagement.update')}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-md border border-border dark:border-dark-border">
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('dashboard.userManagement.title')}</h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">{t('dashboard.userManagement.subtitle')}</p>
            
            {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-center border border-red-500/20">{error}</p>}
            {successMessage && <p className="bg-green-500/10 text-green-500 p-3 rounded mb-4 text-center border border-green-500/20">{successMessage}</p>}
            
            {isLoading ? (
                <div className="text-center p-8 text-text-secondary dark:text-dark-text-secondary">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-text-secondary dark:text-dark-text-secondary">
                        <thead className="text-xs text-text-primary dark:text-dark-text-primary uppercase bg-accent dark:bg-dark-accent">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('userManagement.table.name')}</th>
                                <th scope="col" className="px-6 py-3">{t('userManagement.table.email')}</th>
                                <th scope="col" className="px-6 py-3">{t('userManagement.table.role')}</th>
                                <th scope="col" className="px-6 py-3 text-end">{t('userManagement.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-secondary dark:bg-dark-secondary border-b border-border dark:border-dark-border">
                                    <td className="px-6 py-4 font-medium text-text-primary dark:text-dark-text-primary whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4">{user.email || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <RoleSelector user={user} />
                                    </td>
                                    <td className="px-6 py-4 text-end">
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={user.id === adminUser?.id}
                                            className="p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed"
                                            title={t('userManagement.delete')}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagementPanel;