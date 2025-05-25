import { Link } from "react-router-dom";
import { MdOutlineAccountCircle, MdOutlineNotifications, MdPayments } from "react-icons/md";
import { GroupItem } from "./Groupitem";
import { useUser } from "../context/UserContext";

export const Main = () => {
  const { user } = useUser();
  const username = user?.username || "Guest";

  const groups = [
    { name: "Group 1", inviteLink: "http://example.com/invite1" },
    { name: "Group 2", inviteLink: "http://example.com/invite2" },
    { name: "Group 3", inviteLink: "http://example.com/invite3" },
    // Bisa ditambahkan grup lainnya
  ];

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
          {groups.map((group, index) => (
            <GroupItem key={index} groupName={group.name} inviteLink={group.inviteLink} />
          ))}
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
