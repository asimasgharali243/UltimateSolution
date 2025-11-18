using Backend.Data; // Add this line
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemUnitController : ControllerBase
    {
        private readonly ApplicationDbContext _context;


        public ItemUnitController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dropdown")]
        public async Task<ActionResult<IEnumerable<DropdownDTO>>> GetItemUnitsDropdown()
        {
            var units = await _context.ItemUnits
                .Where(u => u.UnitName != null)
                .Select(u => new DropdownDTO
                {
                    Value = u.UnitID,
                    Label = u.UnitName
                })
                .OrderBy(u => u.Label)
                .ToListAsync();

            return Ok(units);
        }
    }
}