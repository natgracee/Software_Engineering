export const Notification = () => {
  return (
    <section className="min-h-screen flex flex-col px-4 sm:px-8 md:px-16 lg:px-40">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {/* Isi Notifikasi */}
      <div className="notification-item bg-gray-200 p-4 rounded-lg mb-4">
        <h3 className="font-semibold">New Group Invitation</h3>
        <p className="text-sm">You have been invited to join Group 1</p>
      </div>
      <div className="notification-item bg-gray-200 p-4 rounded-lg mb-4">
        <h3 className="font-semibold">Message from Admin</h3>
        <p className="text-sm">Please check the group announcements</p>
      </div>
    </section>
  );
};
