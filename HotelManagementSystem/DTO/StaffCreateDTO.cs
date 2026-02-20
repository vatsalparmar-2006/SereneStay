namespace HotelManagementSystem.DTO
{
    public class StaffCreateDTO
    {
        public string Username { get; set; }
        public string Password { get; set; } 
        public string FullName { get; set; }
        public string Role { get; set; } // Admin, Manager, Receptionist
    }
}
