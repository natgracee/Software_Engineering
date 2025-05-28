import { Link } from "react-router-dom";
import { MdOutlineAccountCircle, MdOutlineNotifications, MdPayments, MdGroups, MdArrowForward, MdAdd, MdGroup } from "react-icons/md";
import { GroupItem } from "./Groupitem";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

export const Main = () => {
  const { user } = useUser();
  const username = user?.username || "Guest";
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [errorLoadingGroups, setErrorLoadingGroups] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) {
        setLoadingGroups(false);
        return;
      }
      try {
        setLoadingGroups(true);
        const userGroups = await authService.getUserGroups();
        // Assuming the backend returns groups with id and name
        setGroups(userGroups);
        setErrorLoadingGroups(null);
      } catch (err) {
        console.error("Error fetching user groups:", err);
        setErrorLoadingGroups("Failed to load groups.");
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchUserGroups();
  }, [user]); // Refetch groups when user changes

  return (
    <section className="min-h-screen flex flex-col px-4 sm:px-8 md:px-16 lg:px-40">
      {/* Header */}
      <div className="flex justify-between items-center py-4">
        <div className="text-2xl font-bold text-primary">BILLBuddy</div>
        <div className="flex space-x-4">
          <Link to="/notification" className="relative">
            <MdOutlineNotifications size={28} className="text-gray-700" />
          </Link>
          <Link to="/account">
            <MdOutlineAccountCircle size={28} className="text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="text-left mt-12 ml-4">
        <h2 className="text-lg font-bold">WELCOME</h2>
        <h2 className="text-4xl text-primary font-bold mb-12">
          {username.charAt(0).toUpperCase() + username.slice(1)}!
        </h2>
      </div>
      
      {/* Scan bills */}
      <div className="flex justify-center space-x-3 mb-10">
        <Link to="/grouplist">
        <button className="green-button font-semibold px-6 py-2 rounded-lg shadow flex items-center space-x-2">
          <MdPayments size={20} />
          <span>Start splitting</span>
        </button>
        </Link>
      </div>

      {/* Group List */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden mt-6 border border-gray-200">
        <div className="bg-green-600 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Groups</h2>
          <Link 
            to="/newgroup" 
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            title="Create New Group"
          >
            <MdAdd size={24} />
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {loadingGroups ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : errorLoadingGroups ? (
            <div className="text-center py-8">
              <MdError className="mx-auto text-red-500 mb-2" size={32} />
              <p className="text-red-600">{errorLoadingGroups}</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <MdGroups className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-600 mb-4">No groups yet</p>
              <Link 
                to="/creategroup" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MdAdd size={20} />
                <span>Create Your First Group</span>
              </Link>
            </div>
          ) : (
            groups.map((group) => (
              <div 
                key={group.group_id} 
                className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/group/${group.group_id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors overflow-hidden">
                  {group.profile_picture ? (
                    <img
                      src={`http://localhost:5000/uploads/group-photos/${group.profile_picture}`}
                      alt={group.group_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-green-700 text-lg font-semibold">
                      {group.group_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 truncate">{group.group_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 hidden group-hover:inline">View Details</span>
                      <MdArrowForward className="text-gray-400 group-hover:text-green-600 transition-colors" size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">Tap to manage bills and members</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {groups.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link 
              to="/grouplist" 
              className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 transition-colors font-medium"
            >
              <span>View all groups</span>
              <MdArrowForward size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
