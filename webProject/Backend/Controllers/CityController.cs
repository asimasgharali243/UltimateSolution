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
    public class CityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CityController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/City
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCities()
        {
            try
            {
                var cities = await _context.Cities
                    .Include(c => c.CreatedByUser) // Include CreatedBy user details
                    .Include(c => c.ModifiedByUser) // Include ModifyBy user details
                    .OrderBy(c => c.cityName)
                    .Select(c => new
                    {
                        c.cityID,
                        c.cityName,
                        c.CreatedBy,
                        c.CreatedDT,
                        c.ModifyBy,
                        c.ModifyDT,
                        CreatedByUser = c.CreatedByUser != null ? new 
                        { 
                            c.CreatedByUser.UserID,
                            c.CreatedByUser.UserFullName,
                            c.CreatedByUser.UserName
                        } : null,
                        ModifiedByUser = c.ModifiedByUser != null ? new 
                        { 
                            c.ModifiedByUser.UserID,
                            c.ModifiedByUser.UserFullName,
                            c.ModifiedByUser.UserName
                        } : null
                    })
                    .ToListAsync();
                return Ok(cities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // GET: api/City/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCity(int id)
        {
            try
            {
                var city = await _context.Cities
                    .Include(c => c.CreatedByUser)
                    .Include(c => c.ModifiedByUser)
                    .Where(c => c.cityID == id)
                    .Select(c => new
                    {
                        c.cityID,
                        c.cityName,
                        c.CreatedBy,
                        c.CreatedDT,
                        c.ModifyBy,
                        c.ModifyDT,
                        CreatedByUser = c.CreatedByUser != null ? new 
                        { 
                            c.CreatedByUser.UserID,
                            c.CreatedByUser.UserFullName,
                            c.CreatedByUser.UserName
                        } : null,
                        ModifiedByUser = c.ModifiedByUser != null ? new 
                        { 
                            c.ModifiedByUser.UserID,
                            c.ModifiedByUser.UserFullName,
                            c.ModifiedByUser.UserName
                        } : null
                    })
                    .FirstOrDefaultAsync();

                if (city == null)
                {
                    return NotFound(new { message = $"City with ID {id} not found" });
                }

                return Ok(city);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // GET: api/City/check-name/{cityName}
        [HttpGet("check-name/{cityName}")]
        public async Task<ActionResult<object>> CheckCityNameExists(string cityName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cityName))
                {
                    return Ok(new { exists = false, message = "City name is empty" });
                }

                var normalizedCityName = cityName.Trim().ToLower();
                var exists = await _context.Cities
                    .AnyAsync(c => c.cityName.ToLower() == normalizedCityName);

                return Ok(new { 
                    exists = exists,
                    message = exists ? "City name already exists" : "City name is available"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    exists = false, 
                    message = "Error checking city name availability",
                    error = ex.Message 
                });
            }
        }

        // GET: api/City/5/hotels
        [HttpGet("{id}/hotels")]
        public async Task<ActionResult<IEnumerable<Hotel>>> GetCityHotels(int id)
        {
            try
            {
                var hasHotels = await _context.Hotels.AnyAsync(h => h.cityID == id);
                
                if (!hasHotels)
                {
                    return Ok(new List<Hotel>());
                }

                var hotels = await _context.Hotels
                    .Where(h => h.cityID == id)
                    .ToListAsync();

                return Ok(hotels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // POST: api/City
        [HttpPost]
        public async Task<ActionResult<City>> PostCity(City city)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(city.cityName))
                {
                    return BadRequest(new { message = "City name is required" });
                }

                // Check if city already exists
                var normalizedCityName = city.cityName.Trim().ToLower();
                var existingCity = await _context.Cities
                    .FirstOrDefaultAsync(c => c.cityName.ToLower() == normalizedCityName);

                if (existingCity != null)
                {
                    return Conflict(new { message = $"City '{city.cityName}' already exists" });
                }

                city.cityName = city.cityName.Trim();
                city.CreatedDT = DateTime.Now;
                
                _context.Cities.Add(city);
                await _context.SaveChangesAsync();

                // Reload the city with user details
                var createdCity = await _context.Cities
                    .Include(c => c.CreatedByUser)
                    .Include(c => c.ModifiedByUser)
                    .Where(c => c.cityID == city.cityID)
                    .Select(c => new
                    {
                        c.cityID,
                        c.cityName,
                        c.CreatedBy,
                        c.CreatedDT,
                        c.ModifyBy,
                        c.ModifyDT,
                        CreatedByUser = c.CreatedByUser != null ? new 
                        { 
                            c.CreatedByUser.UserID,
                            c.CreatedByUser.UserFullName,
                            c.CreatedByUser.UserName
                        } : null,
                        ModifiedByUser = c.ModifiedByUser != null ? new 
                        { 
                            c.ModifiedByUser.UserID,
                            c.ModifiedByUser.UserFullName,
                            c.ModifiedByUser.UserName
                        } : null
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetCity), new { id = city.cityID }, createdCity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // PUT: api/City/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCity(int id, City city)
        {
            try
            {
                if (id != city.cityID)
                {
                    return BadRequest(new { message = "City ID mismatch" });
                }

                if (string.IsNullOrWhiteSpace(city.cityName))
                {
                    return BadRequest(new { message = "City name is required" });
                }

                var existingCity = await _context.Cities.FindAsync(id);
                if (existingCity == null)
                {
                    return NotFound(new { message = $"City with ID {id} not found" });
                }

                // Check for duplicate city name (excluding current city)
                var normalizedCityName = city.cityName.Trim().ToLower();
                var duplicateCity = await _context.Cities
                    .FirstOrDefaultAsync(c => c.cityName.ToLower() == normalizedCityName && c.cityID != id);

                if (duplicateCity != null)
                {
                    return Conflict(new { message = $"City '{city.cityName}' already exists" });
                }

                // Update properties
                existingCity.cityName = city.cityName.Trim();
                existingCity.ModifyBy = city.ModifyBy;
                existingCity.ModifyDT = DateTime.Now;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CityExists(id))
                {
                    return NotFound(new { message = $"City with ID {id} not found" });
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // DELETE: api/City/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCity(int id)
        {
            try
            {
                var city = await _context.Cities.FindAsync(id);
                if (city == null)
                {
                    return NotFound(new { message = $"City with ID {id} not found" });
                }

                // Check if city has related hotels
                var hasHotels = await _context.Hotels.AnyAsync(h => h.cityID == id);
                if (hasHotels)
                {
                    return BadRequest(new { message = "Cannot delete city because it has associated hotels" });
                }

                _context.Cities.Remove(city);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        private bool CityExists(int id)
        {
            return _context.Cities.Any(e => e.cityID == id);
        }
    }
}