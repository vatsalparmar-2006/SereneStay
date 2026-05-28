using HotelManagementSystem.DTO;
using HotelManagementSystem.Helper;
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
    public class RoomTypeController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;

        public RoomTypeController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        #region AddRoomType
        // POST: api/RoomType/AddRoomType
        [HttpPost("AddRoomType")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> AddRoomType([FromBody] RoomTypeCreateDTO typeDto)
        {
            try
            {
                if (typeDto == null || string.IsNullOrEmpty(typeDto.TypeName))
                    return BadRequest("Type Name is required.");

                if (typeDto.BedCounts <= 0)
                    return BadRequest("Bed count must be greater than zero.");

                var newType = new RoomType
                {
                    TypeName = typeDto.TypeName,
                    BedCounts = typeDto.BedCounts,
                    Description = typeDto.Description ?? "No description provided."
                };

                await _context.RoomTypes.AddAsync(newType);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Room Type added successfully!",
                    roomTypeId = newType.RoomTypeId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetAllRoomType
        // GET: api/RoomType/AllRoomsType
        [HttpGet("AllRoomType")]
        public async Task<IActionResult> GetAllRoomType(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string search = ""
        )
        {
            try
            {
                var query = _context.RoomTypes.AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    string s = search.ToLower();
                    query = query.Where(t => t.TypeName.ToLower().Contains(s) || t.Description.ToLower().Contains(s));
                }

                var pageResult = query.Select(t => new
                {
                    t.RoomTypeId,
                    t.TypeName,
                    t.BedCounts,
                    t.Description
                });

                var reult = await pageResult.ToPagedResponseAsync(page, pageSize);

                return Ok(reult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetRoomTypeById
        // GET: api/RoomType/GetRoomTypeById/{id}
        [HttpGet("GetRoomTypeById/{id}")]
        public async Task<IActionResult> GetRoomTypeById(int id)
        {
            try
            {
                var type = await _context.RoomTypes
                    .Where(r => r.RoomTypeId == id)
                    .Select(t => new
                    {
                        t.RoomTypeId,
                        t.TypeName,
                        t.BedCounts,
                        t.Description
                    })
                    .FirstOrDefaultAsync();
                
                if (type == null)
                {
                    if (type == null)
                    {
                        return NotFound($"RoomType number {id} not found.");
                    }
                }

                return Ok(type);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region UpdateRoomType
        // PUT: api/RoomType/UpdateRoomType/{id}
        [HttpPut("UpdateRoomType/{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> UpdateRoomType(int id, [FromBody] RoomTypeCreateDTO typeDto)
        {
            try
            {
                var type = await _context.RoomTypes.FindAsync(id);

                if (type == null)
                {
                    return BadRequest("Type not found.");
                }

                type.TypeName = typeDto.TypeName;
                type.BedCounts = typeDto.BedCounts;
                type.Description = typeDto.Description ?? "No description provided.";

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Service updated successfully", type });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region DeleteRoomType
        // DELETE: api/RoomType/DeleteRoomType/{id}
        [HttpDelete("DeleteRoomType/{id}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            try
            {
                var type = await _context.RoomTypes.FindAsync(id);

                if (type == null)
                {
                    return BadRequest("Type not Found");
                }

                _context.RoomTypes.Remove(type);
                await _context.SaveChangesAsync();

                return Ok("Type deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion
    }
}
