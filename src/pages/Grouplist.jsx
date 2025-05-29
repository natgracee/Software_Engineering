import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdAdd, MdArrowBack, MdGroups, MdSearch, MdGroup } from 'react-icons/md';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

const GroupItem = ({ group }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/group/${group.group_id}`)}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
    >
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
        {group.profile_picture ? (
          <img
            src={`http://localhost:5000/uploads/group-photos/${group.profile_picture}`}
            alt={group.group_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <MdGroup size={24} className="text-green-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{group.group_name}</h3>
        <p className="text-sm text-gray-500">Tap to view group details</p>
      </div>
    </div>
  );
};

export const Grouplist = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userGroups = await authService.getUserGroups();
        setGroups(userGroups);
        setError(null);
      } catch (err) {
        console.error('Error fetching user groups:', err);
        setError('Failed to load groups.');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [user]);

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your Groups</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Start by choosing a group you'd like to use. Don't have one yet? Create a new group to split the bill with your friends!
          </p>
        </div>

        {/* Group List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <MdGroups className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-4">No groups yet</p>
              <Link 
                to="/newgroup" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MdAdd size={20} />
                <span>Create Your First Group</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groups.map((group) => (
                <GroupItem key={group.group_id} group={group} />
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <Link to="/newgroup">
          <button
            className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
            aria-label="Add new group"
          >
            <MdAdd size={30} />
          </button>
        </Link>
      </div>
    </section>
  );
};
