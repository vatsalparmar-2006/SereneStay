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
    public class ServiceUsagesController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;

        public ServiceUsagesController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        #region AddServiceUsage
        [HttpPost("AddServiceUsage")]
        public async Task<IActionResult> AddServiceUsage([FromBody] ServiceUsageCreateDTO serviceUsageDto)
        {
            try
            {
                var service = await _context.Services.FindAsync(serviceUsageDto.ServiceId);

                var usage = new ServiceUsage
                {
                    BookingId = serviceUsageDto.BookingId,
                    ServiceId = serviceUsageDto.ServiceId,
                    Quantity = serviceUsageDto.Quantity,
                    TotalPrice = service.ServicePrice * serviceUsageDto.Quantity,
                    UsedAt = DateTime.Now
                };

                await _context.ServiceUsages.AddAsync(usage);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Charge added to bill successfully",
                    ServiceUsageId = usage.UsageId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetAllUsage
        [HttpGet("GetAllUsage")]
        public async Task<IActionResult> GetAllUsage()
        {
            try
            {
                var usages = await _context.ServiceUsages
                    .Select(su => new ServiceUsageDisplayDTO
                    {
                        UsageId = su.UsageId,
                        BookingId = (int)su.BookingId,
                        ServiceId = (int)su.ServiceId,
                        Quantity = (int)su.Quantity,
                        TotalPrice = (decimal)su.TotalPrice,
                        UsedAt = (DateTime)su.UsedAt
                    })
                    .ToListAsync();

                return Ok(usages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetUsageById
        [HttpGet("GetUsageById/{id}")]
        public async Task<IActionResult> GetUsageById(int id)
        {
            try
            {
                var usage = await _context.ServiceUsages.FindAsync(id);

                if (usage == null)
                {
                    return NotFound("Service usage not found.");
                }

                var usageDto = new ServiceUsageDisplayDTO
                {
                    UsageId = usage.UsageId,
                    BookingId = (int)usage.BookingId,
                    ServiceId = (int)usage.ServiceId,
                    Quantity = (int)usage.Quantity,
                    TotalPrice = (decimal)usage.TotalPrice,
                    UsedAt = (DateTime)usage.UsedAt
                };

                return Ok(usageDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region UpdateUsage
        [HttpPut("UpdateUsage/{id}")]
        public async Task<IActionResult> UpdateUsage(int id, [FromBody] ServiceUsageCreateDTO serviceUsageDto)
        {
            try
            {
                var usage = await _context.ServiceUsages.FindAsync(id);
                if (usage == null)
                {
                    return NotFound("Service usage not found.");
                }

                var service = await _context.Services.FindAsync(serviceUsageDto.ServiceId);

                usage.BookingId = serviceUsageDto.BookingId;
                usage.ServiceId = serviceUsageDto.ServiceId;
                usage.Quantity = serviceUsageDto.Quantity;
                usage.TotalPrice = service.ServicePrice * serviceUsageDto.Quantity;
                usage.UsedAt = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Service usage updated successfully",
                    usage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region DeleteUsage
        [HttpDelete("DeleteUsage/{id}")]
        public async Task<IActionResult> DeleteUsage(int id)
        {
            try
            {
                var usage = await _context.ServiceUsages.FindAsync(id);
                if (usage == null)
                {
                    return NotFound($"Service UsagedID {id} not found.");
                }

                _context.ServiceUsages.Remove(usage);
                await _context.SaveChangesAsync();

                return Ok("Usage deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion
    }
}
