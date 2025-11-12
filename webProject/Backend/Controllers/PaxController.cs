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
    public class PaxController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PaxController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pax>>> GetPaxes()
        {
            return await _context.Paxes.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pax>> GetPax(int id)
        {
            var pax = await _context.Paxes.FindAsync(id);

            if (pax == null)
            {
                return NotFound();
            }

            return pax;
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckPaxNameExists([FromQuery] string paxTitle, [FromQuery] int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(paxTitle))
            {
                return BadRequest("Pax title is required");
            }

            var query = _context.Paxes.Where(p => p.paxTitle.ToLower() == paxTitle.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.paxID != excludeId.Value);
            }

            var exists = await query.AnyAsync();
            return Ok(exists);
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
        public async Task<ActionResult<Pax>> PostPax(Pax pax)
        {
            // Check if pax title already exists
            var existingPax = await _context.Paxes
                .FirstOrDefaultAsync(p => p.paxTitle.ToLower() == pax.paxTitle.ToLower());

            if (existingPax != null)
            {
                return Conflict(new { message = "Pax title already exists" });
            }

            // Set current user and timestamp
            var currentUserId = GetCurrentUserId();
            pax.CreatedBy = currentUserId;
            pax.CreatedDT = DateTime.Now;
            pax.ModifyBy = null;
            pax.ModifyDT = null;

            _context.Paxes.Add(pax);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPax", new { id = pax.paxID }, pax);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPax(int id, Pax updatedPax)
        {
            // Check if the record exists
            var existingPax = await _context.Paxes.FindAsync(id);
            if (existingPax == null)
            {
                return NotFound();
            }

            // Check if pax title already exists (excluding current record)
            if (!string.IsNullOrEmpty(updatedPax.paxTitle))
            {
                var duplicatePax = await _context.Paxes
                    .FirstOrDefaultAsync(p => p.paxTitle.ToLower() == updatedPax.paxTitle.ToLower() && p.paxID != id);

                if (duplicatePax != null)
                {
                    return Conflict(new { message = "Pax title already exists" });
                }
            }

            // Update only the fields that should be updated
            existingPax.paxTitle = updatedPax.paxTitle;
            
            // Set modification info
            var currentUserId = GetCurrentUserId();
            existingPax.ModifyBy = currentUserId;
            existingPax.ModifyDT = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePax(int id)
        {
            var pax = await _context.Paxes.FindAsync(id);
            if (pax == null)
            {
                return NotFound();
            }

            _context.Paxes.Remove(pax);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PaxExists(int id)
        {
            return _context.Paxes.Any(e => e.paxID == id);
        }
    }
}