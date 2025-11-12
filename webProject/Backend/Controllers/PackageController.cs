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
    public class PackageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PackageController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Package>>> GetPackages()
        {
            return await _context.Packages.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Package>> GetPackage(int id)
        {
            var package = await _context.Packages.FindAsync(id);

            if (package == null)
            {
                return NotFound();
            }

            return package;
        }

        [HttpGet("check-name")]
        public async Task<ActionResult<bool>> CheckPackageNameExists([FromQuery] string packgeTitle, [FromQuery] int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(packgeTitle))
            {
                return BadRequest("Package title is required");
            }

            var query = _context.Packages.Where(p => p.PackgeTitle.ToLower() == packgeTitle.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.packgeID != excludeId.Value);
            }

            var exists = await query.AnyAsync();
            return Ok(exists);
        }

        private int GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
                // Fallback for development
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
            
            // Fallback for development
            return 1;
        }

        [HttpPost]
        public async Task<ActionResult<Package>> PostPackage(Package package)
        {
            // Check if package title already exists
            var existingPackage = await _context.Packages
                .FirstOrDefaultAsync(p => p.PackgeTitle.ToLower() == package.PackgeTitle.ToLower());

            if (existingPackage != null)
            {
                return Conflict(new { message = "Package title already exists" });
            }

            // Set current user and timestamp
            var currentUserId = GetCurrentUserId();
            package.CreatedBy = currentUserId;
            package.CreatedDT = DateTime.Now;
            package.ModifyBy = null;
            package.ModifyDT = null;

            _context.Packages.Add(package);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPackage", new { id = package.packgeID }, package);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPackage(int id, Package updatedPackage)
        {
            // if (id != updatedPackage.packgeID)
            // {
            //     return BadRequest("ID mismatch");
            // }

            // Check if the record exists
            var existingPackage = await _context.Packages.FindAsync(id);
            if (existingPackage == null)
            {
                return NotFound();
            }

            // Check if package title already exists (excluding current record)
            if (!string.IsNullOrEmpty(updatedPackage.PackgeTitle))
            {
                var duplicatePackage = await _context.Packages
                    .FirstOrDefaultAsync(p => p.PackgeTitle.ToLower() == updatedPackage.PackgeTitle.ToLower() && p.packgeID != id);

                if (duplicatePackage != null)
                {
                    return Conflict(new { message = "Package title already exists" });
                }
            }

            // Update only the fields that should be updated
            existingPackage.PackgeTitle = updatedPackage.PackgeTitle;
            
            // Set modification info
            var currentUserId = GetCurrentUserId();
            existingPackage.ModifyBy = currentUserId;
            existingPackage.ModifyDT = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PackageExists(id))
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
        public async Task<IActionResult> DeletePackage(int id)
        {
            var package = await _context.Packages.FindAsync(id);
            if (package == null)
            {
                return NotFound();
            }

            _context.Packages.Remove(package);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PackageExists(int id)
        {
            return _context.Packages.Any(e => e.packgeID == id);
        }
    }
}