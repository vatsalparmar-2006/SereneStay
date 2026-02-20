namespace HotelManagementSystem.DTO
{
    public class RoomSearchRequestDTO
    {
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public int Adults { get; set; }
        public int Children { get; set; }

        public int TotalMembers => Adults + Children;
    }
}
