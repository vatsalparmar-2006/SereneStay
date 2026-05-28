namespace HotelManagementSystem.DTO
{
    public class InvoiceCreateDTO
    {
        public int BookingId { get; set; }
        public string? PaymentStatus { get; set; } 
        public string? PaymentMethod { get; set; } 
    }

    public class InvoiceUpdateDTO
    {
        public string? PaymentStatus { get; set; } 
        public string? PaymentMethod { get; set; } 
    }
}
