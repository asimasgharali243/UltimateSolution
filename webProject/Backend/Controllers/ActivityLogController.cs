using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ActivityLogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserActivityLog>>> GetActivityLogs(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string? tableName = null,
            [FromQuery] string? actionType = null,
            [FromQuery] int? userId = null)
        {
            var query = _context.UserActivityLogs.AsQueryable();

            if (fromDate.HasValue)
                query = query.Where(log => log.ActionDate >= fromDate.Value);
            
            if (toDate.HasValue)
                query = query.Where(log => log.ActionDate <= toDate.Value);
            
            if (!string.IsNullOrEmpty(tableName))
                query = query.Where(log => log.TableName.Contains(tableName));
            
            if (!string.IsNullOrEmpty(actionType))
                query = query.Where(log => log.ActionType == actionType);
            
            if (userId.HasValue)
                query = query.Where(log => log.UserId == userId.Value);

            var logs = await query
                .OrderByDescending(log => log.ActionDate)
                .Take(1000)
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserActivityLog>>> GetUserActivityLogs(int userId)
        {
            var logs = await _context.UserActivityLogs
                .Where(log => log.UserId == userId)
                .OrderByDescending(log => log.ActionDate)
                .Take(500)
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<UserActivityLog>>> GetRecentActivity()
        {
            var logs = await _context.UserActivityLogs
                .OrderByDescending(log => log.ActionDate)
                .Take(100)
                .ToListAsync();

            return Ok(logs);
        }
    }
}