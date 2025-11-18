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
        Task<bool> IsUserAdminAsync(int userId);
    }

    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;

        public PermissionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsUserAdminAsync(int userId)
        {
            var user = await _context.Users
                .Where(u => u.UserID == userId)
                .Select(u => new { u.IsAdmin })
                .FirstOrDefaultAsync();
                
            return user?.IsAdmin ?? false;
        }

        public async Task<bool> HasPermissionAsync(int userId, string formName, string permission)
        {
            // Check if user is admin first
            var isAdmin = await IsUserAdminAsync(userId); // FIXED: removed 'int'
            if (isAdmin)
            {
                Console.WriteLine($"🔍 DEBUG - User {userId} is admin, granting permission for {formName}.{permission}");
                return true;
            }

            var userRight = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId && ur.UserForm.formName == formName)
                .FirstOrDefaultAsync();

            if (userRight == null)
            {
                Console.WriteLine($"🔍 DEBUG - No rights found for user {userId} on form {formName}");
                return false;
            }

            bool hasPermission = permission.ToLower() switch
            {
                "view" => userRight.CanView ?? false,
                "save" => userRight.CanSave ?? false,
                "update" => userRight.CanUpdate ?? false,
                "delete" => userRight.CanDelete ?? false,
                "post" => userRight.CanPost ?? false,
                _ => false
            };

            Console.WriteLine($"🔍 DEBUG - Permission check for user {userId} on {formName}.{permission}: {hasPermission}");
            return hasPermission;
        }

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            var permissions = new List<string>();
            
            // Check if user is admin
            var isAdmin = await IsUserAdminAsync(userId); // FIXED: removed 'int'
            if (isAdmin)
            {
                // Admin has all permissions for all forms
                var allForms = await _context.UserForms.ToListAsync();
                foreach (var form in allForms)
                {
                    permissions.Add($"{form.formName}_view");
                    permissions.Add($"{form.formName}_save");
                    permissions.Add($"{form.formName}_update");
                    permissions.Add($"{form.formName}_delete");
                    permissions.Add($"{form.formName}_post");
                }
                Console.WriteLine($"🔍 DEBUG - Admin user {userId} granted all permissions for {allForms.Count} forms");
                return permissions;
            }

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

            Console.WriteLine($"🔍 DEBUG - User {userId} has {permissions.Count} permissions from database");
            return permissions;
        }

        public async Task<Dictionary<string, bool>> GetUserFormPermissionsAsync(int userId, string formName)
        {
            // Check if user is admin first
            var isAdmin = await IsUserAdminAsync(userId); // FIXED: removed 'int'
            if (isAdmin)
            {
                Console.WriteLine($"🔍 DEBUG - Admin user {userId} granted all permissions for form {formName}");
                return new Dictionary<string, bool>
                {
                    ["view"] = true,
                    ["save"] = true,
                    ["update"] = true,
                    ["delete"] = true,
                    ["post"] = true
                };
            }

            var userRight = await _context.UserRights
                .Include(ur => ur.UserForm)
                .Where(ur => ur.userID == userId && ur.UserForm.formName == formName)
                .FirstOrDefaultAsync();

            if (userRight == null)
            {
                Console.WriteLine($"🔍 DEBUG - No rights found for user {userId} on form {formName}");
                return new Dictionary<string, bool>
                {
                    ["view"] = false,
                    ["save"] = false,
                    ["update"] = false,
                    ["delete"] = false,
                    ["post"] = false
                };
            }

            var permissions = new Dictionary<string, bool>
            {
                ["view"] = userRight.CanView ?? false,
                ["save"] = userRight.CanSave ?? false,
                ["update"] = userRight.CanUpdate ?? false,
                ["delete"] = userRight.CanDelete ?? false,
                ["post"] = userRight.CanPost ?? false
            };

            Console.WriteLine($"🔍 DEBUG - Database permissions for user {userId} on form {formName}:");
            Console.WriteLine($"   - View: {permissions["view"]}");
            Console.WriteLine($"   - Save: {permissions["save"]}");
            Console.WriteLine($"   - Update: {permissions["update"]}");
            Console.WriteLine($"   - Delete: {permissions["delete"]}");
            Console.WriteLine($"   - Post: {permissions["post"]}");

            return permissions;
        }
    }
}