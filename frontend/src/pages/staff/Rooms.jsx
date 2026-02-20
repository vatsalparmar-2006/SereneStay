import { useEffect, useState } from "react";
import { getAllRooms, addRoom, updateRoom, deleteRoom } from "../../api/rooms.api";
import { getAllRoomTypes } from "../../api/roomType.api";
import { 
  Plus, Edit3, Trash2, Bed, Users, IndianRupee, X, 
  ArrowLeft, CheckCircle2, AlertTriangle 
} from "lucide-react";
import toast from "react-hot-toast";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New state
  const [deleteId, setDeleteId] = useState(null); // New state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const ROOM_TYPE_IMAGES = {
    "King Room": "https://www.conradpune.com/wp-content/uploads/2022/11/1-23.png",
    "Queen Room": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk7lSDa7zjrA4Dj5JQ6pk3ne9PdChvCkh0Uw&s",
    "Deluxe Room": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNutmXl1D_xBMsNK0M6jFiHqYaAi-dCBlfvg&s",
    "Luxury Suite": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
    "Standard Room": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3VZrLHR0machW45ByC25UBZeAD0q6iriMww&s"
  };

  const DEFAULT_ROOM_IMG = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800";

  const [formData, setFormData] = useState({
    roomNumber: "", roomTypeId: "", pricePerNight: "", maxOccupancy: "",
  });

  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await getAllRooms();
      setRooms(res.data);
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const loadRoomTypes = async () => {
    try {
      const res = await getAllRoomTypes();
      setRoomTypes(res.data);
    } catch (error) {
      console.error("Failed to load room types", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.roomID, formData);
        toast.success("Room updated successfully");
      } else {
        await addRoom(formData);
        toast.success("Room added successfully");
      }
      loadRooms();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomTypeId: roomTypes.find(rt => rt.typeName === room.roomTypeName)?.roomTypeId || "",
      pricePerNight: room.pricePerNight,
      maxOccupancy: room.maxOccupancy,
    });
    setShowModal(true);
  };

  // Trigger the confirmation modal instead of window.confirm
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      await deleteRoom(deleteId);
      toast.success("Room removed from inventory");
      setSelectedRoom(null);
      loadRooms();
    } catch (error) {
      toast.error("Failed to delete room");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({ roomNumber: "", roomTypeId: "", pricePerNight: "", maxOccupancy: "" });
    setEditingRoom(null);
    setShowModal(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {!selectedRoom && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hotel Inventory</h1>
            <p className="text-gray-500 mt-1">Quick view of all available suites and rooms.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm"
          >
            <Plus size={18} /> Add New Room
          </button>
        </div>
      )}

      {selectedRoom ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button onClick={() => setSelectedRoom(null)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium">
            <ArrowLeft size={20} /> Back to List
          </button>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[400px] lg:h-auto">
              <img 
                src={ROOM_TYPE_IMAGES[selectedRoom.roomTypeName] || DEFAULT_ROOM_IMG} 
                alt={selectedRoom.roomTypeName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_ROOM_IMG; }}
              />
            </div>

            <div className="p-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-black text-gray-900">{selectedRoom.roomTypeName}</h2>
                  <p className="text-blue-600 font-mono text-lg font-bold mt-1 uppercase">Room #{selectedRoom.roomNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 uppercase font-bold tracking-widest">Rate</p>
                  <p className="text-3xl font-black text-gray-900">₹{selectedRoom.pricePerNight}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600 mb-1">
                    <Users size={18} /> <span className="text-xs font-bold uppercase">Occupancy</span>
                  </div>
                  <p className="text-lg font-bold">{selectedRoom.maxOccupancy} Guests Max</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600 mb-1">
                    <Bed size={18} /> <span className="text-xs font-bold uppercase">Setup</span>
                  </div>
                  <p className="text-lg font-bold">{selectedRoom.bedCounts} Beds Provided</p>
                </div>
              </div>

              <div className="flex gap-4 border-t pt-8">
                <button onClick={() => handleEdit(selectedRoom)} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg">
                  <Edit3 size={18} /> Modify Room
                </button>
                <button 
                   onClick={() => confirmDelete(selectedRoom.roomID)}
                   className="px-6 flex items-center justify-center bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.roomID} onClick={() => setSelectedRoom(room)} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer relative">
              <div className="h-44 relative">
                <img src={ROOM_TYPE_IMAGES[room.roomTypeName] || DEFAULT_ROOM_IMG} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = DEFAULT_ROOM_IMG; }} />
                <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-xl font-black text-gray-900">₹{room.pricePerNight}</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">{room.roomTypeName}</h3>
                <p className="text-blue-600 font-bold text-xs mt-1 uppercase">ROOM #{room.roomNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW: Premium Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-gray-500 mb-8 font-medium">This action cannot be undone. This room will be permanently removed from the hotel inventory.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Add/Edit Room (Standard UI) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={resetForm} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Bed className="text-blue-600" /> {editingRoom ? "Edit Room" : "Add Room"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Room #" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} className="bg-gray-50 p-3 rounded-xl border border-gray-100 font-bold" required />
                <input type="number" placeholder="Max Guests" value={formData.maxOccupancy} onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })} className="bg-gray-50 p-3 rounded-xl border border-gray-100 font-bold" required />
              </div>
              <select value={formData.roomTypeId} onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 font-bold" required>
                <option value="">Select Category</option>
                {roomTypes.map((type) => (<option key={type.roomTypeId} value={type.roomTypeId}>{type.typeName}</option>))}
              </select>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" value={formData.pricePerNight} onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })} className="w-full bg-gray-50 p-3 pl-10 rounded-xl border border-gray-100 font-bold" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">{editingRoom ? "Save Changes" : "Create Room"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;