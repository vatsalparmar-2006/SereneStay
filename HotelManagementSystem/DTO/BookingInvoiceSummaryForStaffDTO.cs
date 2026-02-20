namespace HotelManagementSystem.DTO
{
    public class BookingInvoiceSummaryForStaffDTO
    {
        public int BookingId { get; set; }
        public string GuestName { get; set; }
        public int RoomNumber { get; set; }
        public DateOnly CheckInDate { get; set; }
        public DateOnly CheckOutDate { get; set; }
        public string BookingStatus { get; set; }


        // If InvoiceId is null then it's not generated yet
        public int? InvoiceId { get; set; }
        public decimal? TotalAmount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime? InvoiceDate { get; set; }

        public decimal PaidAmount { get; set; }
        public decimal BalanceDue => (decimal)(TotalAmount - PaidAmount);
    }
}
