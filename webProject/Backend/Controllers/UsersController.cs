using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Services;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<ActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(new UserResponse
            {
                UserID = user.UserID,
                UserName = user.UserName,
                UserFullName = user.UserFullName,
                UserImage = user.UserImage,
                LastLoginDT = user.LastLoginDT
            });
        }
    }
}