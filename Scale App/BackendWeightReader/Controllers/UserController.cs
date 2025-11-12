using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendWeightReader.Data;
using BackendWeightReader.Models;
using BCrypt.Net;

namespace BackendWeightReader.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ Combined Register + Login with Smart Common PIN Logic
        [HttpPost]
        public async Task<IActionResult> RegisterOrLogin([FromBody] LoginRequest login)
        {
            if (string.IsNullOrWhiteSpace(login.UserName))
            {
                return BadRequest("Username are required.");
            }

            if( string.IsNullOrWhiteSpace(login.Password))
            {return BadRequest("Password are required.");}

            if(string.IsNullOrWhiteSpace(login.PIN))
            {return BadRequest("PIN are required.");}
            


            // ✅ STEP 1: Check if user exists first
            var existingUser = await _context.tbl_User
                .FirstOrDefaultAsync(u => u.UserName == login.UserName);

            // ====================================================
            // 🔹 CASE 1 — USER EXISTS → LOGIN FLOW
            // ====================================================
            if (existingUser != null)
            {
                // Check PIN before password
                var commonPin = await _context.tbl_UserPin.FirstOrDefaultAsync();
                if (commonPin == null || commonPin.PIN != login.PIN)
                    return Unauthorized("Invalid common PIN.");

                // Verify password
                bool validPassword = BCrypt.Net.BCrypt.Verify(login.Password, existingUser.Password);
                if (!validPassword)
                    return Unauthorized("Invalid password.");

                return Ok(new
                {
                    Message = "Login successful.",
                    UserId = existingUser.User_ID,
                    UserName = existingUser.UserName
                });
            }

            // ====================================================
            // 🔹 CASE 2 — USER NOT FOUND → REGISTRATION FLOW
            // ====================================================

            // Check if common PIN exists
            // var existingPin = await _context.tbl_UserPin.FirstOrDefaultAsync();
            // if (existingPin == null)
            // {
            //     // No PIN? Create a new common PIN record
            //     existingPin = new UserPin
            //     {
                    
            //          PIN_ID=1,
            //          PIN = login.PIN
            //     };

            //     _context.tbl_UserPin.Add(existingPin);
            //     await _context.SaveChangesAsync();
            // }
            // else
            // {
            //     // PIN exists → verify
            //     if (existingPin.PIN != login.PIN)
            //         return Unauthorized("Invalid common PIN.");
            // }

            // // Now create the new user
            // var newUser = new User
            // {
            //     UserName = login.UserName,
            //     Password = BCrypt.Net.BCrypt.HashPassword(login.Password),
            //     Creation_DateTime = DateTime.Now,
            //     Active = true
            // };

            // _context.tbl_User.Add(newUser);
            // await _context.SaveChangesAsync();

            return
            BadRequest("User not found.");
            //  Ok(new
            // {
            //     Message = "New user registered successfully.",
            //     UserId = newUser.User_ID,
            //     UserName = newUser.UserName
            // });
        }

        // ✅ Get all users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            return await _context.tbl_User.AsNoTracking().ToListAsync();
        }

        // ✅ Delete user by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.tbl_User.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");

            _context.tbl_User.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully.");
        }
    }
}
