namespace HotelManagementSystem.DTO
{
    public class RoomCreateDTO
    {
        public int RoomNumber { get; set; }
        public int RoomTypeId { get; set; } 
        public decimal PricePerNight { get; set; }
        public int MaxOccupancy { get; set; }
    }

}
