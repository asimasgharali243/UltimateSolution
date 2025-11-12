// Services/UserService.cs
using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public interface IUserService
    {
        Task<User> RegisterAsync(RegisterRequest request);
        Task<User> LoginAsync(LoginRequest request);
        Task<bool> UsernameExistsAsync(string username, int? excludeUserId = null);
        Task UpdateLastLoginAsync(int userId);
        Task<User> GetUserByIdAsync(int userId);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> RegisterAsync(RegisterRequest request)
        {
            var user = new User
            {
                UserName = request.UserName,
                UserPassword = PasswordHelper.HashPassword(request.Password),
                UserFullName = request.UserFullName,
                UserImage = request.UserImage,
                Active = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == request.UserName && u.Active == true);

            if (user == null || !PasswordHelper.VerifyPassword(request.Password, user.UserPassword))
                return null;

            return user;
        }

        public async Task<bool> UsernameExistsAsync(string username, int? excludeUserId = null)
        {
            var query = _context.Users.Where(u => u.UserName == username);

            if (excludeUserId.HasValue)
                query = query.Where(u => u.UserID != excludeUserId.Value);

            return await query.AnyAsync();
        }

        public async Task UpdateLastLoginAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.LastLoginDT = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<User> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }
    }
}