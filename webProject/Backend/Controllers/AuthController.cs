// Controllers/AuthController.cs
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;

        public AuthController(IUserService userService, IJwtService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (await _userService.UsernameExistsAsync(request.UserName))
                {
                    return BadRequest(new LoginResponse
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                var user = await _userService.RegisterAsync(request);
                var token = _jwtService.GenerateToken(user);
                await _userService.UpdateLastLoginAsync(user.UserID);

                var response = new LoginResponse
                {
                    Success = true,
                    Message = "Registration successful",
                    Token = token,
                    User = new UserResponse
                    {
                        UserID = user.UserID,
                        UserName = user.UserName,
                        UserFullName = user.UserFullName,
                        UserImage = user.UserImage,
                        LastLoginDT = user.LastLoginDT
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _userService.LoginAsync(request);

                if (user == null)
                {
                    return Unauthorized(new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    });
                }

                var token = _jwtService.GenerateToken(user);
                await _userService.UpdateLastLoginAsync(user.UserID);

                var response = new LoginResponse
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = new UserResponse
                    {
                        UserID = user.UserID,
                        UserName = user.UserName,
                        UserFullName = user.UserFullName,
                        UserImage = user.UserImage,
                        LastLoginDT = user.LastLoginDT
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    Success = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            return Ok(new { Message = "Logout successful" });
        }

        [HttpPost("validate-username")]
        public async Task<ActionResult> ValidateUsername([FromBody] UsernameRequest request)
        {
            var exists = await _userService.UsernameExistsAsync(request.Username);
            return Ok(new { exists });
        }

        [HttpPost("validate-token")]
        public IActionResult ValidateToken()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "Token is required" });

            var principal = _jwtService.ValidateToken(token);
            
            if (principal == null)
                return Unauthorized(new { message = "Invalid or expired token" });

            return Ok(new { valid = true });
        }

        [Authorize]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var user = await _userService.GetUserByIdAsync(userId);
            
            if (user == null)
                return Unauthorized(new { message = "User not found" });

            var newToken = _jwtService.GenerateToken(user);
            return Ok(new { token = newToken });
        }
    }

    public class UsernameRequest
    {
        public string? Username { get; set; }
    }
}