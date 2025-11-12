using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserFormController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserFormController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/UserForm
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserForm>>> GetUserForms()
        {
            return await _context.UserForms.ToListAsync();
        }

        // GET: api/UserForm/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserForm>> GetUserForm(int id)
        {
            var userForm = await _context.UserForms.FindAsync(id);

            if (userForm == null)
            {
                return NotFound();
            }

            return userForm;
        }

        // POST: api/UserForm
        [HttpPost]
        public async Task<ActionResult<UserForm>> PostUserForm(UserForm userForm)
        {
            _context.UserForms.Add(userForm);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserForm", new { id = userForm.formID }, userForm);
        }

        // PUT: api/UserForm/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserForm(int id, UserForm userForm)
        {
            if (id != userForm.formID)
            {
                return BadRequest();
            }

            _context.Entry(userForm).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserFormExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/UserForm/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserForm(int id)
        {
            var userForm = await _context.UserForms.FindAsync(id);
            if (userForm == null)
            {
                return NotFound();
            }

            _context.UserForms.Remove(userForm);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserFormExists(int id)
        {
            return _context.UserForms.Any(e => e.formID == id);
        }
    }
}