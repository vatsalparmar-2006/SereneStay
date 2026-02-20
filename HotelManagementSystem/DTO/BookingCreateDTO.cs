namespace HotelManagementSystem.DTO
{
    public class BookingCreateDTO
    {
        public int GuestId { get; set; }
        public int RoomId { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public string Status { get; set; } // e.g., Booked, CheckedIn, Cancelled
    }

}
