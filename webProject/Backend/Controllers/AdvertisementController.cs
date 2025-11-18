// Backend/Controllers/AdvertisementController.cs
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
    public class AdvertisementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdvertisementController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("masters")]
        public async Task<ActionResult<ApiResponse<List<MasterResponseDto>>>> GetMasters()
        {
            try
            {
                var masters = await _context.Masters
                    .Include(m => m.Account)
                    .Include(m => m.CreatedByUser)
                    .Include(m => m.ModifiedByUser)
                    .Include(m => m.Details)
                    .OrderByDescending(m => m.billDate)
                    .ThenByDescending(m => m.masterID)
                    .ToListAsync();

                var masterDtos = masters.Select(MapToMasterResponseDto).ToList();
                return Ok(ApiResponse<List<MasterResponseDto>>.SuccessResult(masterDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<List<MasterResponseDto>>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("masters/{id}")]
        public async Task<ActionResult<ApiResponse<MasterResponseDto>>> GetMaster(int id)
        {
            try
            {
                var master = await _context.Masters
                    .Include(m => m.Account)
                    .Include(m => m.CreatedByUser)
                    .Include(m => m.ModifiedByUser)
                    .Include(m => m.Details)
                    .FirstOrDefaultAsync(m => m.masterID == id);

                if (master == null)
                    return NotFound(ApiResponse<MasterResponseDto>.ErrorResult("Master not found"));

                var masterDto = MapToMasterResponseDto(master);
                return Ok(ApiResponse<MasterResponseDto>.SuccessResult(masterDto));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPost("masters")]
        public async Task<ActionResult<ApiResponse<MasterResponseDto>>> CreateMaster([FromBody] MasterCreateDto masterDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult("Invalid model state"));

                var vNoExists = await _context.Masters.AnyAsync(m => m.vNo == masterDto.vNo);
                if (vNoExists)
                    return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult("Voucher number already exists"));

                var master = new Master
                {
                    vNo = masterDto.vNo,
                    billNo = masterDto.billNo,
                    billDate = masterDto.billDate,
                    roNo = masterDto.roNo,
                    roDate = masterDto.roDate,
                    Notes = masterDto.Notes,
                    accountID = masterDto.accountID,
                    agencyName = masterDto.agencyName,
                    pID = masterDto.pID,
                    caption = masterDto.caption,
                    frontPageExtra = masterDto.frontPageExtra,
                    backPageExtra = masterDto.backPageExtra,
                    comission = masterDto.comission,
                    createdBy = masterDto.createdBy,
                    createdDT = DateTime.UtcNow
                };

                foreach (var detailDto in masterDto.Details)
                {
                    master.Details.Add(new Detail
                    {
                        inserationDate = detailDto.inserationDate,
                        color = detailDto.color,
                        size = detailDto.size,
                        totalSpace = detailDto.totalSpace,
                        position = detailDto.position,
                        rate = detailDto.rate
                    });
                }

                _context.Masters.Add(master);
                await _context.SaveChangesAsync();

                var createdMaster = await _context.Masters
                    .Include(m => m.Account)
                    .Include(m => m.CreatedByUser)
                    .Include(m => m.ModifiedByUser)
                    .Include(m => m.Details)
                    .FirstOrDefaultAsync(m => m.masterID == master.masterID);

                var responseDto = MapToMasterResponseDto(createdMaster!);
                return CreatedAtAction(nameof(GetMaster), new { id = master.masterID }, 
                    ApiResponse<MasterResponseDto>.SuccessResult(responseDto, "Master created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPut("masters/{id}")]
        public async Task<ActionResult<ApiResponse<MasterResponseDto>>> UpdateMaster(int id, [FromBody] MasterUpdateDto masterDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult("Invalid model state"));

                var master = await _context.Masters
                    .Include(m => m.Details)
                    .FirstOrDefaultAsync(m => m.masterID == id);

                if (master == null)
                    return NotFound(ApiResponse<MasterResponseDto>.ErrorResult("Master not found"));

                var vNoExists = await _context.Masters.AnyAsync(m => m.vNo == masterDto.vNo && m.masterID != id);
                if (vNoExists)
                    return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult("Voucher number already exists"));

                // Update master properties
                master.vNo = masterDto.vNo;
                master.billNo = masterDto.billNo;
                master.billDate = masterDto.billDate;
                master.roNo = masterDto.roNo;
                master.roDate = masterDto.roDate;
                master.Notes = masterDto.Notes;
                master.accountID = masterDto.accountID;
                master.agencyName = masterDto.agencyName;
                master.pID = masterDto.pID;
                master.caption = masterDto.caption;
                master.frontPageExtra = masterDto.frontPageExtra;
                master.backPageExtra = masterDto.backPageExtra;
                master.comission = masterDto.comission;
                master.modifyBy = masterDto.modifyBy;
                master.modifyDT = DateTime.UtcNow;

                // Update details
                _context.Details.RemoveRange(master.Details);
                foreach (var detailDto in masterDto.Details)
                {
                    master.Details.Add(new Detail
                    {
                        inserationDate = detailDto.inserationDate,
                        color = detailDto.color,
                        size = detailDto.size,
                        totalSpace = detailDto.totalSpace,
                        position = detailDto.position,
                        rate = detailDto.rate
                    });
                }

                await _context.SaveChangesAsync();

                var updatedMaster = await _context.Masters
                    .Include(m => m.Account)
                    .Include(m => m.CreatedByUser)
                    .Include(m => m.ModifiedByUser)
                    .Include(m => m.Details)
                    .FirstOrDefaultAsync(m => m.masterID == id);

                var responseDto = MapToMasterResponseDto(updatedMaster!);
                return Ok(ApiResponse<MasterResponseDto>.SuccessResult(responseDto, "Master updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<MasterResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpDelete("masters/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteMaster(int id)
        {
            try
            {
                var master = await _context.Masters.FindAsync(id);
                if (master == null)
                    return NotFound(ApiResponse<bool>.ErrorResult("Master not found"));

                _context.Masters.Remove(master);
                await _context.SaveChangesAsync();

                return Ok(ApiResponse<bool>.SuccessResult(true, "Master deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("masters/check-vno/{vNo}")]
        public async Task<ActionResult<ApiResponse<bool>>> CheckVNoExists(int vNo, [FromQuery] int? excludeId = null)
        {
            try
            {
                bool exists;
                if (excludeId.HasValue)
                {
                    exists = await _context.Masters.AnyAsync(m => m.vNo == vNo && m.masterID != excludeId.Value);
                }
                else
                {
                    exists = await _context.Masters.AnyAsync(m => m.vNo == vNo);
                }

                return Ok(ApiResponse<bool>.SuccessResult(exists, "VNo check completed"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("accounts")]
        public async Task<ActionResult<ApiResponse<List<AccountResponseDto>>>> GetAccounts()
        {
            try
            {
                var accounts = await _context.Accounts
                    .OrderBy(a => a.accountTitle)
                    .ToListAsync();

                var accountDtos = accounts.Select(a => new AccountResponseDto
                {
                    accountID = a.accountID,
                    accountType = a.accountType,
                    accountTitle = a.accountTitle,
                    city = a.city,
                    address = a.address,
                    contactPersonName = a.contactPersonName,
                    contactPersonMobile = a.contactPersonMobile,
                    contactPersonWhatsapp = a.contactPersonWhatsapp,
                    contactPersonEmail = a.contactPersonEmail,
                    creditLimit = a.creditLimit,
                    creditDays = a.creditDays,
                    cnic = a.cnic,
                    ntn = a.ntn,
                    stn = a.stn,
                    openingBalance = a.openingBalance,
                    openingBalanceDate = a.openingBalanceDate
                }).ToList();

                return Ok(ApiResponse<List<AccountResponseDto>>.SuccessResult(accountDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<List<AccountResponseDto>>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("accounts/search")]
        public async Task<ActionResult<ApiResponse<List<AccountResponseDto>>>> SearchAccounts([FromQuery] string term)
        {
            try
            {
                var accounts = await _context.Accounts
                    .Where(a => a.accountTitle!.Contains(term) || 
                               a.contactPersonMobile!.Contains(term) || 
                               a.contactPersonName!.Contains(term))
                    .OrderBy(a => a.accountTitle)
                    .Take(10)
                    .ToListAsync();

                var accountDtos = accounts.Select(a => new AccountResponseDto
                {
                    accountID = a.accountID,
                    accountType = a.accountType,
                    accountTitle = a.accountTitle,
                    city = a.city,
                    address = a.address,
                    contactPersonName = a.contactPersonName,
                    contactPersonMobile = a.contactPersonMobile,
                    contactPersonWhatsapp = a.contactPersonWhatsapp,
                    contactPersonEmail = a.contactPersonEmail,
                    creditLimit = a.creditLimit,
                    creditDays = a.creditDays,
                    cnic = a.cnic,
                    ntn = a.ntn,
                    stn = a.stn,
                    openingBalance = a.openingBalance,
                    openingBalanceDate = a.openingBalanceDate
                }).ToList();

                return Ok(ApiResponse<List<AccountResponseDto>>.SuccessResult(accountDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<List<AccountResponseDto>>.ErrorResult(ex.Message));
            }
        }

        private MasterResponseDto MapToMasterResponseDto(Master master)
        {
            // Calculate advertisement amount from details
            var advertisementAmount = master.Details.Sum(d => {
                var spaceValue = 0;
                if (int.TryParse(System.Text.RegularExpressions.Regex.Match(d.totalSpace ?? "", @"\d+").Value, out int result))
                {
                    spaceValue = result;
                }
                return d.rate * spaceValue;
            });

            var frontPageExtraAmount = (advertisementAmount * master.frontPageExtra) / 100;
            var backPageExtraAmount = (advertisementAmount * master.backPageExtra) / 100;
            var extrasAmount = frontPageExtraAmount + backPageExtraAmount;
            var grossTotal = advertisementAmount + extrasAmount;
            var netAmount = grossTotal - master.comission;

            return new MasterResponseDto
            {
                masterID = master.masterID,
                vNo = master.vNo,
                billNo = master.billNo,
                billDate = master.billDate,
                roNo = master.roNo,
                roDate = master.roDate,
                Notes = master.Notes,
                accountID = master.accountID,
                agencyName = master.agencyName,
                pID = master.pID,
                caption = master.caption,
                frontPageExtra = master.frontPageExtra,
                backPageExtra = master.backPageExtra,
                comission = master.comission,
                createdDT = master.createdDT,
                modifyDT = master.modifyDT,
                
                // Account details
                AccountTitle = master.Account?.accountTitle,
                AccountContactPerson = master.Account?.contactPersonName,
                AccountContactMobile = master.Account?.contactPersonMobile,
                AccountCity = master.Account?.city,
                
                Details = master.Details.Select(d => new DetailResponseDto
                {
                    id = d.id,
                    masterID = d.masterID,
                    inserationDate = d.inserationDate,
                    color = d.color,
                    size = d.size,
                    totalSpace = d.totalSpace,
                    position = d.position,
                    rate = d.rate
                }).ToList(),
                TotalAmount = advertisementAmount,
                ExtrasAmount = (int)extrasAmount,
                GrossTotal = (int)grossTotal,
                NetAmount = (int)netAmount
            };
        }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse<T> SuccessResult(T data, string message = "Success")
        {
            return new ApiResponse<T> { Success = true, Message = message, Data = data };
        }

        public static ApiResponse<T> ErrorResult(string message, List<string>? errors = null)
        {
            return new ApiResponse<T> { Success = false, Message = message, Errors = errors };
        }
    }
}