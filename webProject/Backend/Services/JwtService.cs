using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Backend.Data;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        ClaimsPrincipal? ValidateToken(string token);
        Task<List<Claim>> GetUserClaimsAsync(User user);
        bool IsTokenExpired(string token);
        DateTime GetTokenExpiration(string token);
    }

    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public JwtService(IConfiguration configuration, ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public string GenerateToken(User user)
        {
            var claims = GetUserClaimsAsync(user).Result;
            
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(Convert.ToDouble(_configuration["Jwt:ExpireHours"] ?? "24")),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

       public async Task<List<Claim>> GetUserClaimsAsync(User user)
{
    var claims = new List<Claim>
    {
        new Claim("userId", user.UserID.ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
        new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
        new Claim("fullName", user.UserFullName ?? string.Empty),
        new Claim("lastLogin", user.LastLoginDT?.ToString("yyyy-MM-ddTHH:mm:ss") ?? DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss")),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(JwtRegisteredClaimNames.Exp, DateTimeOffset.UtcNow.AddHours(Convert.ToDouble(_configuration["Jwt:ExpireHours"] ?? "24")).ToUnixTimeSeconds().ToString())
    };

    // FIXED: Check the actual IsAdmin field from User table
    var userFromDb = await _context.Users
        .Where(u => u.UserID == user.UserID)
        .Select(u => new { u.IsAdmin })
        .FirstOrDefaultAsync();

    bool isAdmin = userFromDb?.IsAdmin ?? false;

    if (isAdmin)
    {
        claims.Add(new Claim("role", "admin"));
        claims.Add(new Claim("isAdmin", "true"));
        Console.WriteLine($"🔍 DEBUG - User {user.UserName} is ADMIN (IsAdmin field = true)");
    }
    else
    {
        claims.Add(new Claim("role", "user"));
        claims.Add(new Claim("isAdmin", "false"));
        Console.WriteLine($"🔍 DEBUG - User {user.UserName} is REGULAR USER (IsAdmin field = false)");
    }

    // Add user rights as claims
    var userRights = await _context.UserRights
        .Include(ur => ur.UserForm)
        .Where(ur => ur.userID == user.UserID)
        .ToListAsync();

    Console.WriteLine($"🔍 DEBUG - Adding {userRights.Count} permission claims for user {user.UserName}");

    foreach (var right in userRights)
    {
        var formName = right.UserForm?.formName ?? "unknown";
        if (right.CanView == true)
        {
            claims.Add(new Claim($"right_{formName}_view", "true"));
            Console.WriteLine($"🔍 DEBUG - Added permission: right_{formName}_view");
        }
        if (right.CanSave == true)
        {
            claims.Add(new Claim($"right_{formName}_save", "true"));
            Console.WriteLine($"🔍 DEBUG - Added permission: right_{formName}_save");
        }
        if (right.CanUpdate == true)
        {
            claims.Add(new Claim($"right_{formName}_update", "true"));
            Console.WriteLine($"🔍 DEBUG - Added permission: right_{formName}_update");
        }
        if (right.CanDelete == true)
        {
            claims.Add(new Claim($"right_{formName}_delete", "true"));
            Console.WriteLine($"🔍 DEBUG - Added permission: right_{formName}_delete");
        }
        if (right.CanPost == true)
        {
            claims.Add(new Claim($"right_{formName}_post", "true"));
            Console.WriteLine($"🔍 DEBUG - Added permission: right_{formName}_post");
        }
    }

    return claims;
}
        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured"));

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero,
                    ValidateLifetime = true
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch (SecurityTokenExpiredException)
            {
                return null;
            }
            catch
            {
                return null;
            }
        }

        public bool IsTokenExpired(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var exp = jwtToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Exp).Value;
                var expDate = DateTimeOffset.FromUnixTimeSeconds(long.Parse(exp)).UtcDateTime;
                return expDate <= DateTime.UtcNow;
            }
            catch
            {
                return true;
            }
        }

        public DateTime GetTokenExpiration(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var exp = jwtToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Exp).Value;
                return DateTimeOffset.FromUnixTimeSeconds(long.Parse(exp)).UtcDateTime;
            }
            catch
            {
                return DateTime.UtcNow;
            }
        }
    }
}