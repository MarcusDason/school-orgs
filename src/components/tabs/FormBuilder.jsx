import { useState } from "react";
import { db } from "../../firebase/config";
import { ref, update } from "firebase/database";

export default function FormBuilder({ event, setEvent, onClose }) {
  const [fields, setFields] = useState([
    { label: "Untitled Question", type: "text", options: [] },
  ]);

  // ADD QUESTION
  const addField = () => {
    setFields([
      ...fields,
      { label: "Untitled Question", type: "text", options: [] },
    ]);
  };

  // UPDATE FIELD
  const updateField = (index, data) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...data };
    setFields(updated);
  };

  // DELETE FIELD
  const deleteField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  // SAVE FORM
  const saveForm = async () => {
    try {
      await update(ref(db, `events/${event.id}`), {
        attendanceFields: fields,
      });

      setEvent({ ...event, attendanceFields: fields });
      onClose();

    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-t-4 border-blue-500">
        <input
          type="text"
          placeholder="Untitled Form"
          className="w-full text-xl font-semibold bg-transparent outline-none dark:text-white"
        />
      </div>

      {/* QUESTIONS */}
      {fields.map((field, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col gap-3 border"
        >
          {/* QUESTION */}
          <input
            type="text"
            value={field.label}
            onChange={(e) =>
              updateField(index, { label: e.target.value })
            }
            className="text-lg border-b bg-transparent outline-none dark:text-white"
          />

          {/* TYPE */}
          <select
            value={field.type}
            onChange={(e) =>
              updateField(index, { type: e.target.value, options: [] })
            }
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="text">Short Answer</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
          </select>

          {/* OPTIONS */}
          {field.type === "select" && (
            <input
              type="text"
              placeholder="Option1, Option2"
              onChange={(e) =>
                updateField(index, {
                  options: e.target.value.split(",").map((o) => o.trim()),
                })
              }
              className="p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
          )}

          {/* DELETE */}
          <button
            onClick={() => deleteField(index)}
            className="text-red-500 text-sm"
          >
            Delete Question
          </button>
        </div>
      ))}

      {/* ADD BUTTON */}
      <button
        onClick={addField}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
      >
        + Add Question
      </button>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          onClick={saveForm}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Form
        </button>
      </div>
    </div>
  );
}