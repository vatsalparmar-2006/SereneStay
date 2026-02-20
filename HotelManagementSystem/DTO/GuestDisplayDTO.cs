namespace HotelManagementSystem.DTO
{
    public class GuestDisplayDTO
    {
        public int GuestId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string IdproofType { get; set; } // e.g., Aadhaar, Passport
        public string IdproofNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
