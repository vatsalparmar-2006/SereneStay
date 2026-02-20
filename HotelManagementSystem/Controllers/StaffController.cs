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
    public class StaffController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;
        private readonly IAuthService _authService;

        public StaffController(HotelManagementSystemContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        // POST: api/Staff/login
        [AllowAnonymous] 
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] StaffLoginDTO loginDto)
        {
            // Authenticates the user and returns the JWT token and user info
            var result = await _authService.LoginAsync(loginDto.Username, loginDto.Password);

            if (result == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(result);
        }

        // POST: api/Staff/AddStaff(Registration)
        [AllowAnonymous]
        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddStaff([FromBody] StaffCreateDTO staffDto)
        {
            try
            {
                if (staffDto == null)
                {
                    return BadRequest("Staff data is required.");
                }

                var exists = await _context.Staffs.AnyAsync(s => s.Username == staffDto.Username);

                if (exists)
                {
                    return BadRequest("This username is already assigned to another staff member.");
                }

                var newStaff = new Staff
                {
                    Username = staffDto.Username.Trim(),
                    Password = staffDto.Password,
                    FullName = staffDto.FullName.Trim(),
                    Role = staffDto.Role,
                    CreatedAt = DateTime.Now
                };

                await _context.Staffs.AddAsync(newStaff);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Staff registered successfully!",
                    staffId = newStaff.StaffId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Staff/GetAllStaff
        [HttpGet("GetAllStaff")]
        public async Task<IActionResult> GetAllStaff()
        {
            try
            {
                var staffList = await _context.Staffs
                    .Select(s => new StaffDisplayDTO
                    {
                        StaffId = s.StaffId,
                        Username = s.Username,
                        FullName = s.FullName,
                        Role = s.Role,
                        CreatedAt = s.CreatedAt
                    })
                    .ToListAsync();

                return Ok(staffList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/Staff/GetStaffById/{id}
        [HttpGet("GetStaffById/{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            try
            {
                var staff = await _context.Staffs
                    .Where(s => s.StaffId == id)
                    .Select(s => new StaffDisplayDTO
                    {
                        StaffId = s.StaffId,
                        Username = s.Username,
                        FullName = s.FullName,
                        Role = s.Role,
                        CreatedAt = s.CreatedAt
                    })
                    .ToListAsync();

                if (staff == null || staff.Count == 0)
                {
                    return NotFound($"Staff ID {id} not found.");
                }

                return Ok(staff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT: api/Staff/UpdateStaff/{id}
        [HttpPut("UpdateStaff/{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] StaffCreateDTO staffDto)
        {
            try
            {
                var staff = await _context.Staffs.FindAsync(id);
                if (staff == null)
                {
                    return NotFound("Staff member not found.");
                }

                staff.Username = staffDto.Username;
                staff.FullName = staffDto.FullName;
                staff.Role = staffDto.Role;

                if (!string.IsNullOrEmpty(staffDto.Password))
                {
                    staff.Password = staffDto.Password;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Staff profile updated successfully",
                    staff
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE: api/Staff/DeleteStaff/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteStaff/{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var staff = await _context.Staffs.FindAsync(id);
                if (staff == null)
                {
                    return NotFound($"StaffId {id} not found");
                }

                _context.Staffs.Remove(staff);
                await _context.SaveChangesAsync();

                return Ok("Staff deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
