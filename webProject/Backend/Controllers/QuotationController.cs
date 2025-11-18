using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuotationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRateService _rateService;

        public QuotationController(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, IRateService rateService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _rateService = rateService;
        }

        private int GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
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
            
            return 1;
        }

        // GET: api/Quotation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Quotation>>> GetQuotations()
        {
            try
            {
                var quotations = await _context.Quotations
                    .Include(q => q.Client) // Include Client first
                    .Include(q => q.Accommodations)
                        .ThenInclude(a => a.City)
                    .Include(q => q.Accommodations)
                        .ThenInclude(a => a.Hotel)
                    .Include(q => q.Transportations)
                        .ThenInclude(t => t.Sector)
                    .Include(q => q.VisaServices)
                    .Include(q => q.Airlines)
                    .OrderByDescending(q => q.created_at)
                    .ToListAsync();

                return Ok(quotations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve quotations: {ex.Message}");
            }
        }

        // GET: api/Quotation/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Quotation>> GetQuotation(int id)
        {
            try
            {
                var quotation = await _context.Quotations
                    .Include(q => q.Client) // Include Client first
                    .Include(q => q.Accommodations)
                        .ThenInclude(a => a.City)
                    .Include(q => q.Accommodations)
                        .ThenInclude(a => a.Hotel)
                    .Include(q => q.Transportations)
                        .ThenInclude(t => t.Sector)
                    .Include(q => q.VisaServices)
                    .Include(q => q.Airlines)
                    .FirstOrDefaultAsync(q => q.id == id);

                if (quotation == null)
                {
                    return NotFound();
                }

                return quotation;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve quotation: {ex.Message}");
            }
        }

        // GET: api/Quotation/5/client
        [HttpGet("{id}/client")]
        public async Task<ActionResult<Client>> GetQuotationClient(int id)
        {
            try
            {
                var quotation = await _context.Quotations
                    .Include(q => q.Client)
                    .FirstOrDefaultAsync(q => q.id == id);

                if (quotation == null)
                {
                    return NotFound($"Quotation with ID {id} not found");
                }

                if (quotation.Client == null)
                {
                    return NotFound($"Client not found for quotation ID {id}");
                }

                return Ok(quotation.Client);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve client details: {ex.Message}");
            }
        }

        // GET: api/Quotation/5/client-details
        [HttpGet("{id}/client-details")]
        public async Task<ActionResult<object>> GetQuotationClientDetails(int id)
        {
            try
            {
                var clientInfo = await _context.Quotations
                    .Where(q => q.id == id)
                    .Include(q => q.Client)
                    .Select(q => new
                    {
                        QuotationId = q.id,
                        QuotationNumber = q.quotation_number,
                        QuotationStatus = q.status,
                        Client = q.Client == null ? null : new
                        {
                            q.Client.Id,
                            Name = q.Client.FullName, // Changed from q.Client.Name to q.Client.FullName
                            Email = "", // Email doesn't exist in your model
                            Phone = q.Client.ContactNumber, // Changed from q.Client.Phone to q.Client.ContactNumber
                            CompanyName = "", // CompanyName doesn't exist in your model
                            Address = q.Client.CityOfResidence // Changed from q.Client.Address to q.Client.CityOfResidence
                            // Add other client fields you need
                        }
                    })
                    .FirstOrDefaultAsync();

                if (clientInfo == null)
                {
                    return NotFound($"Quotation with ID {id} not found");
                }

                return Ok(clientInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve client details: {ex.Message}");
            }
        }

        // GET: api/Quotation/client/5
        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<Quotation>>> GetQuotationsByClient(int clientId)
        {
            try
            {
                var quotations = await _context.Quotations
                    .Include(q => q.Client)
                    .Include(q => q.Accommodations)
                    .Include(q => q.Transportations)
                    .Include(q => q.VisaServices)
                    .Include(q => q.Airlines)
                    .Where(q => q.client_id == clientId)
                    .OrderByDescending(q => q.created_at)
                    .ToListAsync();

                if (!quotations.Any())
                {
                    return NotFound($"No quotations found for client ID {clientId}");
                }

                return Ok(quotations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to retrieve client quotations: {ex.Message}");
            }
        }

        // POST: api/Quotation
        [HttpPost]
        public async Task<ActionResult<Quotation>> PostQuotation(QuotationDto quotationDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                Console.WriteLine("PostQuotation called");

                // Validate required fields
                if (quotationDto.client_id <= 0)
                {
                    Console.WriteLine("PostQuotation client_id <= 0");
                    return BadRequest(new { message = "Client ID is required", field = "client_id" });
                }

                Console.WriteLine("PostQuotation called client verified");
                
                // Validate client exists
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == quotationDto.client_id);
                if (!clientExists)
                {
                    return BadRequest(new { message = $"Client with ID {quotationDto.client_id} does not exist", field = "client_id" });
                }

                Console.WriteLine("PostQuotation called client verified 2 and started transaction");
                
                // Store related entities temporarily
                var accommodations = quotationDto.Accommodations?.ToList() ?? new List<AccommodationDto>();
                var transportations = quotationDto.Transportations?.ToList() ?? new List<TransportationDto>();
                var visas = quotationDto.VisaServices?.ToList() ?? new List<VisaServiceDto>();
                var airlines = quotationDto.Airlines?.ToList() ?? new List<AirlineDto>();

                // Create main quotation entity from DTO
                var quotation = new Quotation
                {
                    client_id = quotationDto.client_id,
                    traveling_details = quotationDto.traveling_details ?? string.Empty,
                    packgeID = quotationDto.packgeID,
                    reference_by = quotationDto.reference_by,
                    makkah_nights = quotationDto.makkah_nights,
                    madinah_nights = quotationDto.madinah_nights,
                    makkah_nights1 = quotationDto.makkah_nights1,
                    jeddah_nights = quotationDto.jeddah_nights,
                    adult_count = quotationDto.adult_count,
                    child_count = quotationDto.child_count,
                    infant_count = quotationDto.infant_count,
                    advance_amount = quotationDto.advance_amount,
                    status = quotationDto.status ?? "Draft",
                    queryID = quotationDto.queryID ?? 0,
                    createdBy = quotationDto.createdBy
                };

                Console.WriteLine("PostQuotation called client verified 3");
                
                // Generate quotation number
                var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                quotation.quotation_number = $"QTN-{timestamp}";

                // Calculate derived fields - CONSISTENT WITH PUT METHOD
                quotation.total_stay_days = quotation.makkah_nights + quotation.madinah_nights + 
                                        (quotation.makkah_nights1 ?? 0) + (quotation.jeddah_nights ?? 0);
                quotation.total_pax = (quotation.adult_count ?? 0) + (quotation.child_count ?? 0) + (quotation.infant_count ?? 0);

                // Calculate totals from related entities - CONSISTENT WITH PUT METHOD
                decimal accommodationTotal = accommodations.Sum(a => (a.no_of_rooms * a.no_of_nights * a.rate_per_night));
                decimal transportationTotal = transportations.Sum(t => (t.rate * t.quantity));
                decimal visaTotal = visas.Sum(v => (v.Rate * v.Qty));
                decimal airlinesTotal = airlines.Sum(a => (a.rate * a.quantity));

                quotation.total_package_cost = accommodationTotal + transportationTotal + visaTotal + airlinesTotal;
                quotation.grand_total = quotation.total_package_cost - (quotation.advance_amount ?? 0);
                quotation.cost_per_person = quotation.total_pax > 0 ? quotation.grand_total / quotation.total_pax : 0;

                // Set audit fields for main quotation only
                var currentUserId = GetCurrentUserId();
                quotation.created_at = DateTime.Now;
                quotation.createdBy = currentUserId;
                quotation.updated_at = null;
                quotation.modifyBy = null;

                Console.WriteLine($"PostQuotation called client verified 4 - ID before save: {quotation.id}");

                // STEP 1: Save main quotation first to get the primary key
                _context.Quotations.Add(quotation);
                await _context.SaveChangesAsync(); // This generates the id

                Console.WriteLine($"PostQuotation called client verified 5 - ID after save: {quotation.id}");

                // STEP 2: Assign quotation_id to all related entities WITHOUT audit fields
                if (accommodations.Any())
                {
                    foreach (var accommodationDto in accommodations)
                    {
                        var accommodation = new QuotationAccommodation
                        {
                            quotation_id = quotation.id,
                            cityID = accommodationDto.cityID,
                            hotelID = accommodationDto.hotelID,
                            check_in = accommodationDto.check_in,
                            check_out = accommodationDto.check_out,
                            room_type = accommodationDto.room_type,
                            no_of_rooms = accommodationDto.no_of_rooms,
                            no_of_nights = accommodationDto.no_of_nights,
                            rate_per_night = accommodationDto.rate_per_night
                        };
                        _context.QuotationAccommodations.Add(accommodation);
                    }
                    await _context.SaveChangesAsync();
                }

                if (transportations.Any())
                {
                    foreach (var transportationDto in transportations)
                    {
                        var transportation = new QuotationTransportation
                        {
                            quotation_id = quotation.id,
                            vehicle_name = transportationDto.vehicle_name,
                            capacity = transportationDto.capacity,
                            sectorID = transportationDto.sectorID,
                            rate = transportationDto.rate,
                            quantity = transportationDto.quantity
                        };
                        _context.QuotationTransportations.Add(transportation);
                    }
                    await _context.SaveChangesAsync();
                }

                if (visas.Any())
                {
                    foreach (var visaDto in visas)
                    {
                        var visa = new QuotationVisaService
                        {
                            quotation_id = quotation.id,
                            Description = visaDto.Description,
                            Rate = visaDto.Rate,
                            Qty = visaDto.Qty
                        };
                        _context.QuotationVisaServices.Add(visa);
                    }
                    await _context.SaveChangesAsync();
                }

                if (airlines.Any())
                {
                    foreach (var airlineDto in airlines)
                    {
                        var airline = new QuotationAirlines
                        {
                            quotation_id = quotation.id,
                            carrier = airlineDto.carrier,
                            pax_count = airlineDto.pax_count,
                            @class = airlineDto.@class,
                            sector = airlineDto.sector,
                            rate = airlineDto.rate,
                            quantity = airlineDto.quantity
                        };
                        _context.QuotationAirlines.Add(airline);
                    }
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                // STEP 3: Reload the quotation with all related entities INCLUDING CLIENT
                var savedQuotation = await _context.Quotations
                    .Include(q => q.Client) // Include Client
                    .Include(q => q.Accommodations)
                    .Include(q => q.Transportations)
                    .Include(q => q.VisaServices)
                    .Include(q => q.Airlines)
                    .FirstOrDefaultAsync(q => q.id == quotation.id);

                return CreatedAtAction("GetQuotation", new { id = quotation.id }, savedQuotation);
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Database update error: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                return StatusCode(500, new { 
                    message = "Database update failed", 
                    error = dbEx.Message,
                    innerError = dbEx.InnerException?.Message
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"General error: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Failed to create quotation", 
                    error = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Quotation>> PutQuotation(int id, QuotationDto quotationDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                Console.WriteLine($"\n\n=== 🚀 PUT QUOTATION REQUEST STARTED ===");
                Console.WriteLine($"📍 Route ID: {id}");

                var existingQuotation = await _context.Quotations
                    .Include(q => q.Client) // Include Client
                    .Include(q => q.Accommodations)
                    .Include(q => q.Transportations)
                    .Include(q => q.VisaServices)
                    .Include(q => q.Airlines)
                    .FirstOrDefaultAsync(q => q.id == id);

                if (existingQuotation == null)
                {
                    Console.WriteLine($"❌ Quotation with ID {id} not found in database");
                    return NotFound($"Quotation with ID {id} not found");
                }

                Console.WriteLine($"✅ Found existing quotation: {existingQuotation.quotation_number}");

                // FIX: Only update client_id if it's valid (greater than 0)
                if (quotationDto.client_id > 0)
                {
                    var clientExists = await _context.Clients.AnyAsync(c => c.Id == quotationDto.client_id);
                    if (!clientExists)
                    {
                        Console.WriteLine($"❌ Client with ID {quotationDto.client_id} does not exist");
                        return BadRequest($"Client with ID {quotationDto.client_id} does not exist");
                    }
                    existingQuotation.client_id = quotationDto.client_id;
                    Console.WriteLine($"✅ Updated client_id to: {quotationDto.client_id}");
                }
                else
                {
                    Console.WriteLine($"⚠️  Keeping existing client_id: {existingQuotation.client_id} (received: {quotationDto.client_id})");
                }

                // Update main quotation fields with proper null checking
                Console.WriteLine($"\n🔄 UPDATING QUOTATION FIELDS:");
                
                existingQuotation.traveling_details = !string.IsNullOrEmpty(quotationDto.traveling_details) 
                    ? quotationDto.traveling_details 
                    : existingQuotation.traveling_details;
                
                existingQuotation.packgeID = quotationDto.packgeID > 0 
                    ? quotationDto.packgeID 
                    : existingQuotation.packgeID;
                
                existingQuotation.reference_by = !string.IsNullOrEmpty(quotationDto.reference_by) 
                    ? quotationDto.reference_by 
                    : existingQuotation.reference_by;
                
                existingQuotation.makkah_nights = quotationDto.makkah_nights > 0 
                    ? quotationDto.makkah_nights 
                    : existingQuotation.makkah_nights;
                
                existingQuotation.madinah_nights = quotationDto.madinah_nights > 0 
                    ? quotationDto.madinah_nights 
                    : existingQuotation.madinah_nights;
                
                existingQuotation.makkah_nights1 = quotationDto.makkah_nights1 ?? existingQuotation.makkah_nights1;
                existingQuotation.jeddah_nights = quotationDto.jeddah_nights ?? existingQuotation.jeddah_nights;
                existingQuotation.adult_count = quotationDto.adult_count ?? existingQuotation.adult_count;
                existingQuotation.child_count = quotationDto.child_count ?? existingQuotation.child_count;
                existingQuotation.infant_count = quotationDto.infant_count ?? existingQuotation.infant_count;
                existingQuotation.advance_amount = quotationDto.advance_amount ?? existingQuotation.advance_amount;
                existingQuotation.status = !string.IsNullOrEmpty(quotationDto.status) 
                    ? quotationDto.status 
                    : existingQuotation.status;

                // Recalculate totals
                existingQuotation.total_stay_days = existingQuotation.makkah_nights + existingQuotation.madinah_nights + 
                                                (existingQuotation.makkah_nights1 ?? 0) + (existingQuotation.jeddah_nights ?? 0);
                existingQuotation.total_pax = (existingQuotation.adult_count ?? 0) + (existingQuotation.child_count ?? 0) + (existingQuotation.infant_count ?? 0);

                Console.WriteLine($"   Total Stay Days: {existingQuotation.total_stay_days}");
                Console.WriteLine($"   Total Pax: {existingQuotation.total_pax}");

                // Remove existing related entities only if new ones are provided
                Console.WriteLine($"\n🔄 PROCESSING RELATED ENTITIES:");
                
                if (quotationDto.Accommodations?.Any() == true)
                {
                    Console.WriteLine($"   Removing {existingQuotation.Accommodations.Count} existing accommodations");
                    _context.QuotationAccommodations.RemoveRange(existingQuotation.Accommodations);
                }
                
                if (quotationDto.Transportations?.Any() == true)
                {
                    Console.WriteLine($"   Removing {existingQuotation.Transportations.Count} existing transportations");
                    _context.QuotationTransportations.RemoveRange(existingQuotation.Transportations);
                }
                
                if (quotationDto.VisaServices?.Any() == true)
                {
                    Console.WriteLine($"   Removing {existingQuotation.VisaServices.Count} existing visa services");
                    _context.QuotationVisaServices.RemoveRange(existingQuotation.VisaServices);
                }
                
                if (quotationDto.Airlines?.Any() == true)
                {
                    Console.WriteLine($"   Removing {existingQuotation.Airlines.Count} existing airlines");
                    _context.QuotationAirlines.RemoveRange(existingQuotation.Airlines);
                }

                // Add updated related entities - CREATE NEW ENTITIES FROM DTOs WITHOUT audit fields
                var currentUserId = GetCurrentUserId();
                Console.WriteLine($"   Current User ID: {currentUserId}");
                
                // Accommodations - Map from DTO to Entity
                if (quotationDto.Accommodations?.Any() == true)
                {
                    Console.WriteLine($"   Adding {quotationDto.Accommodations.Count} new accommodations");
                    foreach (var accommodationDto in quotationDto.Accommodations)
                    {
                        var accommodation = new QuotationAccommodation
                        {
                            quotation_id = id,
                            cityID = accommodationDto.cityID,
                            hotelID = accommodationDto.hotelID,
                            check_in = accommodationDto.check_in,
                            check_out = accommodationDto.check_out,
                            room_type = accommodationDto.room_type,
                            no_of_rooms = accommodationDto.no_of_rooms,
                            no_of_nights = accommodationDto.no_of_nights,
                            rate_per_night = accommodationDto.rate_per_night
                        };
                        _context.QuotationAccommodations.Add(accommodation);
                    }
                }

                // Transportations - Map from DTO to Entity
                if (quotationDto.Transportations?.Any() == true)
                {
                    Console.WriteLine($"   Adding {quotationDto.Transportations.Count} new transportations");
                    foreach (var transportationDto in quotationDto.Transportations)
                    {
                        var transportation = new QuotationTransportation
                        {
                            quotation_id = id,
                            vehicle_name = transportationDto.vehicle_name,
                            capacity = transportationDto.capacity,
                            sectorID = transportationDto.sectorID,
                            rate = transportationDto.rate,
                            quantity = transportationDto.quantity
                        };
                        _context.QuotationTransportations.Add(transportation);
                    }
                }

                // Visa Services - Map from DTO to Entity
                if (quotationDto.VisaServices?.Any() == true)
                {
                    Console.WriteLine($"   Adding {quotationDto.VisaServices.Count} new visa services");
                    foreach (var visaDto in quotationDto.VisaServices)
                    {
                        var visa = new QuotationVisaService
                        {
                            quotation_id = id,
                            Description = visaDto.Description,
                            Rate = visaDto.Rate,
                            Qty = visaDto.Qty
                        };
                        _context.QuotationVisaServices.Add(visa);
                    }
                }

                // Airlines - Map from DTO to Entity
                if (quotationDto.Airlines?.Any() == true)
                {
                    Console.WriteLine($"   Adding {quotationDto.Airlines.Count} new airlines");
                    foreach (var airlineDto in quotationDto.Airlines)
                    {
                        var airline = new QuotationAirlines
                        {
                            quotation_id = id,
                            carrier = airlineDto.carrier,
                            pax_count = airlineDto.pax_count,
                            @class = airlineDto.@class,
                            sector = airlineDto.sector,
                            rate = airlineDto.rate,
                            quantity = airlineDto.quantity
                        };
                        _context.QuotationAirlines.Add(airline);
                    }
                }

                // Calculate totals from related entities (use existing if no new ones provided)
                decimal finalAccommodationTotal = quotationDto.Accommodations?.Any() == true 
                    ? quotationDto.Accommodations.Sum(a => (a.no_of_rooms * a.no_of_nights * a.rate_per_night))
                    : existingQuotation.Accommodations.Sum(a => (a.no_of_rooms * a.no_of_nights * a.rate_per_night));
                
                decimal finalTransportationTotal = quotationDto.Transportations?.Any() == true
                    ? quotationDto.Transportations.Sum(t => (t.rate * t.quantity))
                    : existingQuotation.Transportations.Sum(t => (t.rate * t.quantity));
                
                decimal finalVisaTotal = quotationDto.VisaServices?.Any() == true
                    ? quotationDto.VisaServices.Sum(v => (v.Rate * v.Qty))
                    : existingQuotation.VisaServices.Sum(v => (v.Rate * v.Qty));
                
                decimal finalAirlinesTotal = quotationDto.Airlines?.Any() == true
                    ? quotationDto.Airlines.Sum(a => (a.rate * a.quantity))
                    : existingQuotation.Airlines.Sum(a => (a.rate * a.quantity));
                
                existingQuotation.total_package_cost = finalAccommodationTotal + finalTransportationTotal + finalVisaTotal + finalAirlinesTotal;
                existingQuotation.grand_total = existingQuotation.total_package_cost - (existingQuotation.advance_amount ?? 0);
                existingQuotation.cost_per_person = existingQuotation.total_pax > 0 ? existingQuotation.grand_total / existingQuotation.total_pax : 0;

                Console.WriteLine($"\n💰 FINAL CALCULATIONS:");
                Console.WriteLine($"   Total Package Cost: {existingQuotation.total_package_cost}");
                Console.WriteLine($"   Grand Total: {existingQuotation.grand_total}");
                Console.WriteLine($"   Cost Per Person: {existingQuotation.cost_per_person}");

                // Update audit fields for main quotation only
                existingQuotation.updated_at = DateTime.Now;
                existingQuotation.modifyBy = currentUserId;
                Console.WriteLine($"   Updated audit fields - Time: {existingQuotation.updated_at}, User: {existingQuotation.modifyBy}");

                Console.WriteLine($"\n💾 SAVING CHANGES TO DATABASE...");
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                Console.WriteLine($"✅ SUCCESS: Quotation {id} updated successfully!");

                // 🔥 CRITICAL FIX: RELOAD AND RETURN THE UPDATED QUOTATION WITH CLIENT
                Console.WriteLine($"🔄 RELOADING UPDATED QUOTATION WITH ALL RELATED ENTITIES...");
                var updatedQuotation = await _context.Quotations
                    .Include(q => q.Client) // Include Client
                    .Include(q => q.Accommodations)
                        .ThenInclude(a => a.City)
                    .Include(q => q.Accommodations)
                        .ThenInclude(a => a.Hotel)
                    .Include(q => q.Transportations)
                        .ThenInclude(t => t.Sector)
                    .Include(q => q.VisaServices)
                    .Include(q => q.Airlines)
                    .FirstOrDefaultAsync(q => q.id == id);

                if (updatedQuotation == null)
                {
                    Console.WriteLine($"❌ Failed to reload quotation after update");
                    return StatusCode(500, "Failed to reload quotation after update");
                }

                Console.WriteLine($"✅ Successfully reloaded quotation: {updatedQuotation.quotation_number}");
                Console.WriteLine($"📊 Reloaded data - Client: {updatedQuotation.Client?.FullName}, Accommodations: {updatedQuotation.Accommodations?.Count}, Transportations: {updatedQuotation.Transportations?.Count}, Visas: {updatedQuotation.VisaServices?.Count}, Airlines: {updatedQuotation.Airlines?.Count}");

                return Ok(updatedQuotation);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌ ERROR: Failed to update quotation: {ex.Message}");
                Console.WriteLine($"📝 Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"🔍 Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Failed to update quotation: {ex.Message}");
            }
        }

        // DELETE: api/Quotation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuotation(int id)
        {
            try
            {
                var quotation = await _context.Quotations
                    .Include(q => q.Client)
                    .FirstOrDefaultAsync(q => q.id == id);

                if (quotation == null)
                {
                    return NotFound();
                }

                _context.Quotations.Remove(quotation);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to delete quotation: {ex.Message}");
            }
        }
    }
}