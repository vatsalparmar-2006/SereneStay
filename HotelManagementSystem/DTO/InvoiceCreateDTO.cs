namespace HotelManagementSystem.DTO
{
    public class InvoiceCreateDTO
    {
        public int BookingId { get; set; }
        public string PaymentStatus { get; set; } //  Pending, Paid
        public string PaymentMethod { get; set; } //  Cash, Card, UPI
    }

    public class InvoiceUpdateDTO
    {
        public string PaymentStatus { get; set; } //  Pending, Paid
        public string PaymentMethod { get; set; } //  Cash, Card, UPI
    }
}
