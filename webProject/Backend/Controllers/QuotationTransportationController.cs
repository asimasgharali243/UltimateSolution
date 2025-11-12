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
    public class QuotationTransportationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public QuotationTransportationController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/QuotationTransportation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuotationTransportation>>> GetQuotationTransportations()
        {
            return await _context.QuotationTransportations
                .Include(qt => qt.Sector) // Include Sector data
                .ToListAsync();
        }

        // GET: api/QuotationTransportation/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuotationTransportation>> GetQuotationTransportation(int id)
        {
            var quotationTransportation = await _context.QuotationTransportations
                .Include(qt => qt.Sector) // Include Sector data
                .FirstOrDefaultAsync(qt => qt.id == id);

            if (quotationTransportation == null)
            {
                return NotFound();
            }

            return quotationTransportation;
        }

        // GET: api/QuotationTransportation/quotation/5
        [HttpGet("quotation/{quotationId}")]
        public async Task<ActionResult<IEnumerable<QuotationTransportation>>> GetTransportationsByQuotationId(int quotationId)
        {
            var transportations = await _context.QuotationTransportations
                .Include(qt => qt.Sector) // Include Sector data
                .Where(qt => qt.quotation_id == quotationId)
                .ToListAsync();

            return transportations;
        }

        // GET: api/QuotationTransportation/sector/5
        [HttpGet("sector/{sectorId}")]
        public async Task<ActionResult<IEnumerable<QuotationTransportation>>> GetTransportationsBySectorId(int sectorId)
        {
            var transportations = await _context.QuotationTransportations
                .Include(qt => qt.Sector)
                .Where(qt => qt.sectorID == sectorId)
                .ToListAsync();

            return transportations;
        }

        // POST: api/QuotationTransportation
        [HttpPost]
        public async Task<ActionResult<QuotationTransportation>> PostQuotationTransportation(QuotationTransportation quotationTransportation)
        {
            // Validate if Sector exists
            var sectorExists = await _context.Sectors.AnyAsync(s => s.sectorID == quotationTransportation.sectorID);
            if (!sectorExists)
            {
                return BadRequest("Invalid Sector ID");
            }

            // Set created_at timestamp
            quotationTransportation.created_at = DateTime.Now;

            _context.QuotationTransportations.Add(quotationTransportation);
            await _context.SaveChangesAsync();

            // Load the Sector data for the response
            await _context.Entry(quotationTransportation)
                .Reference(qt => qt.Sector)
                .LoadAsync();

            return CreatedAtAction("GetQuotationTransportation", new { id = quotationTransportation.id }, quotationTransportation);
        }

        // POST: api/QuotationTransportation/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> PostBulkQuotationTransportation(List<QuotationTransportation> quotationTransportations)
        {
            var currentTime = DateTime.Now;
            
            // Validate all sectors exist
            var sectorIds = quotationTransportations.Select(qt => qt.sectorID).Distinct();
            var existingSectors = await _context.Sectors
                .Where(s => sectorIds.Contains(s.sectorID))
                .Select(s => s.sectorID)
                .ToListAsync();

            var invalidSectors = sectorIds.Except(existingSectors).ToList();
            if (invalidSectors.Any())
            {
                return BadRequest($"Invalid Sector IDs: {string.Join(", ", invalidSectors)}");
            }

            foreach (var transportation in quotationTransportations)
            {
                transportation.created_at = currentTime;
                _context.QuotationTransportations.Add(transportation);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"{quotationTransportations.Count} transportation records added successfully" });
        }

        // PUT: api/QuotationTransportation/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuotationTransportation(int id, QuotationTransportation quotationTransportation)
        {
            if (id != quotationTransportation.id)
            {
                return BadRequest("ID mismatch");
            }

            var existingTransportation = await _context.QuotationTransportations.FindAsync(id);
            if (existingTransportation == null)
            {
                return NotFound();
            }

            // Validate if Sector exists (if sectorID is being updated)
            if (existingTransportation.sectorID != quotationTransportation.sectorID)
            {
                var sectorExists = await _context.Sectors.AnyAsync(s => s.sectorID == quotationTransportation.sectorID);
                if (!sectorExists)
                {
                    return BadRequest("Invalid Sector ID");
                }
            }

            // Update fields
            existingTransportation.quotation_id = quotationTransportation.quotation_id;
            existingTransportation.vehicle_name = quotationTransportation.vehicle_name;
            existingTransportation.capacity = quotationTransportation.capacity;
            existingTransportation.sectorID = quotationTransportation.sectorID;
            existingTransportation.rate = quotationTransportation.rate;
            existingTransportation.quantity = quotationTransportation.quantity;
            // Note: created_at is not updated as it should remain the original creation time

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuotationTransportationExists(id))
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

        // DELETE: api/QuotationTransportation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuotationTransportation(int id)
        {
            var quotationTransportation = await _context.QuotationTransportations.FindAsync(id);
            if (quotationTransportation == null)
            {
                return NotFound();
            }

            _context.QuotationTransportations.Remove(quotationTransportation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/QuotationTransportation/quotation/5
        [HttpDelete("quotation/{quotationId}")]
        public async Task<IActionResult> DeleteTransportationsByQuotationId(int quotationId)
        {
            var transportations = await _context.QuotationTransportations
                .Where(qt => qt.quotation_id == quotationId)
                .ToListAsync();

            if (transportations.Count == 0)
            {
                return NotFound($"No transportation records found for quotation ID {quotationId}");
            }

            _context.QuotationTransportations.RemoveRange(transportations);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{transportations.Count} transportation records deleted successfully" });
        }

        // GET: api/QuotationTransportation/summary/sector
        [HttpGet("summary/sector")]
        public async Task<ActionResult<IEnumerable<object>>> GetTransportationSummaryBySector()
        {
            var summary = await _context.QuotationTransportations
                .Include(qt => qt.Sector)
                .GroupBy(qt => new { qt.sectorID, qt.Sector.sectorName })
                .Select(g => new
                {
                    SectorID = g.Key.sectorID,
                    SectorName = g.Key.sectorName,
                    TotalRecords = g.Count(),
                    TotalQuantity = g.Sum(qt => qt.quantity),
                    TotalAmount = g.Sum(qt => qt.rate * qt.quantity)
                })
                .ToListAsync();

            return Ok(summary);
        }

        private bool QuotationTransportationExists(int id)
        {
            return _context.QuotationTransportations.Any(e => e.id == id);
        }
    }
}