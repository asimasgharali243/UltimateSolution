using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuotationAirlinesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuotationAirlinesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/QuotationAirlines
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuotationAirlines>>> GetQuotationAirlines()
        {
            return await _context.QuotationAirlines
                .Include(qa => qa.Quotation)
                .ToListAsync();
        }

        // GET: api/QuotationAirlines/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuotationAirlines>> GetQuotationAirline(int id)
        {
            var quotationAirline = await _context.QuotationAirlines
                .Include(qa => qa.Quotation)
                .FirstOrDefaultAsync(qa => qa.id == id);

            if (quotationAirline == null)
            {
                return NotFound();
            }

            return quotationAirline;
        }

        // GET: api/QuotationAirlines/quotation/5
        [HttpGet("quotation/{quotationId}")]
        public async Task<ActionResult<IEnumerable<QuotationAirlines>>> GetAirlinesByQuotationId(int quotationId)
        {
            var airlines = await _context.QuotationAirlines
                .Where(qa => qa.quotation_id == quotationId)
                .ToListAsync();

            return airlines;
        }

        // POST: api/QuotationAirlines
        [HttpPost]
        public async Task<ActionResult<QuotationAirlines>> PostQuotationAirline(QuotationAirlines quotationAirline)
        {
            _context.QuotationAirlines.Add(quotationAirline);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetQuotationAirline", new { id = quotationAirline.id }, quotationAirline);
        }

        // POST: api/QuotationAirlines/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> PostBulkQuotationAirlines(List<QuotationAirlines> quotationAirlines)
        {
            _context.QuotationAirlines.AddRange(quotationAirlines);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{quotationAirlines.Count} airline records added successfully" });
        }

        // PUT: api/QuotationAirlines/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuotationAirline(int id, QuotationAirlines quotationAirline)
        {
            if (id != quotationAirline.id)
            {
                return BadRequest("ID mismatch");
            }

            _context.Entry(quotationAirline).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuotationAirlineExists(id))
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

        // DELETE: api/QuotationAirlines/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuotationAirline(int id)
        {
            var quotationAirline = await _context.QuotationAirlines.FindAsync(id);
            if (quotationAirline == null)
            {
                return NotFound();
            }

            _context.QuotationAirlines.Remove(quotationAirline);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/QuotationAirlines/quotation/5
        [HttpDelete("quotation/{quotationId}")]
        public async Task<IActionResult> DeleteAirlinesByQuotationId(int quotationId)
        {
            var airlines = await _context.QuotationAirlines
                .Where(qa => qa.quotation_id == quotationId)
                .ToListAsync();

            if (airlines.Count == 0)
            {
                return NotFound($"No airline records found for quotation ID {quotationId}");
            }

            _context.QuotationAirlines.RemoveRange(airlines);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{airlines.Count} airline records deleted successfully" });
        }

        private bool QuotationAirlineExists(int id)
        {
            return _context.QuotationAirlines.Any(e => e.id == id);
        }
    }
}