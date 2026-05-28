using HotelManagementSystem.DTO;
using HotelManagementSystem.Helper;
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
        public async Task<IActionResult> GetAllInvoices(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string search = ""
        )
        {
            try
            {
                var query = _context.Invoices
                    .Include(i => i.Booking).ThenInclude(b => b.Guest)
                    .Include(i => i.Booking).ThenInclude(b => b.Room)
                    .Include(i => i.Booking).ThenInclude(b => b.ServiceUsages)
                        .ThenInclude(s => s.Service)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    string s = search.ToLower();
                    query = query.Where(i => i.Booking.Guest.FullName.ToLower().Contains(s) ||
                                             i.InvoiceId.ToString() == s);
                }

                var pagedResult = await query
                    .OrderByDescending(i => i.InvoiceId)
                    .ToPagedResponseAsync(page, pageSize);

                var mappedData = pagedResult.Data.Select(invoice => MapToDisplayDto(invoice)).ToList();

                return Ok(new PagedResponse<InvoicesDisplayDTO>(
                    mappedData,
                    pagedResult.TotalRecords,
                    pagedResult.PageNumber,
                    pagedResult.PageSize
                ));
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
            var invoice = await _context.Invoices.FindAsync(id);

            if (invoice == null)
            {
                return NotFound("Invoice not found");
            }

            invoice.PaidAmount = invoice.TotalAmount ?? 0;

            invoice.PaymentStatus = "Paid";

            var booking = await _context.Bookings.FindAsync(invoice.BookingId);
            if (booking != null)
            {
                booking.Status = "Checked Out";
            }

            try
            {
                _context.Invoices.Update(invoice);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Balance settled successfully",
                    finalAmount = invoice.PaidAmount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error settling balance: {ex.Message}");
            }
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
                    PaidAmount = invoice.PaidAmount ?? 0m, 
                    PaymentStatus = invoice.PaymentStatus ?? "Unknown"
                };
            }

            int nights = Math.Max(1, (booking.CheckOutDate.ToDateTime(TimeOnly.MinValue)
                                 - booking.CheckInDate.ToDateTime(TimeOnly.MinValue)).Days);

            return new InvoicesDisplayDTO
            {
                InvoiceId = invoice.InvoiceId,
                BookingId = invoice.BookingId,
                GuestName = booking.Guest?.FullName ?? "Unknown", 
                Nights = nights,
                RoomCharges = invoice.RoomCharges ?? 0,
                ServiceCharges = invoice.ServiceCharges ?? 0,
                TaxAmount = invoice.TaxAmount ?? 0,
                TotalAmount = invoice.TotalAmount ?? 0,
                PaidAmount = invoice.PaidAmount ?? 0m,
                PaymentStatus = invoice.PaymentStatus ?? "Partially Paid",
                PaymentMethod = invoice.PaymentMethod ?? "Not Specified",
                InvoiceDate = invoice.InvoiceDate,

                Room = new RoomCreateDTO
                {
                    RoomNumber = booking.Room.RoomNumber,
                    RoomTypeId = booking.Room.RoomTypeId ?? 0,
                    PricePerNight = booking.Room.PricePerNight,
                    MaxOccupancy = booking.Room.MaxOccupancy ?? 2
                },

                Services = booking.ServiceUsages?.Select(s => new DisplayServicesDTO
                {
                    ServiceId = s.ServiceId ?? 0,
                    ServiceName = s.Service?.ServiceName ?? "Deleted Service",
                    ServicePrice = s.Service?.ServicePrice ?? 0m
                }).ToList() ?? new List<DisplayServicesDTO>(),

                BookingStatus = booking.Status ?? "Unknown",
                CheckOutDate = booking.CheckOutDate
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
