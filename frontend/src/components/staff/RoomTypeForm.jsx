import { useState } from "react";

const RoomTypeForm = ({ onSubmit, initialData = {}, onClose }) => {
  const [form, setForm] = useState({
    name: initialData.name || "",
    price: initialData.price || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <form className="bg-white p-6 rounded w-96" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Room Type</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Room Type Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomTypeForm;
