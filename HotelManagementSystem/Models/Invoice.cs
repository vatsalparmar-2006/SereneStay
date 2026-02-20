using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

public partial class Invoice
{
    [Key]
    [Column("InvoiceID")]
    public int InvoiceId { get; set; }

    [Column("BookingID")]
    public int? BookingId { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? RoomCharges { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? ServiceCharges { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? TaxAmount { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? PaidAmount { get; set; }

    [Column(TypeName = "decimal(12, 2)")]
    public decimal? TotalAmount { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? PaymentStatus { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? PaymentMethod { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? InvoiceDate { get; set; }

    [ForeignKey("BookingId")]
    [InverseProperty("Invoices")]
    public virtual Booking? Booking { get; set; }
}
