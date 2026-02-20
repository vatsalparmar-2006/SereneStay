using HotelManagementSystem.DTO;
using HotelManagementSystem.Models;
using HotelManagementSystem.Pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;

namespace HotelManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;

        public InvoicesController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        #region AddInvoice
        // POST: api/Invoices/AddInvoice
        [HttpPost("AddInvoice")]
        public async Task<IActionResult> AddInvoice([FromBody] InvoiceCreateDTO invoicesDto)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Room)
                    .Include(b => b.ServiceUsages)
                    .FirstOrDefaultAsync(b => b.BookingId == invoicesDto.BookingId);

                if (booking == null)
                    return BadRequest("Booking not found");

                bool invoiceExists = await _context.Invoices
                    .AnyAsync(i => i.BookingId == invoicesDto.BookingId);

                if (invoiceExists)
                    return BadRequest("Invoice already exists for this booking");

                int nights = Math.Max(1,
                    (booking.CheckOutDate.ToDateTime(TimeOnly.MinValue)
                   - booking.CheckInDate.ToDateTime(TimeOnly.MinValue)).Days);

                decimal roomCharges = nights * booking.Room.PricePerNight;
                decimal serviceCharges = booking.ServiceUsages?
                    .Sum(s => s.TotalPrice ?? 0m) ?? 0m;
                decimal taxAmount = (roomCharges + serviceCharges) * 0.12m;
                decimal totalAmount = roomCharges + serviceCharges + taxAmount;

                decimal tokenAmount = booking.AdvancePaid;

                var invoice = new Invoice
                {
                    BookingId = invoicesDto.BookingId,
                    RoomCharges = roomCharges,
                    ServiceCharges = serviceCharges,
                    TaxAmount = taxAmount,
                    TotalAmount = totalAmount,
                    PaidAmount = tokenAmount,
                    PaymentStatus = totalAmount > tokenAmount ? "Partially Paid" : "Paid",
                    PaymentMethod = invoicesDto.PaymentMethod ?? "Not Specified",
                    InvoiceDate = DateTime.Now
                };

                await _context.Invoices.AddAsync(invoice);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Invoice generated successfully with token payment.",
                    invoiceId = invoice.InvoiceId,
                    paidAmount = invoice.PaidAmount,
                    outstandingAmt = totalAmount - tokenAmount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetAllInvoices
        // GET: api/Invoices/GetAllInvoices
        [HttpGet("GetAllInvoices")]
        public async Task<IActionResult> GetAllInvoices()
        {
            try
            {
                var invoices = await _context.Invoices
                    .Include(i => i.Booking).ThenInclude(b => b.Guest)
                    .Include(i => i.Booking).ThenInclude(b => b.Room)
                    .Include(i => i.Booking).ThenInclude(b => b.ServiceUsages)
                        .ThenInclude(s => s.Service)
                    .ToListAsync();

                var result = invoices.Select(invoice => MapToDisplayDto(invoice));

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetInvoiceById
        // GET: api/Invoices/GetInvoiceById/{id}
        [HttpGet("GetInvoiceById/{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Booking).ThenInclude(b => b.Guest)
                    .Include(i => i.Booking).ThenInclude(b => b.Room)
                    .Include(i => i.Booking).ThenInclude(b => b.ServiceUsages)
                        .ThenInclude(s => s.Service)
                    .FirstOrDefaultAsync(i => i.InvoiceId == id);

                if (invoice == null)
                    return NotFound($"InvoiceId {id} not found");

                return Ok(MapToDisplayDto(invoice));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region UpdateInvoice
        // PUT: api/Invoices/UpdateInvoice/{id}
        [HttpPut("UpdateInvoice/{id}")]
        public async Task<IActionResult> UpdateInvoice(int id, [FromBody] InvoiceCreateDTO invoicesDto)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Booking)
                        .ThenInclude(b => b.Room)
                    .Include(i => i.Booking)
                        .ThenInclude(b => b.ServiceUsages)
                    .FirstOrDefaultAsync(i => i.InvoiceId == id);

                if (invoice == null)
                    return NotFound("Invoice not found");

                var booking = invoice.Booking;

                int nights = Math.Max(1,
                    (booking.CheckOutDate.ToDateTime(TimeOnly.MinValue)
                   - booking.CheckInDate.ToDateTime(TimeOnly.MinValue)).Days);

                decimal roomCharges = nights * booking.Room.PricePerNight;
                decimal serviceCharges = booking.ServiceUsages?
                    .Sum(s => s.TotalPrice ?? 0m) ?? 0m;
                decimal taxAmount = (roomCharges + serviceCharges) * 0.12m;
                decimal newTotal = roomCharges + serviceCharges + taxAmount;

                invoice.RoomCharges = roomCharges;
                invoice.ServiceCharges = serviceCharges;
                invoice.TaxAmount = taxAmount;
                invoice.TotalAmount = newTotal;

                if (!string.IsNullOrEmpty(invoicesDto.PaymentStatus))
                {
                    invoice.PaymentStatus = invoicesDto.PaymentStatus;
                }
                else
                {
                    // Auto-update status: if PaidAmount matches or exceeds NewTotal, mark as Paid
                    invoice.PaymentStatus = (invoice.PaidAmount >= newTotal) ? "Paid" : "Partially Paid";
                }

                invoice.PaymentMethod = invoicesDto.PaymentMethod ?? invoice.PaymentMethod;
                invoice.InvoiceDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Invoice updated successfully",
                    invoiceId = invoice.InvoiceId,
                    currentPaid = invoice.PaidAmount,
                    remainingBalance = newTotal - invoice.PaidAmount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region DeleteInvoice
        // DELETE: api/Invoices/DeleteInvoice/{id}
        [HttpDelete("DeleteInvoice/{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            try
            {
                var invoice = await _context.Invoices.FindAsync(id);

                if (invoice == null)
                    return NotFound($"InvoiceId {id} not found");

                _context.Invoices.Remove(invoice);
                await _context.SaveChangesAsync();

                return Ok("Invoice deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region SettleBalance
        // PATCH: api/Invoices/SettleBalance/{id}
        [HttpPatch("SettleBalance/{id}")]
        public async Task<IActionResult> SettleBalance(int id)
        {
            try
            {
                var invoice = await _context.Invoices.FindAsync(id);
                if (invoice == null) return NotFound("Invoice not found");

                // Update PaidAmount to match the Total
                invoice.PaidAmount = (decimal)invoice.TotalAmount;
                invoice.PaymentStatus = "Paid";
                invoice.InvoiceDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Balance settled successfully", status = invoice.PaymentStatus });
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
        #endregion

        #region Helper Methods 

        #region MapToDisplayDto
        [NonAction]
        private InvoicesDisplayDTO MapToDisplayDto(Invoice invoice)
        {
            var booking = invoice.Booking;

            if (booking == null || booking.Room == null)
            {
                return new InvoicesDisplayDTO
                {
                    InvoiceId = invoice.InvoiceId,
                    GuestName = booking?.Guest?.FullName ?? "Unknown Guest",
                    TotalAmount = invoice.TotalAmount ?? 0,
                    PaidAmount = (decimal)invoice.PaidAmount,
                    PaymentStatus = invoice.PaymentStatus ?? "Unknown"
                };
            }

            int nights = Math.Max(1, (booking.CheckOutDate.ToDateTime(TimeOnly.MinValue)
                         - booking.CheckInDate.ToDateTime(TimeOnly.MinValue)).Days);

            return new InvoicesDisplayDTO
            {
                InvoiceId = invoice.InvoiceId,
                BookingId = invoice.BookingId,
                GuestName = booking.Guest.FullName,
                Nights = nights,
                RoomCharges = invoice.RoomCharges ?? 0,
                ServiceCharges = invoice.ServiceCharges ?? 0,
                TaxAmount = invoice.TaxAmount ?? 0,
                TotalAmount = invoice.TotalAmount ?? 0,
                PaidAmount = (decimal)invoice.PaidAmount, 
                PaymentStatus = invoice.PaymentStatus,
                PaymentMethod = invoice.PaymentMethod,
                InvoiceDate = invoice.InvoiceDate,
                Room = new RoomCreateDTO
                {
                    RoomNumber = booking.Room.RoomNumber,
                    PricePerNight = booking.Room.PricePerNight
                },
                Services = booking.ServiceUsages.Select(s => new DisplayServicesDTO
                {
                    ServiceName = s.Service.ServiceName,
                    ServicePrice = (decimal)s.Service.ServicePrice
                }).ToList() ?? new List<DisplayServicesDTO>()
            };
        }
        #endregion

        #region PDF
        [HttpGet("DownloadInvoicePdf/{id}")]
        public async Task<IActionResult> DownloadInvoicePdf(int id)
        {
            var invoice = await GetInvoiceDto(id);
            if (invoice == null)
                return NotFound("Invoice not found");

            var pdf = new InvoicePdfDocument(invoice);

            using var stream = new MemoryStream();
            pdf.GeneratePdf(stream);
            stream.Position = 0;

            return File(
                stream.ToArray(),
                "application/pdf",
                $"Invoice_{id}.pdf"
            );
        }

        #region GetInvoiceDto (for PDF generation)
        [NonAction]
        private async Task<InvoicesDisplayDTO?> GetInvoiceDto(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Booking).ThenInclude(b => b.Guest)
                .Include(i => i.Booking).ThenInclude(b => b.Room)
                .Include(i => i.Booking).ThenInclude(b => b.ServiceUsages).ThenInclude(s => s.Service)
                .FirstOrDefaultAsync(i => i.InvoiceId == id);

            return invoice == null ? null : MapToDisplayDto(invoice);
        }
        #endregion

        #endregion

        #endregion
    }
}
