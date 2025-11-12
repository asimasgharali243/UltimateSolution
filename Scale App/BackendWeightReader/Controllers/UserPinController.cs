using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendWeightReader.Data;
using BackendWeightReader.Models;
using Microsoft.Extensions.Logging;

namespace BackendWeightReader.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserPinController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UserPinController> _logger;

        public UserPinController(AppDbContext context, ILogger<UserPinController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ✅ GET: api/UserPin
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<UserPin>>> GetAllPins()
        //{
        //    _logger.LogInformation("Fetching all user PINs...");
        //    return await _context.tbl_UserPin.AsNoTracking().ToListAsync();
        //}

        // ✅ GET: api/UserPin/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserPin>> GetPin(int id)
        {
            _logger.LogInformation("Fetching PIN for user ID={Id}", id);

            var pin = await _context.tbl_UserPin.FindAsync(id);
            if (pin == null)
            {
                _logger.LogWarning("No PIN found for user ID={Id}", id);
                return NotFound("PIN not found.");
            }

            return pin;
        }

        // ✅ POST: api/UserPin
        [HttpPost]
        public async Task<ActionResult<UserPin>> CreatePin([FromBody] UserPin newPin)
        {
            if (newPin == null || newPin.PIN_ID <= 0 || string.IsNullOrWhiteSpace(newPin.PIN))
                return BadRequest("Invalid PIN data.");

            // Check if PIN already exists for this user
            var existing = await _context.tbl_UserPin.FirstOrDefaultAsync(p => p.PIN_ID == newPin.PIN_ID);
            if (existing != null)
            {
                _logger.LogWarning("PIN already exists for user ID={Id}", newPin.PIN_ID);
                return Conflict("PIN already exists for this user.");
            }

            _context.tbl_UserPin.Add(newPin);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created PIN for user ID={Id}", newPin.PIN_ID);
            return CreatedAtAction(nameof(GetPin), new { id = newPin.PIN_ID }, newPin);
        }

        // ✅ PUT: api/UserPin/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePin(int id, [FromBody] UserPin updatedPin)
        {
            if (id != updatedPin.PIN_ID)
                return BadRequest("PIN ID mismatch.");

            var pin = await _context.tbl_UserPin.FindAsync(id);
            if (pin == null)
            {
                _logger.LogWarning("No PIN found for update (user ID={Id})", id);
                return NotFound("PIN not found.");
            }

            pin.PIN = updatedPin.PIN;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated PIN for user ID={Id}", id);
            return Ok("PIN updated successfully.");
        }

        // ✅ DELETE: api/UserPin/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePin(int id)
        {
            _logger.LogInformation("Deleting PIN for user ID={Id}", id);

            var pin = await _context.tbl_UserPin.FindAsync(id);
            if (pin == null)
            {
                _logger.LogWarning("PIN not found for user ID={Id}", id);
                return NotFound("PIN not found.");
            }

            _context.tbl_UserPin.Remove(pin);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted PIN for user ID={Id}", id);
            return Ok("PIN deleted successfully.");
        }

        // Helper
        private bool PinExists(int id) => _context.tbl_UserPin.Any(p => p.PIN_ID == id);
    }
}
