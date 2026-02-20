using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

public partial class Guest
{
    [Key]
    [Column("GuestID")]
    public int GuestId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string FullName { get; set; } = null!;

    [StringLength(100)]
    [Unicode(false)]
    public string? Email { get; set; }

    [StringLength(15)]
    [Unicode(false)]
    public string? Phone { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string? Address { get; set; }

    [Column("IDProofType")]
    [StringLength(50)]
    [Unicode(false)]
    public string? IdproofType { get; set; }

    [Column("IDProofNumber")]
    [StringLength(50)]
    [Unicode(false)]
    public string? IdproofNumber { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Guest")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
