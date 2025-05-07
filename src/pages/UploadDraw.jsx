import { useState } from "react";
import { useTournament } from "../context/TournamentContext";
import Papa from "papaparse";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export default function UploadDraw() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const { currentTournament } = useTournament();

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Parsing CSV...");

    Papa.parse(file, {
      header: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: async (results) => {
        const data = results.data;
        let successCount = 0;
        try {
          for (let row of data) {
            if (!row.date || !row.time || !row.court || !row.division || !row.home || !row.away || !row.umpire) continue;

            const parsedDate = dayjs(row.date.trim(), ["DD/MM/YYYY", "MM/DD/YYYY"], true);
            console.log("Parsed date:", row.date.trim(), "=>", parsedDate.format("YYYY-MM-DD"));
            if (!parsedDate.isValid()) continue;

            const match = {
              date: Timestamp.fromDate(parsedDate.toDate()),
              time: row.time,
              court: row.court,
              division: row.division,
              home: row.home.trim(),
              away: row.away.trim(),
              umpire: row.umpire.trim(),
            };

            if (!currentTournament) {
              setStatus("❌ No tournament selected.");
              return;
            }

            await addDoc(
              collection(db, `tournaments/${currentTournament.id}/matches`),
              match
            );
            successCount++;
          }
          setStatus(`✅ Uploaded ${successCount} matches.`);
        } catch (err) {
          console.error(err);
          setStatus("❌ Error during upload.");
        }
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setStatus("❌ Failed to parse CSV.");
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Upload Match Draw</h2>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpload}>
        Upload
      </button>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{status}</p>
    </div>
  );
}