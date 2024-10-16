// BullMQDashboard.js (React component)
const BullMQDashboard = () => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe
        src={`${import.meta.env.VITE_APP_API_BASE_URL}/admin/dashboard`}
        title="BullMQ Admin Dashboard"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default BullMQDashboard;
