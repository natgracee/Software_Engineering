import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';

export const JoinGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [joinStatus, setJoinStatus] = useState('Joining...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinGroup = async () => {
      // Wait for user data to load
      if (loading) {
        return;
      }

      // If user is not logged in, redirect to login with a message
      if (!user) {
        alert('Please log in to join the group.');
        navigate('/login'); // TODO: Potentially redirect back to join page after login
        return;
      }

      try {
        setJoinStatus('Joining group...');
        // Call backend endpoint to join the group
        const response = await authService.joinGroup(groupId); // TODO: Implement joinGroup service function and backend endpoint
        setJoinStatus('Successfully joined group!');
        // Redirect to the group detail page on success
        navigate(`/group/${groupId}`);
      } catch (err) {
        console.error('Error joining group:', err);
        setError(err.message || 'Failed to join group.');
        setJoinStatus('Failed to join group.');
      }
    };

    joinGroup();
  }, [groupId, user, loading, navigate]); // Rerun when groupId, user, loading, or navigate changes

  if (loading) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-6 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 min-h-screen flex items-center justify-center">
      <div className="text-xl">{joinStatus}</div>
    </section>
  );
}; 