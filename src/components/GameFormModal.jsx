// src/components/GameFormModal.jsx
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { addDoc, updateDoc, doc, collection, Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "../firebase";

export default function GameFormModal({ isOpen, onClose, currentTournament, initialData, onSaved }) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    court: "",
    division: "",
    home: "",
    away: "",
    umpireId: "",
  });

  // Populate fields when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        date: dayjs(initialData.date).format("YYYY-MM-DD"),
        time: initialData.time || "",
        court: initialData.court || "",
        division: initialData.division || "",
        home: initialData.home || "",
        away: initialData.away || "",
        umpireId: initialData.umpireId || "",
      });
    } else {
      setForm({ date: "", time: "", court: "", division: "", home: "", away: "", umpireId: "" });
    }
  }, [initialData]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentTournament?.id) return;

    const payload = {
      date: Timestamp.fromDate(new Date(`${form.date}T00:00:00`)),
      time: form.time,
      court: form.court,
      division: form.division,
      home: form.home,
      away: form.away,
      umpireId: form.umpireId,
    };

    try {
      if (initialData?.id) {
        // update
        const ref = doc(db, `tournaments/${currentTournament.id}/matches`, initialData.id);
        await updateDoc(ref, payload);
      } else {
        // create
        const ref = collection(db, `tournaments/${currentTournament.id}/matches`);
        await addDoc(ref, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving game:", err);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="ease-in duration-150"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {initialData ? "Edit Game" : "Add Game"}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {["date","time","court","division","home","away","umpireId"].map(name => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </label>
                  <input
                    name={name}
                    type={name==="date"?"date": name==="time"?"time":"text"}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full p-2 border rounded bg-white dark:bg-gray-900 text-black dark:text-white"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}