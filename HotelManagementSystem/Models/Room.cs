using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

[Index("RoomNumber", Name = "UQ__Rooms__AE10E07AE5F85279", IsUnique = true)]
public partial class Room
{
    [Key]
    [Column("RoomID")]
    public int RoomId { get; set; }

    [Required]
    [Unicode(false)]
    public int RoomNumber { get; set; }

    [Column("RoomTypeID")]
    public int? RoomTypeId { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal PricePerNight { get; set; }

    public int? MaxOccupancy { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? Status { get; set; }

    [InverseProperty("Room")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [ForeignKey("RoomTypeId")]
    [InverseProperty("Rooms")]
    public virtual RoomType? RoomType { get; set; }

}
