using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Models;

public partial class HotelManagementSystemContext : DbContext
{
    public HotelManagementSystemContext() { }

    public HotelManagementSystemContext(DbContextOptions<HotelManagementSystemContext> options)
        : base(options) { }

    public virtual DbSet<Booking> Bookings { get; set; }
    public virtual DbSet<Guest> Guests { get; set; }
    public virtual DbSet<Invoice> Invoices { get; set; }
    public virtual DbSet<Room> Rooms { get; set; }
    public virtual DbSet<RoomType> RoomTypes { get; set; }
    public virtual DbSet<Service> Services { get; set; }
    public virtual DbSet<ServiceUsage> ServiceUsages { get; set; }
    public virtual DbSet<Staff> Staffs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValue("Booked");

            // --- FIX FOR DECIMAL WARNING ---
            entity.Property(e => e.AdvancePaid)
                  .HasColumnType("decimal(18,2)")
                  .HasDefaultValue(500.00m);

            entity.HasOne(d => d.Guest).WithMany(p => p.Bookings);
            entity.HasOne(d => d.Room).WithMany(p => p.Bookings);
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId);
            entity.Property(e => e.InvoiceDate).HasDefaultValueSql("(getdate())");

            // Fix precision for other money fields
            entity.Property(e => e.RoomCharges).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ServiceCharges).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaidAmount).HasColumnType("decimal(18,2)");

            // If TotalAmount is computed in SQL, keep this, otherwise set precision
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.Property(e => e.PricePerNight).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.Property(e => e.ServicePrice).HasColumnType("decimal(18,2)");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}