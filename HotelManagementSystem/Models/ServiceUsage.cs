using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

[Table("ServiceUsage")]
public partial class ServiceUsage
{
    [Key]
    [Column("UsageID")]
    public int UsageId { get; set; }

    [Column("BookingID")]
    public int? BookingId { get; set; }

    [Column("ServiceID")]
    public int? ServiceId { get; set; }

    public int? Quantity { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? TotalPrice { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UsedAt { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("ServiceUsages")]
    public virtual Booking? Booking { get; set; }

    [ForeignKey("ServiceId")]
    [InverseProperty("ServiceUsages")]
    public virtual Service? Service { get; set; }
}
