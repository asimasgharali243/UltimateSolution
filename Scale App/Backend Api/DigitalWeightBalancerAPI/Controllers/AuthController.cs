using Microsoft.AspNetCore.Mvc;
using DigitalWeightBalancerAPI.Data;
using DigitalWeightBalancerAPI.Models;

namespace DigitalWeightBalancerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.tbl_User
                .FirstOrDefault(u => u.UserName == request.UserName && u.Password == request.Password);

            if (user == null)
                return Unauthorized(new { message = "Invalid username or password" });

            var pin = _context.tbl_UserPin
                .FirstOrDefault(p => p.User_ID == user.User_ID && p.PIN == request.PIN);

            if (pin == null)
                return Unauthorized(new { message = "Invalid PIN" });

            return Ok(new { message = "Login successful", userId = user.User_ID });
        }
    }

    public class LoginRequest
    {
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? PIN { get; set; }
    }
}
