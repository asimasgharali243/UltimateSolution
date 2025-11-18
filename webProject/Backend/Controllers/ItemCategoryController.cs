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
    [ApiController]
    [Route("api/[controller]")]
    public class ItemCategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ItemCategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ItemCategoryApiResponse<List<ItemCategoryResponseDto>>>> GetItemCategories()
        {
            try
            {
                var itemCategories = await _context.ItemCategories
                    .Include(ic => ic.ItemGroup)
                    .Include(ic => ic.CreatedByUser)
                    .Include(ic => ic.ModifiedByUser)
                    .OrderBy(ic => ic.CategoryName)
                    .ToListAsync();

                var itemCategoryDtos = itemCategories.Select(MapToItemCategoryResponseDto).ToList();
                return Ok(ItemCategoryApiResponse<List<ItemCategoryResponseDto>>.SuccessResult(itemCategoryDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<List<ItemCategoryResponseDto>>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemCategoryApiResponse<ItemCategoryResponseDto>>> GetItemCategory(int id)
        {
            try
            {
                var itemCategory = await _context.ItemCategories
                    .Include(ic => ic.ItemGroup)
                    .Include(ic => ic.CreatedByUser)
                    .Include(ic => ic.ModifiedByUser)
                    .FirstOrDefaultAsync(ic => ic.CategoryID == id);

                if (itemCategory == null)
                    return NotFound(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Item category not found"));

                var itemCategoryDto = MapToItemCategoryResponseDto(itemCategory);
                return Ok(ItemCategoryApiResponse<ItemCategoryResponseDto>.SuccessResult(itemCategoryDto));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPost]
        public async Task<ActionResult<ItemCategoryApiResponse<ItemCategoryResponseDto>>> CreateItemCategory([FromBody] ItemCategoryCreateDto itemCategoryDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Invalid model state", errors));
                }

                // Check if category code already exists
                var categoryCodeExists = await _context.ItemCategories.AnyAsync(ic => ic.CategoryCode == itemCategoryDto.CategoryCode);
                if (categoryCodeExists)
                    return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Category code already exists"));

                // Check if item group exists
                var itemGroupExists = await _context.ItemGroups.AnyAsync(ig => ig.GroupID == itemCategoryDto.GroupID);
                if (!itemGroupExists)
                    return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Item group not found"));

                var itemCategory = new ItemCategory
                {
                    CategoryCode = itemCategoryDto.CategoryCode.Trim(),
                    CategoryName = itemCategoryDto.CategoryName.Trim(),
                    GroupID = itemCategoryDto.GroupID,
                    CreatedBy = itemCategoryDto.CreatedBy,
                    CreatedDT = DateTime.UtcNow
                };

                _context.ItemCategories.Add(itemCategory);
                await _context.SaveChangesAsync();

                var createdItemCategory = await _context.ItemCategories
                    .Include(ic => ic.ItemGroup)
                    .Include(ic => ic.CreatedByUser)
                    .Include(ic => ic.ModifiedByUser)
                    .FirstOrDefaultAsync(ic => ic.CategoryID == itemCategory.CategoryID);

                var responseDto = MapToItemCategoryResponseDto(createdItemCategory!);
                return CreatedAtAction(nameof(GetItemCategory), new { id = itemCategory.CategoryID }, 
                    ItemCategoryApiResponse<ItemCategoryResponseDto>.SuccessResult(responseDto, "Item category created successfully"));
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ItemCategoryApiResponse<ItemCategoryResponseDto>>> UpdateItemCategory(int id, [FromBody] ItemCategoryUpdateDto itemCategoryDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Invalid model state", errors));
                }

                var itemCategory = await _context.ItemCategories.FindAsync(id);
                if (itemCategory == null)
                    return NotFound(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Item category not found"));

                // Check if category code already exists (excluding current item category)
                var categoryCodeExists = await _context.ItemCategories.AnyAsync(ic => ic.CategoryCode == itemCategoryDto.CategoryCode && ic.CategoryID != id);
                if (categoryCodeExists)
                    return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Category code already exists"));

                // Check if item group exists
                var itemGroupExists = await _context.ItemGroups.AnyAsync(ig => ig.GroupID == itemCategoryDto.GroupID);
                if (!itemGroupExists)
                    return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult("Item group not found"));

                itemCategory.CategoryCode = itemCategoryDto.CategoryCode.Trim();
                itemCategory.CategoryName = itemCategoryDto.CategoryName.Trim();
                itemCategory.GroupID = itemCategoryDto.GroupID;
                itemCategory.ModifyBy = itemCategoryDto.ModifyBy;
                itemCategory.ModifyDT = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedItemCategory = await _context.ItemCategories
                    .Include(ic => ic.ItemGroup)
                    .Include(ic => ic.CreatedByUser)
                    .Include(ic => ic.ModifiedByUser)
                    .FirstOrDefaultAsync(ic => ic.CategoryID == id);

                var responseDto = MapToItemCategoryResponseDto(updatedItemCategory!);
                return Ok(ItemCategoryApiResponse<ItemCategoryResponseDto>.SuccessResult(responseDto, "Item category updated successfully"));
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<ItemCategoryResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ItemCategoryApiResponse<bool>>> DeleteItemCategory(int id)
        {
            try
            {
                var itemCategory = await _context.ItemCategories.FindAsync(id);
                if (itemCategory == null)
                    return NotFound(ItemCategoryApiResponse<bool>.ErrorResult("Item category not found"));

                _context.ItemCategories.Remove(itemCategory);
                await _context.SaveChangesAsync();

                return Ok(ItemCategoryApiResponse<bool>.SuccessResult(true, "Item category deleted successfully"));
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest(ItemCategoryApiResponse<bool>.ErrorResult($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<bool>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("check-code/{categoryCode}")]
        public async Task<ActionResult<ItemCategoryApiResponse<CheckCodeResponseDto>>> CheckCategoryCodeExists(string categoryCode, [FromQuery] int? excludeId = null)
        {
            try
            {
                bool exists;
                if (excludeId.HasValue)
                {
                    exists = await _context.ItemCategories.AnyAsync(ic => ic.CategoryCode == categoryCode && ic.CategoryID != excludeId.Value);
                }
                else
                {
                    exists = await _context.ItemCategories.AnyAsync(ic => ic.CategoryCode == categoryCode);
                }

                var response = new CheckCodeResponseDto 
                { 
                    exists = exists,
                    message = exists ? "Category code already exists" : "Category code is available"
                };
                
                return Ok(ItemCategoryApiResponse<CheckCodeResponseDto>.SuccessResult(response, "Category code check completed"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<CheckCodeResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("by-group/{groupId}")]
        public async Task<ActionResult<ItemCategoryApiResponse<List<ItemCategoryResponseDto>>>> GetCategoriesByGroup(int groupId)
        {
            try
            {
                var itemCategories = await _context.ItemCategories
                    .Include(ic => ic.ItemGroup)
                    .Include(ic => ic.CreatedByUser)
                    .Include(ic => ic.ModifiedByUser)
                    .Where(ic => ic.GroupID == groupId)
                    .OrderBy(ic => ic.CategoryName)
                    .ToListAsync();

                var itemCategoryDtos = itemCategories.Select(MapToItemCategoryResponseDto).ToList();
                return Ok(ItemCategoryApiResponse<List<ItemCategoryResponseDto>>.SuccessResult(itemCategoryDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemCategoryApiResponse<List<ItemCategoryResponseDto>>.ErrorResult(ex.Message));
            }
        }

        private ItemCategoryResponseDto MapToItemCategoryResponseDto(ItemCategory itemCategory)
        {
            return new ItemCategoryResponseDto
            {
                CategoryID = itemCategory.CategoryID,
                CategoryCode = itemCategory.CategoryCode,
                CategoryName = itemCategory.CategoryName,
                GroupID = itemCategory.GroupID,
                CreatedBy = itemCategory.CreatedBy,
                CreatedDT = itemCategory.CreatedDT,
                ModifyBy = itemCategory.ModifyBy,
                ModifyDT = itemCategory.ModifyDT,
                
                // Item Group details
                GroupCode = itemCategory.ItemGroup?.GroupCode,
                GroupName = itemCategory.ItemGroup?.GroupName,
                GroupActive = itemCategory.ItemGroup?.Active,
                
                // User details
                CreatedByName = itemCategory.CreatedByUser?.UserFullName,
                ModifiedByName = itemCategory.ModifiedByUser?.UserFullName
            };
        }
    }

    public class ItemCategoryApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ItemCategoryApiResponse<T> SuccessResult(T data, string message = "Success")
        {
            return new ItemCategoryApiResponse<T> { Success = true, Message = message, Data = data };
        }

        public static ItemCategoryApiResponse<T> ErrorResult(string message, List<string>? errors = null)
        {
            return new ItemCategoryApiResponse<T> { Success = false, Message = message, Errors = errors };
        }
    }
}