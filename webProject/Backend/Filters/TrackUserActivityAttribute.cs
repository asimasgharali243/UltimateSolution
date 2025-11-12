using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using System.Security.Claims;

namespace Backend.Filters
{
    public class TrackUserActivityAttribute : ActionFilterAttribute
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public TrackUserActivityAttribute(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            await LogUserActivity(context, "VIEW");
            await next();
        }

        private async Task LogUserActivity(ActionExecutingContext context, string actionType)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var httpContext = context.HttpContext;

                var log = new UserActivityLog
                {
                    UserId = GetUserId(httpContext),
                    UserName = GetUserName(httpContext),
                    TableName = $"{context.Controller.GetType().Name.Replace("Controller", "")}",
                    ActionType = actionType,
                    IPAddress = httpContext.Connection?.RemoteIpAddress?.ToString(),
                    DeviceInfo = httpContext.Request.Headers["User-Agent"].ToString(),
                    Remarks = $"Accessed {context.HttpContext.Request.Path}",
                    ActionDate = DateTime.Now
                };

                await dbContext.UserActivityLogs.AddAsync(log);
                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Don't break application if logging fails
                Console.WriteLine($"Activity logging failed: {ex.Message}");
            }
        }

        private int GetUserId(HttpContext httpContext)
        {
            var userId = httpContext.User?.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                userId = httpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }
            return int.TryParse(userId, out int id) ? id : 0;
        }

        private string? GetUserName(HttpContext httpContext)
        {
            var userName = httpContext.User?.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
            {
                userName = httpContext.User?.FindFirst("userName")?.Value;
            }
            return userName ?? "Unknown";
        }
    }
}