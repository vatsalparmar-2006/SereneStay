namespace HotelManagementSystem.DTO
{
    public class RoomDisplayDTO
    {
        public int RoomID { get; set; }
        public int RoomNumber { get; set; }
        public string RoomTypeName { get; set; }
        public decimal PricePerNight { get; set; }
        public string Status { get; set; }

        public int BedCounts { get; set; }
        public int MaxOccupancy { get; set; }
        public string Description { get; set; } = "No description available";

        public DateOnly? NextAvailableDate { get; set; }

    }
}
