import { useState } from "react";

const StaffForm = ({ onSubmit, initialData = {}, onClose }) => {
  const [form, setForm] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    role: initialData.role || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <form className="bg-white p-6 rounded w-96" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Staff</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-3"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Receptionist">Receptionist</option>
        </select>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
