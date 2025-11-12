// Backend/Controllers/SectorController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SectorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("check-name/{sectorName}")]
        public async Task<ActionResult<object>> CheckSectorNameExists(string sectorName)
        {
            if (string.IsNullOrEmpty(sectorName))
            {
                return BadRequest(new { exists = false, message = "Sector name is required" });
            }

            try
            {
                var exists = await _context.Sectors
                    .AnyAsync(s => s.sectorName.ToLower() == sectorName.ToLower());
                
                return Ok(new { 
                    exists,
                    message = exists ? "Sector name already exists" : "Sector name is available"
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { 
                    exists = false, 
                    message = $"Error checking sector name: {ex.Message}" 
                });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sector>>> GetSectors()
        {
            return await _context.Sectors.OrderByDescending(s => s.CreatedDT).ToListAsync();
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Sector>>> GetActiveSectors()
        {
            return await _context.Sectors.Where(s => s.Active).OrderByDescending(s => s.CreatedDT).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sector>> GetSector(int id)
        {
            var sector = await _context.Sectors.FindAsync(id);
            if (sector == null) return NotFound();
            return sector;
        }

        [HttpPost]
        public async Task<ActionResult<Sector>> PostSector(Sector sector)
        {
            // Check for duplicate name
            var nameExists = await _context.Sectors
                .AnyAsync(s => s.sectorName.ToLower() == sector.sectorName.ToLower());
            if (nameExists)
            {
                return BadRequest(new { message = $"Sector with name '{sector.sectorName}' already exists" });
            }

            sector.CreatedDT = System.DateTime.Now;
            // Ensure Active is properly set (handle null/undefined from frontend)
            sector.Active = sector.Active; // This will use the value from frontend

            _context.Sectors.Add(sector);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSector", new { id = sector.sectorID }, sector);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSector(int id, Sector sector)
        {
            if (id != sector.sectorID)
            {
                return BadRequest(new { message = "Sector ID mismatch" });
            }

            // Check for duplicate name (excluding current sector)
            var nameExists = await _context.Sectors
                .AnyAsync(s => s.sectorID != id && s.sectorName.ToLower() == sector.sectorName.ToLower());
            if (nameExists)
            {
                return BadRequest(new { message = $"Sector with name '{sector.sectorName}' already exists" });
            }

            var existingSector = await _context.Sectors.FindAsync(id);
            if (existingSector == null)
            {
                return NotFound(new { message = $"Sector with ID {id} not found" });
            }

            // Preserve original creation data
            sector.CreatedBy = existingSector.CreatedBy;
            sector.CreatedDT = existingSector.CreatedDT;
            
            // Set modification details
            sector.ModifyDT = System.DateTime.Now;
            // ModifyBy should come from the frontend (authenticated user)

            _context.Entry(existingSector).CurrentValues.SetValues(sector);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SectorExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchSector(int id, [FromBody] SectorUpdateDto updateDto)
        {
            var sector = await _context.Sectors.FindAsync(id);
            if (sector == null) return NotFound();

            // Update provided fields
            if (!string.IsNullOrEmpty(updateDto.sectorName))
            {
                // Check for duplicate name when updating sectorName
                var nameExists = await _context.Sectors
                    .AnyAsync(s => s.sectorID != id && s.sectorName.ToLower() == updateDto.sectorName.ToLower());
                if (nameExists)
                {
                    return BadRequest(new { message = $"Sector with name '{updateDto.sectorName}' already exists" });
                }
                sector.sectorName = updateDto.sectorName;
            }
            
            // FIXED: Properly handle Active field - ensure it's always set
            if (updateDto.Active.HasValue)
            {
                sector.Active = updateDto.Active.Value;
            }
            else if (updateDto.Active != null) // Handle direct boolean values
            {
                sector.Active = (bool)updateDto.Active;
            }

            sector.ModifyDT = System.DateTime.Now;
            
            // FIXED: Properly handle ModifyBy from DTO
            if (updateDto.ModifyBy.HasValue)
            {
                sector.ModifyBy = updateDto.ModifyBy.Value;
            }

            try
            {
                await _context.SaveChangesAsync();
                
                // Return the updated sector to ensure frontend has correct data
                var updatedSector = await _context.Sectors.FindAsync(id);
                return Ok(updatedSector);
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = $"Error updating sector: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSector(int id)
        {
            var sector = await _context.Sectors.FindAsync(id);
            if (sector == null) return NotFound();
            
            _context.Sectors.Remove(sector);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        private bool SectorExists(int id)
        {
            return _context.Sectors.Any(e => e.sectorID == id);
        }
    }

    public class SectorUpdateDto
    {
        public string? sectorName { get; set; }
        public bool? Active { get; set; }
        public int? ModifyBy { get; set; }
    }
}