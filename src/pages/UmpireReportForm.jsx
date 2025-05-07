import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function UmpireReportForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    match: "",
    codeOfConduct: "",
    penalties: "",
    injuries: "",
    suspectActions: "",
    spiritTeamOne: "1",
    spiritTeamTwo: "1",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      match: "",
      codeOfConduct: "",
      penalties: "",
      injuries: "",
      suspectActions: "",
      spiritTeamOne: "1",
      spiritTeamTwo: "1",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 shadow rounded">
      <h2 className="text-2xl font-bold underline mb-4">Umpire Report</h2>
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
        <textarea
          name="match"
          value={formData.match}
          onChange={handleChange}
          placeholder="Match"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <textarea
          name="codeOfConduct"
          value={formData.codeOfConduct}
          onChange={handleChange}
          placeholder="Code Of Conduct"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <textarea
          name="penalties"
          value={formData.penalties}
          onChange={handleChange}
          placeholder="Penalties"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <textarea
          name="injuries"
          value={formData.injuries}
          onChange={handleChange}
          placeholder="Injuries"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <textarea
          name="suspectActions"
          value={formData.suspectActions}
          onChange={handleChange}
          placeholder="Suspect Actions"
          className="col-span-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        
        <div className="col-span-full md:col-span-1">
          <label className="block text-sm text-black dark:text-white mb-1">Spirit of Cricket – Team 1</label>
          <select
            name="spiritTeamOne"
            value={formData.spiritTeamOne}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="col-span-full md:col-span-1">
          <label className="block text-sm text-black dark:text-white mb-1">Spirit of Cricket – Team 2</label>
          <select
            name="spiritTeamTwo"
            value={formData.spiritTeamTwo}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="col-span-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Submit Umpire Report
        </button>
      </form>
    </div>
  );
}