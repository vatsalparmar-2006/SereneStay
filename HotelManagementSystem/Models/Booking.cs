using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

public partial class Booking
{
    [Key]
    [Column("BookingID")]
    public int BookingId { get; set; }

    [Required]
    [Column("GuestID")]
    public int? GuestId { get; set; }

    [Required]
    [Column("RoomID")]
    public int? RoomId { get; set; }

    [Required]
    public DateOnly CheckInDate { get; set; }

    [Required]
    public DateOnly CheckOutDate { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? Status { get; set; }

    [Required]
    public decimal AdvancePaid { get; set; } = 500.00m;// This will store the 500

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("GuestId")]
    [InverseProperty("Bookings")]
    public virtual Guest? Guest { get; set; }

    [InverseProperty("Booking")]
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    [ForeignKey("RoomId")]
    [InverseProperty("Bookings")]
    public virtual Room? Room { get; set; }

    [InverseProperty("Booking")]
    public virtual ICollection<ServiceUsage> ServiceUsages { get; set; } = new List<ServiceUsage>();
}
