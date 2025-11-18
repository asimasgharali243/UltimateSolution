using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ItemController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemResponseDTO>>> GetItems()
        {
            var items = await _context.Items
                .Include(i => i.ItemGroup)
                .Include(i => i.ItemCategory)
                .Include(i => i.ItemUnit)
                .Include(i => i.StockAssetAccount)
                .Include(i => i.IncomeAccount)
                .Include(i => i.ExpenseAccount)
                .Select(i => new ItemResponseDTO
                {
                    ItemID = i.ItemID,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    GroupID = i.GroupID,
                    GroupName = i.ItemGroup != null ? i.ItemGroup.GroupName : null,
                    CategoryID = i.CategoryID,
                    CategoryName = i.ItemCategory != null ? i.ItemCategory.CategoryName : null,
                    PRate = i.PRate,
                    SRate = i.SRate,
                    MinLevel = i.MinLevel,
                    Date = i.Date,
                    OpeningQuantity = i.OpeningQuantity,
                    OpeningRate = i.OpeningRate,
                    LowStockLevel = i.LowStockLevel,
                    StockAssetAccountID = i.StockAssetAccountID,
                    StockAssetAccountName = i.StockAssetAccount != null ? i.StockAssetAccount.Title4 : null,
                    IncomeAccountID = i.IncomeAccountID,
                    IncomeAccountName = i.IncomeAccount != null ? i.IncomeAccount.Title4 : null,
                    ExpenseAccountID = i.ExpenseAccountID,
                    ExpenseAccountName = i.ExpenseAccount != null ? i.ExpenseAccount.Title4 : null,
                    UnitID = i.UnitID,
                    UnitName = i.ItemUnit != null ? i.ItemUnit.UnitName : null,
                    Notes = i.Notes
                })
                .OrderBy(i => i.ItemName)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemResponseDTO>> GetItem(int id)
        {
            var item = await _context.Items
                .Include(i => i.ItemGroup)
                .Include(i => i.ItemCategory)
                .Include(i => i.ItemUnit)
                .Include(i => i.StockAssetAccount)
                .Include(i => i.IncomeAccount)
                .Include(i => i.ExpenseAccount)
                .Where(i => i.ItemID == id)
                .Select(i => new ItemResponseDTO
                {
                    ItemID = i.ItemID,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    GroupID = i.GroupID,
                    GroupName = i.ItemGroup != null ? i.ItemGroup.GroupName : null,
                    CategoryID = i.CategoryID,
                    CategoryName = i.ItemCategory != null ? i.ItemCategory.CategoryName : null,
                    PRate = i.PRate,
                    SRate = i.SRate,
                    MinLevel = i.MinLevel,
                    Date = i.Date,
                    OpeningQuantity = i.OpeningQuantity,
                    OpeningRate = i.OpeningRate,
                    LowStockLevel = i.LowStockLevel,
                    StockAssetAccountID = i.StockAssetAccountID,
                    StockAssetAccountName = i.StockAssetAccount != null ? i.StockAssetAccount.Title4 : null,
                    IncomeAccountID = i.IncomeAccountID,
                    IncomeAccountName = i.IncomeAccount != null ? i.IncomeAccount.Title4 : null,
                    ExpenseAccountID = i.ExpenseAccountID,
                    ExpenseAccountName = i.ExpenseAccount != null ? i.ExpenseAccount.Title4 : null,
                    UnitID = i.UnitID,
                    UnitName = i.ItemUnit != null ? i.ItemUnit.UnitName : null,
                    Notes = i.Notes
                })
                .FirstOrDefaultAsync();

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }

        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem(ItemCreateDTO itemDto)
        {
            // Validate required fields
            if (string.IsNullOrEmpty(itemDto.ItemName))
            {
                return BadRequest("Item name is required");
            }

            if (string.IsNullOrEmpty(itemDto.ItemCode))
            {
                return BadRequest("Item code is required");
            }

            var item = new Item
            {
                ItemCode = itemDto.ItemCode,
                ItemName = itemDto.ItemName,
                GroupID = itemDto.GroupID,
                CategoryID = itemDto.CategoryID,
                PRate = itemDto.PRate,
                SRate = itemDto.SRate,
                MinLevel = itemDto.MinLevel,
                Date = itemDto.Date,
                OpeningQuantity = itemDto.OpeningQuantity,
                OpeningRate = itemDto.OpeningRate,
                LowStockLevel = itemDto.LowStockLevel,
                StockAssetAccountID = itemDto.StockAssetAccountID,
                IncomeAccountID = itemDto.IncomeAccountID,
                ExpenseAccountID = itemDto.ExpenseAccountID,
                UnitID = itemDto.UnitID,
                Notes = itemDto.Notes,
                CreatedBy = itemDto.CreatedBy,
                CreatedDT = DateTime.UtcNow
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.ItemID }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, ItemUpdateDTO itemDto)
        {


            if (id != itemDto.ItemID)
            {
                return BadRequest("ID mismatch");
            }

            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            // Validate required fields
            if (string.IsNullOrEmpty(itemDto.ItemName))
            {
                return BadRequest("Item name is required");
            }

            if (string.IsNullOrEmpty(itemDto.ItemCode))
            {
                return BadRequest("Item code is required");
            }

            item.ItemCode = itemDto.ItemCode;
            item.ItemName = itemDto.ItemName;
            item.GroupID = itemDto.GroupID;
            item.CategoryID = itemDto.CategoryID;
            item.PRate = itemDto.PRate;
            item.SRate = itemDto.SRate;
            item.MinLevel = itemDto.MinLevel;
            item.Date = itemDto.Date;
            item.OpeningQuantity = itemDto.OpeningQuantity;
            item.OpeningRate = itemDto.OpeningRate;
            item.LowStockLevel = itemDto.LowStockLevel;
            item.StockAssetAccountID = itemDto.StockAssetAccountID;
            item.IncomeAccountID = itemDto.IncomeAccountID;
            item.ExpenseAccountID = itemDto.ExpenseAccountID;
            item.UnitID = itemDto.UnitID;
            item.Notes = itemDto.Notes;
            item.ModifyBy = itemDto.ModifyBy;
            item.ModifyDT = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemExists(int id)
        {
            return _context.Items.Any(e => e.ItemID == id);
        }
    }
}