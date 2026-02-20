using System.ComponentModel.DataAnnotations;

namespace HotelManagementSystem.Models
{
    public class Staff
    {
        [Key]
        public int StaffId { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        public string Password{ get; set; } 

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [StringLength(50)]
        public string Role { get; set; } = "Staff"; //  Admin, Manager, Receptionist

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
