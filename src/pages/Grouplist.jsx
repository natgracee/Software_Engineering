import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd, MdArrowBack } from 'react-icons/md';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

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
  }, [user]); // Refetch groups when user changes

  return (
    <section className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700 absolute left-0"
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">Grouplist</h1>
      </div>

      <p className='text-sm mb-10'> Start by choosing a group you'd like to use. Don't have one yet? Create a new group to split the bill with your friends! </p>
      {/* Group List */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-sm space-y-4 max-h-[32rem] overflow-y-auto w-full">
        {loading ? (
          <p className="text-center text-gray-600">Loading groups...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : groups.length === 0 ? (
          <p className="text-center text-gray-600">No groups yet. Add a group!</p>
        ) : (
          groups.map((group) => (
            <Link
              key={group.group_id}
              to={`/group/${group.group_id}`}
              className="block"
            >
              <div className="flex items-center bg-white p-5 rounded-lg shadow border w-full hover:bg-gray-50 transition-colors">
                {/* Profile picture */}
                {group.photo ? (
                  <img
                    src={group.photo}
                    alt={group.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0 mr-5"
                  />
                ) : (
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 mr-5">
                    {group.group_name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Text area */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {group.group_name}
                    </h2>
                    {/* Assuming isNew is not returned by the backend yet */}
                    {/* {group.isNew && (
                      <span className="text-xs text-white bg-green-500 px-2 py-0.5 rounded">
                        New!
                      </span>
                    )} */}
                  </div>
                  {/* Assuming members are not returned by the backend endpoint yet */}
                  {/* <p className="text-sm text-gray-600">
                    {group.members.join(', ')}
                  </p> */}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <Link to="/newgroup">
        <button
          className="fixed bottom-8 right-8 green-button p-4 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Add new group"
        >
          <MdAdd size={30} />
        </button>
      </Link>
    </section>
  );
};
