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
    public class QuotationVisaServiceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuotationVisaServiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/QuotationVisaService
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuotationVisaService>>> GetQuotationVisaServices()
        {
            return await _context.QuotationVisaServices
                .Include(qv => qv.Quotation)
                .ToListAsync();
        }

        // GET: api/QuotationVisaService/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuotationVisaService>> GetQuotationVisaService(int id)
        {
            var quotationVisaService = await _context.QuotationVisaServices
                .Include(qv => qv.Quotation)
                .FirstOrDefaultAsync(qv => qv.id == id);

            if (quotationVisaService == null)
            {
                return NotFound();
            }

            return quotationVisaService;
        }

        // GET: api/QuotationVisaService/quotation/5
        [HttpGet("quotation/{quotationId}")]
        public async Task<ActionResult<IEnumerable<QuotationVisaService>>> GetVisaServicesByQuotationId(int quotationId)
        {
            var visaServices = await _context.QuotationVisaServices
                .Where(qv => qv.quotation_id == quotationId)
                .ToListAsync();

            return visaServices;
        }

        // POST: api/QuotationVisaService
        [HttpPost]
        public async Task<ActionResult<QuotationVisaService>> PostQuotationVisaService(QuotationVisaService quotationVisaService)
        {
            _context.QuotationVisaServices.Add(quotationVisaService);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetQuotationVisaService", new { id = quotationVisaService.id }, quotationVisaService);
        }

        // POST: api/QuotationVisaService/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> PostBulkQuotationVisaService(List<QuotationVisaService> quotationVisaServices)
        {
            _context.QuotationVisaServices.AddRange(quotationVisaServices);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{quotationVisaServices.Count} visa service records added successfully" });
        }

        // PUT: api/QuotationVisaService/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuotationVisaService(int id, QuotationVisaService quotationVisaService)
        {
            if (id != quotationVisaService.id)
            {
                return BadRequest("ID mismatch");
            }

            _context.Entry(quotationVisaService).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuotationVisaServiceExists(id))
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

        // DELETE: api/QuotationVisaService/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuotationVisaService(int id)
        {
            var quotationVisaService = await _context.QuotationVisaServices.FindAsync(id);
            if (quotationVisaService == null)
            {
                return NotFound();
            }

            _context.QuotationVisaServices.Remove(quotationVisaService);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/QuotationVisaService/quotation/5
        [HttpDelete("quotation/{quotationId}")]
        public async Task<IActionResult> DeleteVisaServicesByQuotationId(int quotationId)
        {
            var visaServices = await _context.QuotationVisaServices
                .Where(qv => qv.quotation_id == quotationId)
                .ToListAsync();

            if (visaServices.Count == 0)
            {
                return NotFound($"No visa service records found for quotation ID {quotationId}");
            }

            _context.QuotationVisaServices.RemoveRange(visaServices);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{visaServices.Count} visa service records deleted successfully" });
        }

        private bool QuotationVisaServiceExists(int id)
        {
            return _context.QuotationVisaServices.Any(e => e.id == id);
        }
    }
}