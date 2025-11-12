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
    public class RateHotelController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RateHotelController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RateHotel>>> GetRateHotels()
        {
            return await _context.RateHotels
                .Include(r => r.City)
                .Include(r => r.Hotel)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RateHotel>> GetRateHotel(int id)
        {
            var rateHotel = await _context.RateHotels
                .Include(r => r.City)
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.id == id);

            if (rateHotel == null)
            {
                return NotFound();
            }

            return rateHotel;
        }

        [HttpGet("by-composite/{cityID}/{hotelID}")]
        public async Task<ActionResult<RateHotel>> GetRateHotelByComposite(int cityID, int hotelID)
        {
            var rateHotel = await _context.RateHotels
                .Include(r => r.City)
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.cityID == cityID && r.hotelID == hotelID);

            if (rateHotel == null)
            {
                return NotFound();
            }

            return rateHotel;
        }

        [HttpPost]
        public async Task<ActionResult<RateHotel>> PostRateHotel(RateHotel rateHotel)
        {
            // Check if rate already exists for this city and hotel combination
            var existingRate = await _context.RateHotels
                .FirstOrDefaultAsync(r => r.cityID == rateHotel.cityID && r.hotelID == rateHotel.hotelID);

            if (existingRate != null)
            {
                return Conflict(new { message = "Hotel rate already exists for this city and hotel combination" });
            }

            _context.RateHotels.Add(rateHotel);
            await _context.SaveChangesAsync();

            // Load navigation properties for response
            await _context.Entry(rateHotel)
                .Reference(r => r.City)
                .LoadAsync();
            await _context.Entry(rateHotel)
                .Reference(r => r.Hotel)
                .LoadAsync();

            return CreatedAtAction("GetRateHotel", new { id = rateHotel.id }, rateHotel);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRateHotel(int id, RateHotel updatedRateHotel)
        {
            // if (id != updatedRateHotel.id)
            // {
            //     return BadRequest("ID mismatch");
            // }

            // Check if the record exists
            var existingRateHotel = await _context.RateHotels.FindAsync(id);
            if (existingRateHotel == null)
            {
                return NotFound();
            }

            // Check if rate already exists for another city-hotel combination
            var duplicateRate = await _context.RateHotels
                .FirstOrDefaultAsync(r => r.cityID == updatedRateHotel.cityID && 
                                         r.hotelID == updatedRateHotel.hotelID && 
                                         r.id != id);

            if (duplicateRate != null)
            {
                return Conflict(new { message = "Hotel rate already exists for this city and hotel combination" });
            }

            // Update fields
            existingRateHotel.cityID = updatedRateHotel.cityID;
            existingRateHotel.hotelID = updatedRateHotel.hotelID;
            existingRateHotel.Locations = updatedRateHotel.Locations;
            existingRateHotel.Distance = updatedRateHotel.Distance;
            existingRateHotel.sharing = updatedRateHotel.sharing;
            existingRateHotel.quint = updatedRateHotel.quint;
            existingRateHotel.quad = updatedRateHotel.quad;
            existingRateHotel.triple = updatedRateHotel.triple;
            existingRateHotel.doble = updatedRateHotel.doble;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRateHotel(int id)
        {
            var rateHotel = await _context.RateHotels.FindAsync(id);
            if (rateHotel == null)
            {
                return NotFound();
            }

            _context.RateHotels.Remove(rateHotel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RateHotelExists(int id)
        {
            return _context.RateHotels.Any(e => e.id == id);
        }

        private bool RateHotelExists(int cityID, int hotelID)
        {
            return _context.RateHotels.Any(e => e.cityID == cityID && e.hotelID == hotelID);
        }
    }
}