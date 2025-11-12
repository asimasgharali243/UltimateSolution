using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.Services;
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
    public class QuotationAccommodationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRateService _rateService;

        public QuotationAccommodationController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, IRateService rateService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _rateService = rateService;
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

        // GET: api/QuotationAccommodation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuotationAccommodation>>> GetQuotationAccommodations()
        {
            return await _context.QuotationAccommodations
                .Include(qa => qa.City)
                .Include(qa => qa.Hotel)
                .Include(qa => qa.Quotation)
                .ToListAsync();
        }

        // GET: api/QuotationAccommodation/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuotationAccommodation>> GetQuotationAccommodation(int id)
        {
            var quotationAccommodation = await _context.QuotationAccommodations
                .Include(qa => qa.City)
                .Include(qa => qa.Hotel)
                .Include(qa => qa.Quotation)
                .FirstOrDefaultAsync(qa => qa.id == id);

            if (quotationAccommodation == null)
            {
                return NotFound();
            }

            return quotationAccommodation;
        }

        // GET: api/QuotationAccommodation/quotation/5
        [HttpGet("quotation/{quotationId}")]
        public async Task<ActionResult<IEnumerable<QuotationAccommodation>>> GetAccommodationsByQuotationId(int quotationId)
        {
            var accommodations = await _context.QuotationAccommodations
                .Include(qa => qa.City)
                .Include(qa => qa.Hotel)
                .Where(qa => qa.quotation_id == quotationId)
                .ToListAsync();

            return accommodations;
        }

        // POST: api/QuotationAccommodation
        [HttpPost]
        public async Task<ActionResult<QuotationAccommodation>> PostQuotationAccommodation(QuotationAccommodation quotationAccommodation)
        {
            // Validate if City and Hotel exist
            var cityExists = await _context.Cities.AnyAsync(c => c.cityID == quotationAccommodation.cityID);
            if (!cityExists)
            {
                return BadRequest("Invalid City ID");
            }

            var hotelExists = await _context.Hotels.AnyAsync(h => h.hotelID == quotationAccommodation.hotelID);
            if (!hotelExists)
            {
                return BadRequest("Invalid Hotel ID");
            }

            // Validate check-in and check-out dates
            if (quotationAccommodation.check_in >= quotationAccommodation.check_out)
            {
                return BadRequest("Check-in date must be before check-out date");
            }

            // Get rate from RateHotel table
            var rate = await _rateService.GetRateByRoomType(
                quotationAccommodation.cityID, 
                quotationAccommodation.hotelID, 
                quotationAccommodation.room_type
            );

            if (rate == null)
            {
                return BadRequest($"Rate not found for the specified city, hotel, and room type");
            }

            // Calculate number of nights
            quotationAccommodation.no_of_nights = (int)(quotationAccommodation.check_out - quotationAccommodation.check_in).TotalDays;
            quotationAccommodation.rate_per_night = rate.Value;

            // Set audit fields
            var currentUserId = GetCurrentUserId();
            quotationAccommodation.created_at = DateTime.Now;
            quotationAccommodation.createdBy = currentUserId;
            quotationAccommodation.ModifyBy = null;

            _context.QuotationAccommodations.Add(quotationAccommodation);
            await _context.SaveChangesAsync();

            // Load navigation properties for response
            await _context.Entry(quotationAccommodation)
                .Reference(qa => qa.City)
                .LoadAsync();
            await _context.Entry(quotationAccommodation)
                .Reference(qa => qa.Hotel)
                .LoadAsync();

            return CreatedAtAction("GetQuotationAccommodation", new { id = quotationAccommodation.id }, quotationAccommodation);
        }

        // PUT: api/QuotationAccommodation/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuotationAccommodation(int id, QuotationAccommodation quotationAccommodation)
        {
            if (id != quotationAccommodation.id)
            {
                return BadRequest("ID mismatch");
            }

            var existingAccommodation = await _context.QuotationAccommodations.FindAsync(id);
            if (existingAccommodation == null)
            {
                return NotFound();
            }

            // Validate if City exists (if cityID is being updated)
            if (existingAccommodation.cityID != quotationAccommodation.cityID)
            {
                var cityExists = await _context.Cities.AnyAsync(c => c.cityID == quotationAccommodation.cityID);
                if (!cityExists)
                {
                    return BadRequest("Invalid City ID");
                }
            }

            // Validate if Hotel exists (if hotelID is being updated)
            if (existingAccommodation.hotelID != quotationAccommodation.hotelID)
            {
                var hotelExists = await _context.Hotels.AnyAsync(h => h.hotelID == quotationAccommodation.hotelID);
                if (!hotelExists)
                {
                    return BadRequest("Invalid Hotel ID");
                }
            }

            // Validate dates
            if (quotationAccommodation.check_in >= quotationAccommodation.check_out)
            {
                return BadRequest("Check-in date must be before check-out date");
            }

            // Get updated rate if city, hotel, or room type changed
            if (existingAccommodation.cityID != quotationAccommodation.cityID || 
                existingAccommodation.hotelID != quotationAccommodation.hotelID ||
                existingAccommodation.room_type != quotationAccommodation.room_type)
            {
                var rate = await _rateService.GetRateByRoomType(
                    quotationAccommodation.cityID, 
                    quotationAccommodation.hotelID, 
                    quotationAccommodation.room_type
                );

                if (rate == null)
                {
                    return BadRequest("Rate not found for the specified parameters");
                }
                quotationAccommodation.rate_per_night = rate.Value;
            }

            // Update fields
            existingAccommodation.quotation_id = quotationAccommodation.quotation_id;
            existingAccommodation.cityID = quotationAccommodation.cityID;
            existingAccommodation.hotelID = quotationAccommodation.hotelID;
            existingAccommodation.check_in = quotationAccommodation.check_in;
            existingAccommodation.check_out = quotationAccommodation.check_out;
            existingAccommodation.room_type = quotationAccommodation.room_type;
            existingAccommodation.no_of_rooms = quotationAccommodation.no_of_rooms;
            existingAccommodation.no_of_nights = (int)(quotationAccommodation.check_out - quotationAccommodation.check_in).TotalDays;
            existingAccommodation.rate_per_night = quotationAccommodation.rate_per_night;

            // Update audit field
            existingAccommodation.ModifyBy = GetCurrentUserId();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuotationAccommodationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/QuotationAccommodation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuotationAccommodation(int id)
        {
            var quotationAccommodation = await _context.QuotationAccommodations.FindAsync(id);
            if (quotationAccommodation == null)
            {
                return NotFound();
            }

            _context.QuotationAccommodations.Remove(quotationAccommodation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuotationAccommodationExists(int id)
        {
            return _context.QuotationAccommodations.Any(e => e.id == id);
        }
    }
}