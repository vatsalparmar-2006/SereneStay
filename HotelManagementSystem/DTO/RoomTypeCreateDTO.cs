namespace HotelManagementSystem.DTO
{
    public class RoomTypeCreateDTO
    {
        public string TypeName { get; set; }
        public int BedCounts { get; set; }

        public string Description { get; set; } = "No description available";
    }
}
