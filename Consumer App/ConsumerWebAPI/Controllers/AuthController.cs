using Microsoft.AspNetCore.Mvc;
using ConsumerWebAPI.Data;
using ConsumerWebAPI.Models;
using BCrypt.Net;
using System.Linq;

namespace ConsumerWebAPI.Controllers
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

        // POST: api/Auth/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Username and password are required." });

            var user = _context.tbl_User.FirstOrDefault(u => u.UserName == request.UserName);

            if (user == null)
                return Unauthorized(new { message = "Invalid username." });

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

            if (!isPasswordValid)
                return Unauthorized(new { message = "Invalid password." });

            return Ok(new
            {
                message = "Login successful",
                userName = user.UserName,
                consumerID = user.ConsumerID
            });
        }

        // POST: api/Auth/reset-password
        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.UserName) ||
                string.IsNullOrEmpty(request.CurrentPassword) ||
                string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            var user = _context.tbl_User.FirstOrDefault(u => u.UserName == request.UserName);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Verify old password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password);

            if (!isPasswordValid)
                return Unauthorized(new { message = "Current password is incorrect." });

            // Hash and update new password
            string newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Password = newHashedPassword;

            _context.tbl_User.Update(user);
            _context.SaveChanges();

            return Ok(new { message = "Password updated successfully." });
        }
    }

    // Login request model
    public class LoginRequest
    {
        public string? UserName { get; set; }
        public string? Password { get; set; }
    }

    // Reset password request model
    public class ResetPasswordRequest
    {
        public string? UserName { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
