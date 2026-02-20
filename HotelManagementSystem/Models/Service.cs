using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

public partial class Service
{
    [Key]
    [Column("ServiceID")]
    public int ServiceId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? ServiceName { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? ServicePrice { get; set; }

    [InverseProperty("Service")]
    public virtual ICollection<ServiceUsage> ServiceUsages { get; set; } = new List<ServiceUsage>();
}
