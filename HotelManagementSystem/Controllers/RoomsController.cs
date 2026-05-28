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
    [Authorize]
    public class RoomsController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;

        public RoomsController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        #region AddRoom
        // POST: api/Rooms/AddRoom
        [Authorize(Roles = "Manager")]
        [HttpPost("AddRoom")]
        public async Task<IActionResult> AddRoom([FromBody] RoomCreateDTO roomDto)
        {
            try
            {
                if (roomDto == null)
                {
                    return BadRequest("Room data is null.");
                }

                var newRoom = new Room
                {
                    RoomNumber = roomDto.RoomNumber,
                    RoomTypeId = roomDto.RoomTypeId,
                    PricePerNight = roomDto.PricePerNight,
                    MaxOccupancy = roomDto.MaxOccupancy,
                    Status = "Available"
                };

                await _context.Rooms.AddAsync(newRoom);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Room added successfully", RoomId = newRoom.RoomId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetAllRooms
        // GET: api/Rooms/AllRooms
        [HttpGet("AllRooms")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllRooms()
        {
            try
            {
                var rooms = await _context.Rooms
                    .Include(r => r.RoomType)
                    .Select(r => new RoomDisplayDTO
                    {
                        RoomID = r.RoomId,
                        RoomNumber = r.RoomNumber,
                        RoomTypeName = r.RoomType.TypeName,
                        PricePerNight = r.PricePerNight,
                        MaxOccupancy = (int)(r.MaxOccupancy ?? 2),
                        BedCounts = r.RoomType.BedCounts,
                        Status = r.Status,
                        Description = r.RoomType.Description ?? "No description available"
                    })
                    .ToListAsync();

                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetRoomById
        //GET: api/Rooms/GetRoomById/{id}
        [HttpGet("GetRoomById/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRoomById(int id)
        {
            try
            {
                var room = await _context.Rooms.FindAsync(id);

                if (room == null)
                {
                    return NotFound($"Room number {id} not found.");
                }

                var rooms = await _context.Rooms
                    .Include(r => r.RoomType)
                    .Where(r => r.RoomId == id)
                    .Select(r => new RoomDisplayDTO
                    {
                        RoomID = r.RoomId,
                        RoomNumber = r.RoomNumber,
                        RoomTypeName = r.RoomType.TypeName,
                        PricePerNight = r.PricePerNight,
                        MaxOccupancy = (int)r.MaxOccupancy,
                        BedCounts = r.RoomType.BedCounts,
                        Status = r.Status,
                        Description = r.RoomType.Description ?? "No description available."
                    })
                    .ToListAsync();

                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region UpdateRoom
        // PUT: api/Rooms/UpdateRoom/{id}
        [Authorize(Roles = "Manager")]
        [HttpPut("UpdateRoom/{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] RoomCreateDTO roomDto)
        {
            try
            {
                var room = await _context.Rooms.FindAsync(id);
                if (room == null)
                {
                    return BadRequest("Service not found.");
                }

                room.RoomNumber = roomDto.RoomNumber;
                room.RoomTypeId = roomDto.RoomTypeId;
                room.PricePerNight = roomDto.PricePerNight;
                room.MaxOccupancy = roomDto.MaxOccupancy;

                await _context.SaveChangesAsync();

                var result = await _context.Rooms
                    .Include(r => r.RoomType)
                    .Where(r => r.RoomId == id)
                    .Select(r => new RoomDisplayDTO
                    {
                        RoomID = r.RoomId,
                        RoomNumber = r.RoomNumber,
                        RoomTypeName = r.RoomType.TypeName,
                        PricePerNight = r.PricePerNight,
                        MaxOccupancy = (int)r.MaxOccupancy,
                        Status = r.Status
                    })
                    .ToListAsync();

                return Ok(new { Message = "Room updated successfully", room = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region DeleteRoom
        // DELETE: api/Rooms/DeleteRoom/{id}
        [Authorize(Roles = "Manager")]
        [HttpDelete("DeleteRoom/{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            try
            {
                var room = await _context.Rooms.FindAsync(id);

                if (room == null)
                {
                    return BadRequest("Room not Found");
                }

                _context.Rooms.Remove(room);
                await _context.SaveChangesAsync();

                return Ok("Room deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region SearchAvailableRooms
        // GET: api/Rooms/SearchAvailableRooms
        [HttpGet("SearchAvailableRooms")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchAvailableRooms([FromQuery] RoomSearchRequestDTO searchRoomDto)
        {
            try
            {
                DateOnly today = DateOnly.FromDateTime(DateTime.Today);

                // Validation 
                if (searchRoomDto.CheckInDate < today)
                    return BadRequest("Check-in date cannot be in the past.");

                if (searchRoomDto.CheckInDate >= searchRoomDto.CheckOutDate)
                    return BadRequest("Check-out date must be after check-in date.");

                if (searchRoomDto.Adults <= 0)
                    return BadRequest("At least one adult is required.");

                int actualGuests = searchRoomDto.Adults + searchRoomDto.Children;
                int effectiveMembers = (searchRoomDto.TotalMembers > 0 && searchRoomDto.TotalMembers <= actualGuests)
                                       ? searchRoomDto.TotalMembers
                                       : actualGuests;

                // Identify Booked Room IDs
                var bookedRoomIds = await _context.Bookings
                    .Where(b => b.Status != "Cancelled" &&
                                searchRoomDto.CheckInDate < b.CheckOutDate &&
                                searchRoomDto.CheckOutDate > b.CheckInDate)
                    .Select(b => b.RoomId)
                    .Distinct()
                    .ToListAsync();

                // Fetch ONLY Available Rooms
                var rooms = await _context.Rooms
                    .Include(r => r.RoomType)
                    .Where(r => !bookedRoomIds.Contains(r.RoomId)) 
                    .Where(r => r.Status == "Available") 
                    .ToListAsync();

                if (!rooms.Any())
                {
                    return Ok(new { Message = "No rooms available for the selected dates.", Rooms = new List<RoomDisplayDTO>() });
                }

                int maxCapacity = (int)rooms.Max(r => r.MaxOccupancy);
                bool requiresMultipleRooms = effectiveMembers > maxCapacity;

                // Map to DTO
                var result = rooms
                    .Where(r => r.MaxOccupancy >= effectiveMembers || requiresMultipleRooms)
                    .Select(r => new RoomDisplayDTO
                    {
                        RoomID = r.RoomId,
                        RoomNumber = r.RoomNumber,
                        RoomTypeName = r.RoomType.TypeName,
                        BedCounts = r.RoomType.BedCounts,
                        PricePerNight = r.PricePerNight,
                        MaxOccupancy = (int)r.MaxOccupancy,
                        Status = "Available", 
                        Description = r.RoomType.Description
                    })
                    .OrderBy(r => r.RoomNumber)
                    .ToList();

                return Ok(new
                {
                    EffectiveMembers = effectiveMembers,
                    RequiresMultipleRooms = requiresMultipleRooms,
                    Message = requiresMultipleRooms
                        ? "You may need to select multiple rooms depending on your requirements."
                        : "Single room booking possible.",
                    Rooms = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion
    }
}
