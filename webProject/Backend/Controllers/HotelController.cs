// Backend/Controllers/HotelController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HotelController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HotelDto>>> GetHotels()
        {
            try
            {
                var hotels = await _context.Hotels
                    .Include(h => h.City)
                    .Include(h => h.CreatedByUser)
                    .Include(h => h.ModifiedByUser)
                    .OrderBy(h => h.hotelName)
                    .Select(h => new HotelDto
                    {
                        hotelID = h.hotelID,
                        hotelName = h.hotelName,
                        hotalType = h.hotalType,
                        cityID = h.cityID,
                        CityName = h.City != null ? h.City.cityName : "Unknown",
                        CreatedBy = h.CreatedBy,
                        CreatedByName = h.CreatedByUser != null ? h.CreatedByUser.UserFullName : "Unknown",
                        CreatedDT = h.CreatedDT,
                        ModifyBy = h.ModifyBy,
                        ModifiedByName = h.ModifiedByUser != null ? h.ModifiedByUser.UserFullName : "Not Modified",
                        ModifyDT = h.ModifyDT
                    })
                    .ToListAsync();
                return Ok(hotels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HotelDto>> GetHotel(int id)
        {
            try
            {
                var hotel = await _context.Hotels
                    .Include(h => h.City)
                    .Include(h => h.CreatedByUser)
                    .Include(h => h.ModifiedByUser)
                    .Where(h => h.hotelID == id)
                    .Select(h => new HotelDto
                    {
                        hotelID = h.hotelID,
                        hotelName = h.hotelName,
                        hotalType = h.hotalType,
                        cityID = h.cityID,
                        CityName = h.City != null ? h.City.cityName : "Unknown",
                        CreatedBy = h.CreatedBy,
                        CreatedByName = h.CreatedByUser != null ? h.CreatedByUser.UserFullName : "Unknown",
                        CreatedDT = h.CreatedDT,
                        ModifyBy = h.ModifyBy,
                        ModifiedByName = h.ModifiedByUser != null ? h.ModifiedByUser.UserFullName : "Not Modified",
                        ModifyDT = h.ModifyDT
                    })
                    .FirstOrDefaultAsync();

                if (hotel == null)
                {
                    return NotFound(new { message = $"Hotel with ID {id} not found" });
                }

                return Ok(hotel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("city/{cityId}")]
        public async Task<ActionResult<IEnumerable<HotelDto>>> GetHotelsByCity(int cityId)
        {
            try
            {
                // Check if city exists
                var cityExists = await _context.Cities.AnyAsync(c => c.cityID == cityId);
                if (!cityExists)
                {
                    return NotFound(new { message = $"City with ID {cityId} not found" });
                }

                var hotels = await _context.Hotels
                    .Where(h => h.cityID == cityId)
                    .Include(h => h.City)
                    .Include(h => h.CreatedByUser)
                    .Include(h => h.ModifiedByUser)
                    .OrderBy(h => h.hotelName)
                    .Select(h => new HotelDto
                    {
                        hotelID = h.hotelID,
                        hotelName = h.hotelName,
                        hotalType = h.hotalType,
                        cityID = h.cityID,
                        CityName = h.City != null ? h.City.cityName : "Unknown",
                        CreatedBy = h.CreatedBy,
                        CreatedByName = h.CreatedByUser != null ? h.CreatedByUser.UserFullName : "Unknown",
                        CreatedDT = h.CreatedDT,
                        ModifyBy = h.ModifyBy,
                        ModifiedByName = h.ModifiedByUser != null ? h.ModifiedByUser.UserFullName : "Not Modified",
                        ModifyDT = h.ModifyDT
                    })
                    .ToListAsync();

                return Ok(hotels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<HotelDto>> PostHotel(Hotel hotel)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(hotel.hotelName))
                {
                    return BadRequest(new { message = "Hotel name is required" });
                }

                if (string.IsNullOrWhiteSpace(hotel.hotalType))
                {
                    return BadRequest(new { message = "Hotel type is required" });
                }

                // Check if city exists
                var cityExists = await _context.Cities.AnyAsync(c => c.cityID == hotel.cityID);
                if (!cityExists)
                {
                    return BadRequest(new { message = $"City with ID {hotel.cityID} does not exist" });
                }

                hotel.CreatedDT = DateTime.Now;
                _context.Hotels.Add(hotel);
                await _context.SaveChangesAsync();

                // Reload with related data
                var createdHotel = await _context.Hotels
                    .Include(h => h.City)
                    .Include(h => h.CreatedByUser)
                    .Include(h => h.ModifiedByUser)
                    .Where(h => h.hotelID == hotel.hotelID)
                    .Select(h => new HotelDto
                    {
                        hotelID = h.hotelID,
                        hotelName = h.hotelName,
                        hotalType = h.hotalType,
                        cityID = h.cityID,
                        CityName = h.City != null ? h.City.cityName : "Unknown",
                        CreatedBy = h.CreatedBy,
                        CreatedByName = h.CreatedByUser != null ? h.CreatedByUser.UserFullName : "Unknown",
                        CreatedDT = h.CreatedDT,
                        ModifyBy = h.ModifyBy,
                        ModifiedByName = h.ModifiedByUser != null ? h.ModifiedByUser.UserFullName : "Not Modified",
                        ModifyDT = h.ModifyDT
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetHotel), new { id = hotel.hotelID }, createdHotel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutHotel(int id, Hotel hotel)
        {
            try
            {
                if (id != hotel.hotelID)
                {
                    return BadRequest(new { message = "Hotel ID mismatch" });
                }

                if (string.IsNullOrWhiteSpace(hotel.hotelName))
                {
                    return BadRequest(new { message = "Hotel name is required" });
                }

                if (string.IsNullOrWhiteSpace(hotel.hotalType))
                {
                    return BadRequest(new { message = "Hotel type is required" });
                }

                // Check if city exists
                var cityExists = await _context.Cities.AnyAsync(c => c.cityID == hotel.cityID);
                if (!cityExists)
                {
                    return BadRequest(new { message = $"City with ID {hotel.cityID} does not exist" });
                }

                var existingHotel = await _context.Hotels.FindAsync(id);
                if (existingHotel == null)
                {
                    return NotFound(new { message = $"Hotel with ID {id} not found" });
                }

                // Update properties
                existingHotel.hotelName = hotel.hotelName;
                existingHotel.hotalType = hotel.hotalType;
                existingHotel.cityID = hotel.cityID;
                existingHotel.ModifyBy = hotel.ModifyBy;
                existingHotel.ModifyDT = DateTime.Now;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HotelExists(id))
                {
                    return NotFound(new { message = $"Hotel with ID {id} not found" });
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            try
            {
                var hotel = await _context.Hotels.FindAsync(id);
                if (hotel == null)
                {
                    return NotFound(new { message = $"Hotel with ID {id} not found" });
                }

                _context.Hotels.Remove(hotel);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        private bool HotelExists(int id)
        {
            return _context.Hotels.Any(e => e.hotelID == id);
        }
    }
}