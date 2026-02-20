namespace HotelManagementSystem.DTO
{
    public class ServiceUsageDisplayDTO
    {
        public int UsageId { get; set; }
        public int BookingId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
        public Decimal TotalPrice { get; set; }
        public DateTime UsedAt { get; set; }
    }
}
