using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Level4Controller : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public Level4Controller(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dropdown")]
        public async Task<ActionResult<IEnumerable<DropdownDTO>>> GetLevel4Dropdown()
        {
            var level4Items = await _context.Level4
                .Where(l => l.Title4 != null)
                .Select(l => new DropdownDTO
                {
                    Value = l.ID,
                    Label = l.Title4
                })
                .OrderBy(l => l.Label)
                .ToListAsync();

            return Ok(level4Items);
        }

        // Remove or modify the GetAccountsByType endpoint if you don't need it
        // Or keep it for other use cases
        [HttpGet("accounts/{accountType}")]
        public async Task<ActionResult<IEnumerable<DropdownDTO>>> GetAccountsByType(string accountType)
        {
            var query = _context.Level4.Where(l => l.Title4 != null);

            switch (accountType.ToLower())
            {
                case "stock":
                    query = query.Where(l => l.Title4.Contains("Stock") || l.LID4.StartsWith("23"));
                    break;
                case "income":
                    query = query.Where(l => l.Title4.Contains("Income") || l.Title4.Contains("Sales") || l.LID4.StartsWith("41"));
                    break;
                case "expense":
                    query = query.Where(l => l.Title4.Contains("Expense") || l.Title4.Contains("Cost") || l.LID4.StartsWith("51"));
                    break;
                default:
                    // Return all if no specific type is matched
                    break;
            }

            var accounts = await query
                .Select(l => new DropdownDTO
                {
                    Value = l.ID,
                    Label = l.Title4
                })
                .OrderBy(l => l.Label)
                .ToListAsync();

            return Ok(accounts);
        }

        // New endpoint to get all Level4 accounts without filtering
        [HttpGet("all-accounts")]
        public async Task<ActionResult<IEnumerable<DropdownDTO>>> GetAllAccounts()
        {
            var accounts = await _context.Level4
                .Where(l => l.Title4 != null)
                .Select(l => new DropdownDTO
                {
                    Value = l.ID,
                    Label = l.Title4
                })
                .OrderBy(l => l.Label)
                .ToListAsync();

            return Ok(accounts);
        }
    }
}