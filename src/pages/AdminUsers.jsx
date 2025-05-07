
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
  const { role: currentUserRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const roles = ["admin", "umpire", "team", "unassigned"];

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setLoading(false);
    };

    if (currentUserRole === "admin") {
      fetchUsers();
    }
  }, [currentUserRole]);

  const handleRoleChange = async (userId, newRole) => {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  if (currentUserRole !== "admin") {
    return <p className="p-4">Access denied.</p>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border border-gray-300 dark:border-gray-600 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-2 text-left">First</th>
                <th className="p-2 text-left">Last</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">State</th>
                <th className="p-2 text-left">Position</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">{u.firstName || "-"}</td>
                  <td className="p-2">{u.lastName || "-"}</td>
                  <td className="p-2">{u.email || "-"}</td>
                  <td className="p-2">{u.phone || "-"}</td>
                  <td className="p-2">{u.state || "-"}</td>
                  <td className="p-2">{u.position || "-"}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-1 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
