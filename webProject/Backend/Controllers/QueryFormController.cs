using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QueryFormController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public QueryFormController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
                return 1;
            }

            var userIdClaim = httpContext.User.FindFirst("userId") 
                             ?? httpContext.User.FindFirst("userID")
                             ?? httpContext.User.FindFirst("sub")
                             ?? httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            
            return 1;
        }

        // GET: api/QueryForm
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QueryForm>>> GetQueryForms()
        {
            try
            {
                var queryForms = await _context.QueryForms
                    .OrderByDescending(q => q.CreatedDT)
                    .ToListAsync();

                return Ok(queryForms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve query forms: {ex.Message}");
            }
        }

        // GET: api/QueryForm/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QueryForm>> GetQueryForm(int id)
        {
            try
            {
                var queryForm = await _context.QueryForms
                    .FirstOrDefaultAsync(q => q.queryID == id);

                if (queryForm == null)
                {
                    return NotFound($"Query form with ID {id} not found");
                }

                return queryForm;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve query form: {ex.Message}");
            }
        }

        // POST: api/QueryForm
        [HttpPost]
        public async Task<ActionResult<QueryForm>> PostQueryForm(QueryFormDto queryFormDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Model validation failed",
                        errors = ModelState.ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        )
                    });
                }

                // Convert empty strings to null for optional fields
                var queryForm = new QueryForm
                {
                    fullName = queryFormDto.fullName?.Trim(),
                    Mobile = queryFormDto.Mobile?.Trim(),
                    WhatsApp = string.IsNullOrEmpty(queryFormDto.WhatsApp) ? null : queryFormDto.WhatsApp.Trim(),
                    email = string.IsNullOrEmpty(queryFormDto.email) ? null : queryFormDto.email.Trim(),
                    groupHeadName = string.IsNullOrEmpty(queryFormDto.groupHeadName) ? null : queryFormDto.groupHeadName.Trim(),
                    groupHeadMobile = string.IsNullOrEmpty(queryFormDto.groupHeadMobile) ? null : queryFormDto.groupHeadMobile.Trim(),
                    groupHeadWhatsapp = string.IsNullOrEmpty(queryFormDto.groupHeadWhatsapp) ? null : queryFormDto.groupHeadWhatsapp.Trim(),
                    groupHeadEmail = string.IsNullOrEmpty(queryFormDto.groupHeadEmail) ? null : queryFormDto.groupHeadEmail.Trim(),
                    Route = string.IsNullOrEmpty(queryFormDto.Route) ? null : queryFormDto.Route.Trim(),
                    Airline = string.IsNullOrEmpty(queryFormDto.Airline) ? null : queryFormDto.Airline.Trim(),
                    Adjults = queryFormDto.Adjults,
                    Child = queryFormDto.Child,
                    CityResidance = string.IsNullOrEmpty(queryFormDto.CityResidance) ? null : queryFormDto.CityResidance.Trim(),
                    CityDeparture = string.IsNullOrEmpty(queryFormDto.CityDeparture) ? null : queryFormDto.CityDeparture.Trim(),
                    DateDeparture = queryFormDto.DateDeparture,
                    DateArrival = queryFormDto.DateArrival,
                    hotelCategory = string.IsNullOrEmpty(queryFormDto.hotelCategory) ? null : queryFormDto.hotelCategory.Trim(),
                    RoomType = string.IsNullOrEmpty(queryFormDto.RoomType) ? null : queryFormDto.RoomType.Trim(),
                    DaysMakkah = queryFormDto.DaysMakkah,
                    DaysMadina = queryFormDto.DaysMadina,
                    CreatedBy = GetCurrentUserId(),
                    CreatedDT = DateTime.Now
                };

                _context.QueryForms.Add(queryForm);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetQueryForm", new { id = queryForm.queryID }, queryForm);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to create query form: {ex.Message}");
            }
        }

        // PUT: api/QueryForm/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQueryForm(int id, QueryFormDto queryFormDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Model validation failed",
                        errors = ModelState.ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        )
                    });
                }

                var existingQueryForm = await _context.QueryForms
                    .FirstOrDefaultAsync(q => q.queryID == id);

                if (existingQueryForm == null)
                {
                    return NotFound($"Query form with ID {id} not found");
                }

                // Update properties
                existingQueryForm.fullName = queryFormDto.fullName?.Trim();
                existingQueryForm.Mobile = queryFormDto.Mobile?.Trim();
                existingQueryForm.WhatsApp = string.IsNullOrEmpty(queryFormDto.WhatsApp) ? null : queryFormDto.WhatsApp.Trim();
                existingQueryForm.email = string.IsNullOrEmpty(queryFormDto.email) ? null : queryFormDto.email.Trim();
                existingQueryForm.groupHeadName = string.IsNullOrEmpty(queryFormDto.groupHeadName) ? null : queryFormDto.groupHeadName.Trim();
                existingQueryForm.groupHeadMobile = string.IsNullOrEmpty(queryFormDto.groupHeadMobile) ? null : queryFormDto.groupHeadMobile.Trim();
                existingQueryForm.groupHeadWhatsapp = string.IsNullOrEmpty(queryFormDto.groupHeadWhatsapp) ? null : queryFormDto.groupHeadWhatsapp.Trim();
                existingQueryForm.groupHeadEmail = string.IsNullOrEmpty(queryFormDto.groupHeadEmail) ? null : queryFormDto.groupHeadEmail.Trim();
                existingQueryForm.Route = string.IsNullOrEmpty(queryFormDto.Route) ? null : queryFormDto.Route.Trim();
                existingQueryForm.Airline = string.IsNullOrEmpty(queryFormDto.Airline) ? null : queryFormDto.Airline.Trim();
                existingQueryForm.Adjults = queryFormDto.Adjults;
                existingQueryForm.Child = queryFormDto.Child;
                existingQueryForm.CityResidance = string.IsNullOrEmpty(queryFormDto.CityResidance) ? null : queryFormDto.CityResidance.Trim();
                existingQueryForm.CityDeparture = string.IsNullOrEmpty(queryFormDto.CityDeparture) ? null : queryFormDto.CityDeparture.Trim();
                existingQueryForm.DateDeparture = queryFormDto.DateDeparture;
                existingQueryForm.DateArrival = queryFormDto.DateArrival;
                existingQueryForm.hotelCategory = string.IsNullOrEmpty(queryFormDto.hotelCategory) ? null : queryFormDto.hotelCategory.Trim();
                existingQueryForm.RoomType = string.IsNullOrEmpty(queryFormDto.RoomType) ? null : queryFormDto.RoomType.Trim();
                existingQueryForm.DaysMakkah = queryFormDto.DaysMakkah;
                existingQueryForm.DaysMadina = queryFormDto.DaysMadina;
                existingQueryForm.ModifyBy = GetCurrentUserId();
                existingQueryForm.ModifyDT = DateTime.Now;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to update query form: {ex.Message}");
            }
        }

        // DELETE: api/QueryForm/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQueryForm(int id)
        {
            try
            {
                var queryForm = await _context.QueryForms.FindAsync(id);
                if (queryForm == null)
                {
                    return NotFound($"Query form with ID {id} not found");
                }

                _context.QueryForms.Remove(queryForm);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to delete query form: {ex.Message}");
            }
        }
    }
}