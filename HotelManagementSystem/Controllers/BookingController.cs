using HotelManagementSystem.DTO;
using HotelManagementSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class BookingController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;
        public BookingController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        #region AddBooking
        // POST: api/Booking/AddBooking
        [HttpPost("AddBooking")]
        public async Task<IActionResult> AddBooking([FromBody] BookingCreateDTO bookingDto)
        {
            try
            {
                decimal tokenAmount = 500m;

                var booking = new Booking
                {
                    GuestId = bookingDto.GuestId,
                    RoomId = bookingDto.RoomId,
                    CheckInDate = bookingDto.CheckInDate,
                    CheckOutDate = bookingDto.CheckOutDate,
                    Status = "Booked",
                    AdvancePaid = tokenAmount,
                    CreatedAt = DateTime.Now
                };

                await _context.Bookings.AddAsync(booking);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Booking created successfully",
                    bookingId = booking.BookingId,
                    advancePaid = booking.AdvancePaid
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion AddBooking

        #region GelAllBookings
        // GET: api/Booking/GetAllBookings
        [HttpGet("GetAllBookings")]
        public async Task<IActionResult> GetAllBookings()
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Guest)
                    .Select(b => new BookingDisplayDTO
                    {
                        BookingId = b.BookingId,
                        GuestId = b.GuestId,
                        RoomId = b.RoomId,
                        GuestName = b.Guest.FullName,
                        CheckInDate = b.CheckInDate,
                        CheckOutDate = b.CheckOutDate,
                        Status = b.Status,
                        AdvancePaid = b.AdvancePaid,
                        CreatedAt = (DateTime)b.CreatedAt
                    })
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetBookingById
        // GET: api/Booking/GetBookingById
        [HttpGet("GetBookingById/{id}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Guest)
                    .Where(b => b.BookingId == id)
                    .Select(b => new BookingDisplayDTO
                    {
                        BookingId = b.BookingId,
                        GuestId = b.GuestId,
                        RoomId = b.RoomId,
                        GuestName = b.Guest.FullName,
                        CheckInDate = b.CheckInDate,
                        CheckOutDate = b.CheckOutDate,
                        Status = b.Status,
                        AdvancePaid = b.AdvancePaid,
                        CreatedAt = (DateTime)b.CreatedAt
                    })
                    .ToListAsync();

                if (booking == null || booking.Count == 0)
                {
                    return NotFound($"BookingId {id} not found.");
                }

                return Ok(booking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region UpdateBooking
        // PUT: api/Booking/UpdateBooking/{id}
        [HttpPut("UpdateBooking/{id}")]
        public async Task<IActionResult> UpdateBooking(int id, [FromBody] BookingCreateDTO bookingDto)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound($"BookingId {id} not found.");
                }

                booking.GuestId = bookingDto.GuestId;
                booking.RoomId = bookingDto.RoomId;
                booking.CheckInDate = bookingDto.CheckInDate;
                booking.CheckOutDate = bookingDto.CheckOutDate;
                booking.Status = bookingDto.Status;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Booking updated successfully",
                    booking
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region DeleteBooking
        // DELETE: api/Booking/DeleteBooking/{id}
        [HttpDelete("DeleteBooking/{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound($"BookingId {id} not found.");
                }

                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();

                return Ok("Booking deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetAllBookingsWithInvoices
        // GET: api/Booking/GetAllBookingsWithInvoices
        [HttpGet("GetAllBookingsWithInvoices")]
        public async Task<IActionResult> GetAllBookingsWithInvoices()
        {
            try
            {
                var summary = await _context.Bookings
                    .Include(b => b.Guest)
                    .Include(b => b.Room)
                    .Include(b => b.Invoices)
                    .Select(b => new BookingInvoiceSummaryForStaffDTO
                    {
                        BookingId = b.BookingId,
                        GuestName = b.Guest.FullName,
                        RoomNumber = b.Room.RoomNumber,
                        CheckInDate = b.CheckInDate,
                        CheckOutDate = b.CheckOutDate,
                        BookingStatus = b.Status,

                        InvoiceId = b.Invoices.Select(i => i.InvoiceId).FirstOrDefault(),
                        TotalAmount = b.Invoices.Select(i => i.TotalAmount).FirstOrDefault(),

                        PaidAmount = (decimal)b.Invoices.Select(i => i.PaidAmount).FirstOrDefault(),

                        PaymentStatus = b.Invoices.Select(i => i.PaymentStatus).FirstOrDefault(),
                        InvoiceDate = b.Invoices.Select(i => i.InvoiceDate).FirstOrDefault()
                    })
                    .OrderByDescending(b => b.CheckInDate)
                    .ToListAsync();

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetBookingsByEmail
        // GET: api/Booking/GetBookingsByEmail{email}
        [HttpGet("GetBookingsByEmail/{email}")]
        public async Task<IActionResult> GetBookingsByEmail(string email)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Guest)
                    .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                    .Where(b => b.Guest.Email == email) 
                    .Select(b => new BookingInvoiceSummaryForStaffDTO
                    {
                        BookingId = b.BookingId,
                        GuestName = b.Guest.FullName,
                        RoomNumber = b.Room.RoomNumber,
                        CheckInDate = b.CheckInDate,
                        CheckOutDate = b.CheckOutDate,
                        BookingStatus = b.Status,
                        // Include price for the guest to see
                        PaidAmount = b.AdvancePaid,
                        TotalAmount = b.Room.PricePerNight,
                    })
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion
    }
}
