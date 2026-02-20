using HotelManagementSystem.Models;

namespace HotelManagementSystem.DTO
{
    public class InvoicesDisplayDTO
    {
        public int InvoiceId { get; set; }
        public int? BookingId { get; set; }
        public string GuestName { get; set; }


        public RoomCreateDTO Room { get; set; }
        public List<DisplayServicesDTO> Services { get; set; }


        public int Nights { get; set; }
        public decimal RoomCharges { get; set; }
        public decimal ServiceCharges { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }

        // Calculate balance on the fly for the UI
        public decimal BalanceDue => TotalAmount - PaidAmount; 

        public string PaymentStatus { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime? InvoiceDate { get; set; }
    }
}
