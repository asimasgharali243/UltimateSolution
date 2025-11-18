using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserRightsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserRightsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/UserRights/Users
        [HttpGet("Users")]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.Active == true)
                    .OrderBy(u => u.UserFullName)
                    .Select(u => new UserResponse
                    {
                        UserID = u.UserID,
                        UserName = u.UserName,
                        UserFullName = u.UserFullName,
                        UserImage = u.UserImage,
                        LastLoginDT = u.LastLoginDT
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving users: {ex.Message}", details = ex.InnerException?.Message });
            }
        }

        // GET: api/UserRights/Forms
[HttpGet("Forms")]
public async Task<ActionResult<IEnumerable<object>>> GetForms()
{
    try
    {
        var forms = await _context.UserForms
            .Select(f => new 
            {
                formID = f.formID,
                formName = f.formName ?? "Unknown",
                formDisplayName = f.formDisplayName ?? "Unknown Form",
                Menu = f.Menu ?? "Setup", // Ensure this field is included
                sortOrder = f.sortOrder // Ensure this field is included
            })
            .OrderBy(f => f.Menu) // Optional: order by menu name
            .ThenBy(f => f.sortOrder) // Then by sort order
            .ToListAsync();

        return Ok(forms);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = $"Error retrieving forms: {ex.Message}", details = ex.InnerException?.Message });
    }
}

        // GET: api/UserRights/User/{userId}
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<UserRightsResponse>>> GetUserRightsByUser(int userId)
        {
            try
            {
                var userRights = await _context.UserRights
                    .Include(ur => ur.UserForm)
                    .Where(ur => ur.userID == userId)
                    .Select(ur => new UserRightsResponse
                    {
                        Id = ur.id,
                        UserID = ur.userID,
                        FormID = ur.formID,
                        FormName = ur.UserForm.formDisplayName ?? "Unknown Form",
                        FormSystemName = ur.UserForm.formName ?? "Unknown",
                        CanView = ur.CanView ?? false,
                        CanSave = ur.CanSave ?? false,
                        CanUpdate = ur.CanUpdate ?? false,
                        CanDelete = ur.CanDelete ?? false,
                        CanPost = ur.CanPost ?? false
                    })
                    .ToListAsync();

                return Ok(userRights);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving user rights: {ex.Message}", details = ex.InnerException?.Message });
            }
        }

        // POST: api/UserRights/Bulk
        [HttpPost("Bulk")]
        public async Task<ActionResult> SaveUserRights([FromBody] BulkUserRightsRequest request)
        {
            if (request == null || request.UserRights == null || !request.UserRights.Any())
            {
                return BadRequest("No user rights data provided");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userId = request.UserRights.First().UserID;
                
                // Remove existing rights for this user
                var existingRights = await _context.UserRights
                    .Where(ur => ur.userID == userId)
                    .ToListAsync();
                    
                _context.UserRights.RemoveRange(existingRights);

                // Add new rights
                var newRights = request.UserRights.Select(ur => new UserRights
                {
                    userID = ur.UserID,
                    formID = ur.FormID,
                    CanView = ur.CanView,
                    CanSave = ur.CanSave,
                    CanUpdate = ur.CanUpdate,
                    CanDelete = ur.CanDelete,
                    CanPost = ur.CanPost
                }).ToList();

                await _context.UserRights.AddRangeAsync(newRights);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "User rights saved successfully", count = newRights.Count });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Failed to save user rights: {ex.Message}", details = ex.InnerException?.Message });
            }
        }

        // GET: api/UserRights/TestConnection
        [HttpGet("TestConnection")]
        public async Task<ActionResult> TestConnection()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var formCount = await _context.UserForms.CountAsync();
                var rightsCount = await _context.UserRights.CountAsync();

                return Ok(new { 
                    message = "Database connection successful",
                    userCount,
                    formCount,
                    rightsCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Database connection failed",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        // GET: api/UserRights/CheckData
        [HttpGet("CheckData")]
        public async Task<ActionResult> CheckData()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new { u.UserID, u.UserName, u.UserFullName, u.Active })
                    .Take(5)
                    .ToListAsync();

                var forms = await _context.UserForms
                    .Select(f => new { f.formID, f.formName, f.formDisplayName })
                    .Take(5)
                    .ToListAsync();

                var rights = await _context.UserRights
                    .Include(ur => ur.UserForm)
                    .Select(ur => new 
                    { 
                        ur.id, 
                        ur.userID, 
                        ur.formID,
                        FormName = ur.UserForm.formDisplayName,
                        ur.CanView,
                        ur.CanSave 
                    })
                    .Take(5)
                    .ToListAsync();

                return Ok(new { 
                    users,
                    forms, 
                    rights,
                    userCount = users.Count,
                    formCount = forms.Count,
                    rightsCount = rights.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Error checking data",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
    }

    // DTO Classes
    public class BulkUserRightsRequest
    {
        public List<UserRightsDto> UserRights { get; set; } = new List<UserRightsDto>();
    }

    public class UserRightsDto
    {
        public int UserID { get; set; }
        public int FormID { get; set; }
        public bool CanView { get; set; }
        public bool CanSave { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
        public bool CanPost { get; set; }
    }

    public class UserRightsResponse
    {
        public int Id { get; set; }
        public int? UserID { get; set; }
        public int? FormID { get; set; }
        public string FormName { get; set; } = string.Empty;
        public string FormSystemName { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanSave { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
        public bool CanPost { get; set; }
    }

    // public class UserResponse
    // {
    //     public int UserID { get; set; }
    //     public string UserName { get; set; } = string.Empty;
    //     public string UserFullName { get; set; } = string.Empty;
    //     public string UserImage { get; set; } = string.Empty;
    //     public DateTime? LastLoginDT { get; set; }
    // }
}