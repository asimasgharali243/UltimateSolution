using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendWeightReader.Data;
using BackendWeightReader.Models;

namespace BackendWeightReader.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScalesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly string[] _productSelectFields = new[] 
        { 
            "item_ID", "item_Type", "Item_Name", "Item_NameUrdu", "subCategory_Id" 
        };

        public ScalesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Scales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Scale>>> GettblScale()
        {
            // Use AsNoTracking for read-only operations
            return await _context.tblScale
                .AsNoTracking()
                .ToListAsync();
        }

        // GET: api/Scales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Scale>> GetScale(long id)
        {
            // Use AsNoTracking and explicit field selection
            var scale = await _context.tblScale
                .AsNoTracking()
                .Where(s => s.Id == id)
                .Select(s => new Scale 
                { 
                    Id = s.Id,
                    // Map to actual model properties
                    ItemID = s.ItemID,
                    ItemCode = s.ItemCode,
                    ItemName = s.ItemName,
                    ItemNameUrdu = s.ItemNameUrdu,
                    scaleWeight = s.scaleWeight,
                    Qty = s.Qty,
                    scaleImage = s.scaleImage,
                    scaleProcessDT = s.scaleProcessDT,
                    SyncDT = s.SyncDT,
                    SyncUserID = s.SyncUserID,
                    BatchID = s.BatchID,
                    BatchNo = s.BatchNo,
                    IsActive = s.IsActive,
                    InputToken = s.InputToken,
                    OutToken = s.OutToken,
                    total_token = s.total_token,
                    scaleType = s.scaleType
                })
                .FirstOrDefaultAsync();

            if (scale == null)
            {
                return NotFound();
            }

            return scale;
        }

        // PUT: api/Scales/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutScale(long id, Scale scale)
        {
            if (id != scale.Id)
            {
                return BadRequest();
            }

            // Attach and mark only specific fields as modified
            var existingScale = await _context.tblScale.FindAsync(id);
            if (existingScale == null)
            {
                return NotFound();
            }

            // Update only changed fields to minimize database operations
            _context.Entry(existingScale).CurrentValues.SetValues(scale);
            _context.Entry(existingScale).Property(x => x.Id).IsModified = false; // Prevent ID modification

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ScaleExistsAsync(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                // Simple query without compilation for now
                var products = await _context.tbl_Item
                    .Where(i => i.Item_Type == "Product") // Fixed property name - capital T
                    .Select(i => new
                    {
                        item_ID = i.Item_ID,
                        item_Type = i.Item_Type,
                        Item_Code = i.Item_Code,
                        Item_Name = i.Item_Name,
                        Item_NameUrdu = i.Item_NameUrdu,
                        subCategory_Id = i.subCategory_Id
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                // Log the exception (implement proper logging)
                return StatusCode(500, new { message = "Error fetching products", error = ex.Message });
            }
        }

        // POST: api/Scales
        [HttpPost]
        public async Task<ActionResult<Scale>> PostScale([FromBody] Scale scale)
        {
            if (scale == null)
                return BadRequest("Scale cannot be null.");

            // Validate required fields - use actual model property name
            if (scale.scaleWeight == 0 || scale.scaleWeight == null)
                return BadRequest("Weight is required.");

            scale.SyncDT = DateTime.UtcNow; // Use UTC for consistency
            _context.tblScale.Add(scale);
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = "Error saving scale data", error = ex.Message });
            }

            // Return without fetching from database again
            return CreatedAtAction(nameof(GetScale), new { id = scale.Id }, new { id = scale.Id });
        }

        // DELETE: api/Scales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScale(long id)
        {
            // Use efficient deletion without fetching the entity first
            var scale = new Scale { Id = id };
            _context.tblScale.Attach(scale);
            _context.tblScale.Remove(scale);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return NotFound();
            }
        }

        // Optimized existence check
        private Task<bool> ScaleExistsAsync(long id)
        {
            return _context.tblScale
                .AsNoTracking()
                .AnyAsync(e => e.Id == id);
        }
    }
}