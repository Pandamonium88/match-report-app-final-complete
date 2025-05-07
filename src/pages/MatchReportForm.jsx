import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function UmpireReportForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    venue: "",
    division: "",
    yourTeam: "",
    opponent: "",
    suspectActions: "",
    conduct: "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = {
      ...formData,
      submittedBy: user.uid,
      submittedAt: serverTimestamp(),
    };
    await addDoc(collection(db, "umpireReports"), docRef);
    setSuccess(true);
    setFormData({
      date: "",
      time: "",
      venue: "",
      division: "",
      yourTeam: "",
      opponent: "",
      suspectActions: "",
      conduct: "",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 shadow rounded">
      <h2 className="text-xl font-bold underline mb-4">Team Match Report</h2>
      {success && <p className="text-green-500 mb-4">Report submitted!</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          placeholder="Date"
          className="p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          required
        />
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          placeholder="Time"
          className="p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          required
        />
        <input
          type="text"
          name="venue"
          value={formData.venue}
          onChange={handleChange}
          placeholder="Venue"
          className="p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="text"
          name="division"
          value={formData.division}
          onChange={handleChange}
          placeholder="Division"
          className="p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="text"
          name="yourTeam"
          value={formData.yourTeam}
          onChange={handleChange}
          placeholder="Your Team"
          className="p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <input
          type="text"
          name="opponent"
          value={formData.opponent}
          onChange={handleChange}
          placeholder="Opponent"
          className="p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <textarea
          name="suspectActions"
          value={formData.suspectActions}
          onChange={handleChange}
          placeholder="Suspect Actions"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <textarea
          name="conduct"
          value={formData.conduct}
          onChange={handleChange}
          placeholder="Code of Conduct / General Feedback"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="col-span-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
