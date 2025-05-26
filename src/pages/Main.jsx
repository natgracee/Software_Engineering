import { Link } from "react-router-dom";
import { MdOutlineAccountCircle, MdOutlineNotifications, MdPayments } from "react-icons/md";
import { GroupItem } from "./Groupitem";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { authService } from "../services/authService";

export const Main = () => {
  const { user } = useUser();
  const username = user?.username || "Guest";
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [errorLoadingGroups, setErrorLoadingGroups] = useState(null);

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
      <div className="bg-green-100 rounded-xl shadow-xl overflow-hidden p-6 mt-6 h-screen">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-base font-semibold">Groups List</p>
          <Link to="/grouplist" className="text-sm text-primary hover:underline">
            See More
          </Link>
        </div>

        <div className="p-4 rounded-lg shadow-sm space-y-2 max-h-80 sm:max-h-[400px] lg:max-h-[500px] xl:max-h-[600px] overflow-y-auto">
          {loadingGroups ? (
            <p className="text-center text-gray-600">Loading groups...</p>
          ) : errorLoadingGroups ? (
            <p className="text-center text-red-600">{errorLoadingGroups}</p>
          ) : groups.length === 0 ? (
            <p className="text-center text-gray-600">No groups yet. Create one!</p>
          ) : (
            groups.map((group) => (
              <GroupItem 
                key={group.group_id} 
                id={group.group_id}
                groupName={group.group_name} 
                inviteLink={null} // Assuming inviteLink is not returned by the backend endpoint yet
              />
            ))
          )}
        </div>

        {/* Create Group Button
        <Link to="/newgroup" className="block mt-6">
          <button className="green-button py-2 px-6 rounded-lg mt-12">
            Create New Group
          </button>
        </Link> */}
      </div>
    </section>
  );
};
