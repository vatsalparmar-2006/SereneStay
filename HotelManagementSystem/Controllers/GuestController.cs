using HotelManagementSystem.DTO;
using HotelManagementSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace HotelManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GuestController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;
        public GuestController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        // POST: api/Guest/AddGuest
        [HttpPost("AddGuest")]
        [AllowAnonymous]
        public async Task<IActionResult> AddGuest([FromBody] GuestCreateDTO guestDto)
        {
            try
            {
                if (guestDto == null)
                {
                    return BadRequest("Guest data is null.");
                }

                var newGuest = new Guest
                {
                    FullName = guestDto.FullName,
                    Email = guestDto.Email,
                    Phone = guestDto.Phone,
                    Address = guestDto.Address,
                    IdproofType = guestDto.IdproofType,
                    IdproofNumber = guestDto.IdproofNumber,
                    CreatedAt = DateAndTime.Now
                };

                await _context.Guests.AddAsync(newGuest);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Guest added successfully",
                    GuestId = newGuest.GuestId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Guest/GetAllGuest
        [HttpGet("GetAllGuest")]
        public async Task<IActionResult> GetAllGuest()
        {
            try
            {
                var guests = await _context.Guests
                    .Select(g => new GuestDisplayDTO
                    {
                        GuestId = g.GuestId,
                        FullName = g.FullName,
                        Email = g.Email,
                        Phone = g.Phone,
                        Address = g.Address,
                        IdproofType = g.IdproofType,
                        IdproofNumber = g.IdproofNumber,
                        CreatedAt = (DateTime)g.CreatedAt
                    })
                    .ToListAsync();

                return Ok(guests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //GET: api/Guest/GetGuestById/{id}
        [HttpGet("GetAllGuest/{id}")]
        public async Task<IActionResult> GetGuestById(int id)
        {
            try
            {
                var guest = await _context.Guests.FindAsync(id);

                if (guest == null)
                {
                    return NotFound($"Guest {id} not found.");
                }

                var guests = await _context.Guests
                    .Where(g => g.GuestId == id)
                    .Select(g => new GuestDisplayDTO
                    {
                        GuestId = g.GuestId,
                        FullName = g.FullName,
                        Email = g.Email,
                        Phone = g.Phone,
                        Address = g.Address,
                        IdproofType = g.IdproofType,
                        IdproofNumber = g.IdproofNumber,
                        CreatedAt = (DateTime)g.CreatedAt
                    })
                    .ToListAsync();

                return Ok(guests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT: api/Guest/UpdateGuest/{id}
        [HttpPut("UpdateGuest/{id}")]
        public async Task<IActionResult> UpdateGuest(int id, [FromBody] GuestCreateDTO guestDto)
        {
            try
            {
                var guest = await _context.Guests.FindAsync(id);
                if (guest == null)
                {
                    return BadRequest("Guest not found.");
                }

                guest.FullName = guestDto.FullName;
                guest.Email = guestDto.Email;
                guest.Phone = guestDto.Phone;
                guest.Address = guestDto.Address;
                guest.IdproofType = guestDto.IdproofType;
                guest.IdproofNumber = guestDto.IdproofNumber;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Guest updated successfully",
                    guest
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE: api/Guest/DeleteGuest/{id}
        [HttpDelete("DeleteGuest/{id}")]
        public async Task<IActionResult> DeleteGuest(int id)
        {
            try
            {
                var guest = await _context.Guests.FindAsync(id);
                if (guest == null)
                {
                    return NotFound($"Guest {id} not found.");
                }

                _context.Guests.Remove(guest);
                await _context.SaveChangesAsync();

                return Ok("Guest deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Guest/GetGuestByEmail/{email}
        [HttpGet("GetGuestByEmail/{email}")]
        public async Task<IActionResult> GetGuestByEmail(string email)
        {
            var guest = await _context.Guests
                .FirstOrDefaultAsync(g => g.Email.ToLower() == email.ToLower());

            if (guest == null) return NotFound();
            return Ok(guest);
        }
    }
}