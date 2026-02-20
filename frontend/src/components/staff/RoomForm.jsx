import { useState } from "react";

const RoomForm = ({ onSubmit, initialData = {}, onClose }) => {
  const [form, setForm] = useState({
    roomNumber: initialData.roomNumber || "",
    price: initialData.price || "",
    roomTypeId: initialData.roomTypeId || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-96"
      >
        <h2 className="text-xl font-bold mb-4">Room</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Room Number"
          value={form.roomNumber}
          onChange={e => setForm({ ...form, roomNumber: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Room Type ID"
          value={form.roomTypeId}
          onChange={e => setForm({ ...form, roomTypeId: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;
