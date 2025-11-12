using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
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
    public class RateVisaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RateVisaController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RateVisa>>> GetRateVisas()
        {
            return await _context.RateVisas.Include(r => r.Pax).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RateVisa>> GetRateVisa(int id)
        {
            var rateVisa = await _context.RateVisas
                .Include(r => r.Pax)
                .FirstOrDefaultAsync(r => r.id == id);

            if (rateVisa == null)
            {
                return NotFound();
            }

            return rateVisa;
        }

        private int GetCurrentUserId()
        {
            // Get user ID from JWT token claims
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId") 
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirst("userID")
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            
            // Fallback for development
            return 1;
        }

        [HttpPost]
        public async Task<ActionResult<RateVisa>> PostRateVisa(RateVisa rateVisa)
        {
            // Check if rate already exists for this pax type
            var existingRate = await _context.RateVisas
                .FirstOrDefaultAsync(r => r.paxid == rateVisa.paxid);

            if (existingRate != null)
            {
                return Conflict(new { message = "Visa rate already exists for this passenger type" });
            }

            // Set current user and timestamp
            var currentUserId = GetCurrentUserId();
            rateVisa.CreatedBy = currentUserId;
            rateVisa.CreatedDT = DateTime.Now;
            rateVisa.ModifyBy = null;
            rateVisa.ModifyDT = null;

            _context.RateVisas.Add(rateVisa);
            await _context.SaveChangesAsync();

            // Load the Pax data for the response
            await _context.Entry(rateVisa)
                .Reference(r => r.Pax)
                .LoadAsync();

            return CreatedAtAction("GetRateVisa", new { id = rateVisa.id }, rateVisa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRateVisa(int id, RateVisa updatedRateVisa)
        {
            // Check if the record exists
            var existingRateVisa = await _context.RateVisas.FindAsync(id);
            if (existingRateVisa == null)
            {
                return NotFound();
            }

            // Check if rate already exists for another pax type
            var duplicateRate = await _context.RateVisas
                .FirstOrDefaultAsync(r => r.paxid == updatedRateVisa.paxid && r.id != id);

            if (duplicateRate != null)
            {
                return Conflict(new { message = "Visa rate already exists for this passenger type" });
            }

            // Update only the fields that should be updated
            existingRateVisa.paxid = updatedRateVisa.paxid;
            existingRateVisa.rate = updatedRateVisa.rate;
            
            // Set modification info
            var currentUserId = GetCurrentUserId();
            existingRateVisa.ModifyBy = currentUserId;
            existingRateVisa.ModifyDT = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RateVisaExists(id))
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRateVisa(int id)
        {
            var rateVisa = await _context.RateVisas.FindAsync(id);
            if (rateVisa == null)
            {
                return NotFound();
            }

            _context.RateVisas.Remove(rateVisa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RateVisaExists(int id)
        {
            return _context.RateVisas.Any(e => e.id == id);
        }
    }
}