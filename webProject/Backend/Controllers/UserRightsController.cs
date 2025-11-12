using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.Services;
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
        private readonly IPermissionService _permissionService;

        public UserRightsController(ApplicationDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        // GET: api/UserRights/User/5
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<UserRightsResponse>>> GetUserRightsByUser(int userId)
        {
            var userRights = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId)
                .Select(ur => new UserRightsResponse
                {
                    Id = ur.id,
                    UserID = ur.userID,
                    FormID = ur.formID,
                    FormName = ur.UserForm.formDisplayName,
                    FormSystemName = ur.UserForm.formName,
                    CanView = ur.CanView ?? false,
                    CanSave = ur.CanSave ?? false,
                    CanUpdate = ur.CanUpdate ?? false,
                    CanDelete = ur.CanDelete ?? false,
                    CanPost = ur.CanPost ?? false
                })
                .ToListAsync();

            return Ok(userRights);
        }

        // GET: api/UserRights/CurrentUser
        [HttpGet("CurrentUser")]
        public async Task<ActionResult<IEnumerable<UserRightsResponse>>> GetCurrentUserRights()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var userRights = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId)
                .Select(ur => new UserRightsResponse
                {
                    Id = ur.id,
                    UserID = ur.userID,
                    FormID = ur.formID,
                    FormName = ur.UserForm.formDisplayName,
                    FormSystemName = ur.UserForm.formName,
                    CanView = ur.CanView ?? false,
                    CanSave = ur.CanSave ?? false,
                    CanUpdate = ur.CanUpdate ?? false,
                    CanDelete = ur.CanDelete ?? false,
                    CanPost = ur.CanPost ?? false
                })
                .ToListAsync();

            return Ok(userRights);
        }

        // GET: api/UserRights/CurrentUser/Permissions
        [HttpGet("CurrentUser/Permissions")]
        public async Task<ActionResult<Dictionary<string, Dictionary<string, bool>>>> GetCurrentUserPermissions()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var userRights = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId)
                .ToListAsync();

            var permissions = new Dictionary<string, Dictionary<string, bool>>();

            foreach (var right in userRights)
            {
                var formName = right.UserForm?.formName ?? "unknown";
                permissions[formName] = new Dictionary<string, bool>
                {
                    ["view"] = right.CanView ?? false,
                    ["save"] = right.CanSave ?? false,
                    ["update"] = right.CanUpdate ?? false,
                    ["delete"] = right.CanDelete ?? false,
                    ["post"] = right.CanPost ?? false
                };
            }

            return Ok(permissions);
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
                return StatusCode(500, new { message = $"Failed to save user rights: {ex.Message}" });
            }
        }

        // GET: api/UserRights/Forms
        [HttpGet("Forms")]
        public async Task<ActionResult<IEnumerable<UserForm>>> GetForms()
        {
            // COMPLETELY REMOVE THE Active FILTER - UserForm doesn't have Active property
            var forms = await _context.UserForms
                .OrderBy(f => f.formDisplayName)
                .ToListAsync();

            return Ok(forms);
        }

        // GET: api/UserRights/Users
        [HttpGet("Users")]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
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

        // GET: api/UserRights/HasPermission
        [HttpGet("HasPermission")]
        public async Task<ActionResult<bool>> HasPermission(string formName, string permission)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var hasPermission = await _permissionService.HasPermissionAsync(userId, formName, permission);
            return Ok(hasPermission);
        }

        // GET: api/UserRights/FormPermissions/{formName}
        [HttpGet("FormPermissions/{formName}")]
        public async Task<ActionResult<Dictionary<string, bool>>> GetFormPermissions(string formName)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var permissions = await _permissionService.GetUserFormPermissionsAsync(userId, formName);
            return Ok(permissions);
        }

        private bool UserRightsExists(int id)
        {
            return _context.UserRights.Any(e => e.id == id);
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
}