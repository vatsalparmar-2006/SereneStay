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
    [Authorize(Roles = "Manager,Receptionist")]
    public class ServicesController : ControllerBase
    {
        private readonly HotelManagementSystemContext _context;
        public ServicesController(HotelManagementSystemContext context)
        {
            _context = context;
        }

        #region AddService
        // POST: api/Services/AddService
        [Authorize(Roles = "Manager")]
        [HttpPost("AddService")]
        public async Task<IActionResult> AddService([FromBody] ServicesDTO serviceDto)
        {
            try
            {
                if (serviceDto == null)
                {
                    return BadRequest("Service data is null.");
                }

                var newService = new Service
                {
                    ServiceName = serviceDto.ServiceName,
                    ServicePrice = serviceDto.ServicePrice
                };

                await _context.Services.AddAsync(newService);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Service added successfully", ServiceId = newService.ServiceId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region GetAllServices
        // GET: api/Services/AllServices
        [HttpGet("AllServices")]
        public async Task<IActionResult> GetAllServices(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string search = ""
        )
        {
            try
            {
                var query = _context.Services.AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    string s = search.ToLower();
                    query = query.Where(service => service.ServiceName.ToLower().Contains(s));
                }

                var projection = query.Select(s => new DisplayServicesDTO
                {
                    ServiceId = s.ServiceId,
                    ServiceName = s.ServiceName,
                    ServicePrice = (decimal)s.ServicePrice
                });

                var result = await projection.ToPagedResponseAsync(page, pageSize);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        //public async Task<IActionResult> GetAllServices()
        //{
        //    try
        //    {
        //        var services = await _context.Services
        //            .Select(s => new DisplayServicesDTO
        //            {
        //                ServiceId = s.ServiceId,
        //                ServiceName = s.ServiceName,
        //                ServicePrice = (decimal)s.ServicePrice
        //            })
        //            .ToListAsync();

        //        return Ok(services);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ex.Message);
        //    }
        //}
        #endregion

        #region GetServicesById
        // GET: api/Services/GetServicesById/{id}
        [HttpGet("GetServicesById/{id}")]
        public async Task<IActionResult> GetServicesById(int id)
        {
            try
            {
                var services = await _context.Services
                    .Where(s => s.ServiceId == id)
                    .Select(s => new DisplayServicesDTO
                    {
                        ServiceId = s.ServiceId,
                        ServiceName = s.ServiceName,
                        ServicePrice = (decimal)s.ServicePrice
                    })
                    .ToListAsync();

                if (services == null || services.Count == 0)
                {
                    return NotFound($"ServiceId {id} not found.");
                }

                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region UpdateService
        // PUT: api/Services/UpdateService/{id}
        [Authorize(Roles = "Manager")]
        [HttpPut("UpdateService/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] ServicesDTO dto)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);

                if (service == null)
                {
                    return BadRequest("Service not found.");
                }

                service.ServiceName = dto.ServiceName;
                service.ServicePrice = dto.ServicePrice;

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Service updated successfully", service });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion

        #region DeleteService
        // DELETE: api/Services/DeleteService/{id}
        [Authorize(Roles = "Manager")]
        [HttpDelete("DeleteService/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);

                if (service == null)
                {
                    return BadRequest("Service not Found");
                }

                _context.Services.Remove(service);
                await _context.SaveChangesAsync();

                return Ok("Service deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        #endregion
    }
}
