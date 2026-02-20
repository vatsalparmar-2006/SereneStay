namespace HotelManagementSystem.DTO
{
    public class BookingDisplayDTO
    {
        public int BookingId { get; set; }
        public int? GuestId { get; set; }
        public string GuestName { get; set; }
        public int? RoomId { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal AdvancePaid { get; set; }
    }
}
