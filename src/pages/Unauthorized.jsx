
export default function Unauthorized() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p>Your account is not authorized to view this page.</p>
    </div>
  );
}
