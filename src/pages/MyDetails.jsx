import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function MyDetails() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    state: "",
    position: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData((prev) => ({ ...prev, ...docSnap.data() }));
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load details:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await updateDoc(doc(db, "users", uid), formData);
      setMessage("Details updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("Something went wrong. Try again.");
    }
  };

  if (loading) return <p className="p-4">Loading your details...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">My Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white" />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white" />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white" />

        <select name="state" value={formData.state} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white">
          <option value="">Select State</option>
          <option value="NSW">NSW</option>
          <option value="QLD">QLD</option>
          <option value="VIC">VIC</option>
          <option value="WA">WA</option>
          <option value="SA">SA</option>
          <option value="TAS">TAS</option>
          <option value="NT">NT</option>
          <option value="ACT">ACT</option>
        </select>

        <select name="position" value={formData.position} onChange={handleChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white">
          <option value="">Select Position</option>
          <option value="Umpire">Umpire</option>
          <option value="Team Manager">Team Manager</option>
          <option value="Coach">Coach</option>
          <option value="Other">Other</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Update</button>
        {message && <p className="text-center text-sm mt-2 text-black dark:text-white">{message}</p>}
      </form>
    </div>
  );
}