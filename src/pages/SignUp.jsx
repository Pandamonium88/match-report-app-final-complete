import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    state: '',
    position: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: form.email,
        role: "team",
        ...form
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-gray-900 rounded shadow-md">
      <h1 className="text-xl font-bold mb-4 text-black dark:text-white">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
        <select name="state" value={form.state} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white">
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
        <select name="position" value={form.position} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white">
          <option value="">Select Position</option>
          <option value="Player">Player</option>
          <option value="Coach">Coach</option>
          <option value="Manager">Manager</option>
          <option value="Official">Official</option>
        </select>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Sign Up</button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}