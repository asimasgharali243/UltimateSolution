// Backend/Controllers/ItemGroupController.cs
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
    public class ItemGroupController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ItemGroupController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ItemGroupApiResponse<List<ItemGroupResponseDto>>>> GetItemGroups()
        {
            try
            {
                var itemGroups = await _context.ItemGroups
                    .Include(ig => ig.CreatedByUser)
                    .Include(ig => ig.ModifiedByUser)
                    .OrderBy(ig => ig.GroupName)
                    .ToListAsync();

                var itemGroupDtos = itemGroups.Select(MapToItemGroupResponseDto).ToList();
                return Ok(ItemGroupApiResponse<List<ItemGroupResponseDto>>.SuccessResult(itemGroupDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemGroupApiResponse<List<ItemGroupResponseDto>>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemGroupApiResponse<ItemGroupResponseDto>>> GetItemGroup(int id)
        {
            try
            {
                var itemGroup = await _context.ItemGroups
                    .Include(ig => ig.CreatedByUser)
                    .Include(ig => ig.ModifiedByUser)
                    .FirstOrDefaultAsync(ig => ig.GroupID == id);

                if (itemGroup == null)
                    return NotFound(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult("Item group not found"));

                var itemGroupDto = MapToItemGroupResponseDto(itemGroup);
                return Ok(ItemGroupApiResponse<ItemGroupResponseDto>.SuccessResult(itemGroupDto));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPost]
        public async Task<ActionResult<ItemGroupApiResponse<ItemGroupResponseDto>>> CreateItemGroup([FromBody] ItemGroupCreateDto itemGroupDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult("Invalid model state"));

                // Check if group code already exists
                var groupCodeExists = await _context.ItemGroups.AnyAsync(ig => ig.GroupCode == itemGroupDto.GroupCode);
                if (groupCodeExists)
                    return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult("Group code already exists"));

                var itemGroup = new ItemGroup
                {
                    GroupCode = itemGroupDto.GroupCode,
                    GroupName = itemGroupDto.GroupName,
                    Active = itemGroupDto.Active,
                    CreatedBy = itemGroupDto.CreatedBy,
                    CreatedDT = DateTime.UtcNow
                };

                _context.ItemGroups.Add(itemGroup);
                await _context.SaveChangesAsync();

                var createdItemGroup = await _context.ItemGroups
                    .Include(ig => ig.CreatedByUser)
                    .Include(ig => ig.ModifiedByUser)
                    .FirstOrDefaultAsync(ig => ig.GroupID == itemGroup.GroupID);

                var responseDto = MapToItemGroupResponseDto(createdItemGroup!);
                return CreatedAtAction(nameof(GetItemGroup), new { id = itemGroup.GroupID }, 
                    ItemGroupApiResponse<ItemGroupResponseDto>.SuccessResult(responseDto, "Item group created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ItemGroupApiResponse<ItemGroupResponseDto>>> UpdateItemGroup(int id, [FromBody] ItemGroupUpdateDto itemGroupDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult("Invalid model state"));

                var itemGroup = await _context.ItemGroups.FindAsync(id);
                if (itemGroup == null)
                    return NotFound(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult("Item group not found"));

                // Check if group code already exists (excluding current item group)
                var groupCodeExists = await _context.ItemGroups.AnyAsync(ig => ig.GroupCode == itemGroupDto.GroupCode && ig.GroupID != id);
                if (groupCodeExists)
                    return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult("Group code already exists"));

                itemGroup.GroupCode = itemGroupDto.GroupCode;
                itemGroup.GroupName = itemGroupDto.GroupName;
                itemGroup.Active = itemGroupDto.Active;
                itemGroup.ModifyBy = itemGroupDto.ModifyBy;
                itemGroup.ModifyDT = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedItemGroup = await _context.ItemGroups
                    .Include(ig => ig.CreatedByUser)
                    .Include(ig => ig.ModifiedByUser)
                    .FirstOrDefaultAsync(ig => ig.GroupID == id);

                var responseDto = MapToItemGroupResponseDto(updatedItemGroup!);
                return Ok(ItemGroupApiResponse<ItemGroupResponseDto>.SuccessResult(responseDto, "Item group updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemGroupApiResponse<ItemGroupResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ItemGroupApiResponse<bool>>> DeleteItemGroup(int id)
        {
            try
            {
                var itemGroup = await _context.ItemGroups.FindAsync(id);
                if (itemGroup == null)
                    return NotFound(ItemGroupApiResponse<bool>.ErrorResult("Item group not found"));

                _context.ItemGroups.Remove(itemGroup);
                await _context.SaveChangesAsync();

                return Ok(ItemGroupApiResponse<bool>.SuccessResult(true, "Item group deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemGroupApiResponse<bool>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("check-code/{groupCode}")]
        public async Task<ActionResult<ItemGroupApiResponse<bool>>> CheckGroupCodeExists(string groupCode, [FromQuery] int? excludeId = null)
        {
            try
            {
                bool exists;
                if (excludeId.HasValue)
                {
                    exists = await _context.ItemGroups.AnyAsync(ig => ig.GroupCode == groupCode && ig.GroupID != excludeId.Value);
                }
                else
                {
                    exists = await _context.ItemGroups.AnyAsync(ig => ig.GroupCode == groupCode);
                }

                return Ok(ItemGroupApiResponse<bool>.SuccessResult(exists, "Group code check completed"));
            }
            catch (Exception ex)
            {
                return BadRequest(ItemGroupApiResponse<bool>.ErrorResult(ex.Message));
            }
        }

        private ItemGroupResponseDto MapToItemGroupResponseDto(ItemGroup itemGroup)
        {
            return new ItemGroupResponseDto
            {
                GroupID = itemGroup.GroupID,
                GroupCode = itemGroup.GroupCode,
                GroupName = itemGroup.GroupName,
                Active = itemGroup.Active,
                CreatedBy = itemGroup.CreatedBy,
                CreatedDT = itemGroup.CreatedDT,
                ModifyBy = itemGroup.ModifyBy,
                ModifyDT = itemGroup.ModifyDT,
                CreatedByName = itemGroup.CreatedByUser?.UserFullName,
                ModifiedByName = itemGroup.ModifiedByUser?.UserFullName
            };
        }
    }

    // Renamed to avoid conflict with other ApiResponse classes
    public class ItemGroupApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ItemGroupApiResponse<T> SuccessResult(T data, string message = "Success")
        {
            return new ItemGroupApiResponse<T> { Success = true, Message = message, Data = data };
        }

        public static ItemGroupApiResponse<T> ErrorResult(string message, List<string>? errors = null)
        {
            return new ItemGroupApiResponse<T> { Success = false, Message = message, Errors = errors };
        }
    }
}