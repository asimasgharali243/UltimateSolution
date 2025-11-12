using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(int userId, string formName, string permission);
        Task<List<string>> GetUserPermissionsAsync(int userId);
        Task<Dictionary<string, bool>> GetUserFormPermissionsAsync(int userId, string formName);
    }

    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;

        public PermissionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasPermissionAsync(int userId, string formName, string permission)
        {
            var userRight = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId && ur.UserForm.formName == formName)
                .FirstOrDefaultAsync();

            if (userRight == null) return false;

            return permission.ToLower() switch
            {
                "view" => userRight.CanView ?? false,
                "save" => userRight.CanSave ?? false,
                "update" => userRight.CanUpdate ?? false,
                "delete" => userRight.CanDelete ?? false,
                "post" => userRight.CanPost ?? false,
                _ => false
            };
        }

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            var permissions = new List<string>();
            var userRights = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId)
                .ToListAsync();

            foreach (var right in userRights)
            {
                var formName = right.UserForm?.formName ?? "unknown";
                if (right.CanView == true) permissions.Add($"{formName}_view");
                if (right.CanSave == true) permissions.Add($"{formName}_save");
                if (right.CanUpdate == true) permissions.Add($"{formName}_update");
                if (right.CanDelete == true) permissions.Add($"{formName}_delete");
                if (right.CanPost == true) permissions.Add($"{formName}_post");
            }

            return permissions;
        }

        public async Task<Dictionary<string, bool>> GetUserFormPermissionsAsync(int userId, string formName)
        {
            var userRight = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId && ur.UserForm.formName == formName)
                .FirstOrDefaultAsync();

            if (userRight == null)
            {
                return new Dictionary<string, bool>
                {
                    ["view"] = false,
                    ["save"] = false,
                    ["update"] = false,
                    ["delete"] = false,
                    ["post"] = false
                };
            }

            return new Dictionary<string, bool>
            {
                ["view"] = userRight.CanView ?? false,
                ["save"] = userRight.CanSave ?? false,
                ["update"] = userRight.CanUpdate ?? false,
                ["delete"] = userRight.CanDelete ?? false,
                ["post"] = userRight.CanPost ?? false
            };
        }
    }
}