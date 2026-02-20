using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

public partial class RoomType
{
    [Key]
    [Column("RoomTypeID")]
    public int RoomTypeId { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string TypeName { get; set; } = null!;

    public int BedCounts { get; set; }

    [StringLength(50)]
    public string Description { get; set; } = "No description available"!;

    [InverseProperty("RoomType")]
    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
