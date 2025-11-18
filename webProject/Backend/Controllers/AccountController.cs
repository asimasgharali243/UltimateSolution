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
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("check-name/{accountTitle}")]
        public async Task<ActionResult<AccountApiResponse<AccountCheckNameDto>>> CheckAccountTitleExists(string accountTitle)
        {
            try
            {
                if (string.IsNullOrEmpty(accountTitle))
                {
                    return BadRequest(AccountApiResponse<AccountCheckNameDto>.ErrorResult("Account title is required"));
                }

                var exists = await _context.Accounts
                    .AnyAsync(a => a.accountTitle.ToLower() == accountTitle.ToLower());

                return Ok(AccountApiResponse<AccountCheckNameDto>.SuccessResult(
                    new AccountCheckNameDto
                    {
                        exists = exists,
                        message = exists ? "Account title already exists" : "Account title is available"
                    },
                    "Account title check completed"
                ));
            }
            catch (Exception ex)
            {
                return BadRequest(AccountApiResponse<AccountCheckNameDto>.ErrorResult($"Error checking account title: {ex.Message}"));
            }
        }

        [HttpGet]
        public async Task<ActionResult<AccountApiResponse<List<AccountResponseDto>>>> GetAccounts()
        {
            try
            {
                var accounts = await _context.Accounts
                    .Include(a => a.CreatedByUser)
                    .Include(a => a.ModifiedByUser)
                    .OrderByDescending(a => a.createdDT)
                    .ToListAsync();

                var accountDtos = accounts.Select(MapToAccountResponseDto).ToList();
                return Ok(AccountApiResponse<List<AccountResponseDto>>.SuccessResult(accountDtos));
            }
            catch (Exception ex)
            {
                return BadRequest(AccountApiResponse<List<AccountResponseDto>>.ErrorResult(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AccountApiResponse<AccountResponseDto>>> GetAccount(int id)
        {
            try
            {
                var account = await _context.Accounts
                    .Include(a => a.CreatedByUser)
                    .Include(a => a.ModifiedByUser)
                    .FirstOrDefaultAsync(a => a.accountID == id);

                if (account == null)
                    return NotFound(AccountApiResponse<AccountResponseDto>.ErrorResult("Account not found"));

                var accountDto = MapToAccountResponseDto(account);
                return Ok(AccountApiResponse<AccountResponseDto>.SuccessResult(accountDto));
            }
            catch (Exception ex)
            {
                return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult(ex.Message));
            }
        }

        [HttpPost]
        public async Task<ActionResult<AccountApiResponse<AccountResponseDto>>> CreateAccount([FromBody] AccountCreateDto accountDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult("Invalid model state", errors));
                }

                // Check for duplicate account title
                var titleExists = await _context.Accounts
                    .AnyAsync(a => a.accountTitle.ToLower() == accountDto.accountTitle.ToLower());
                
                if (titleExists)
                {
                    return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult($"Account with title '{accountDto.accountTitle}' already exists"));
                }

                var account = new Account
                {
                    accountType = accountDto.accountType,
                    accountTitle = accountDto.accountTitle.Trim(),
                    city = accountDto.city,
                    address = accountDto.address,
                    title = accountDto.title,
                    contactPersonName = accountDto.contactPersonName,
                    contactPersonMobile = accountDto.contactPersonMobile,
                    contactPersonWhatsapp = accountDto.contactPersonWhatsapp,
                    contactPersonEmail = accountDto.contactPersonEmail,
                    creditLimit = accountDto.creditLimit,
                    creditDays = accountDto.creditDays,
                    cnic = accountDto.cnic,
                    ntn = accountDto.ntn,
                    stn = accountDto.stn,
                    openingBalance = accountDto.openingBalance,
                    notes = accountDto.notes,
                    openingBalanceDate = accountDto.openingBalanceDate,
                    createdBy = accountDto.createdBy,
                    createdDT = DateTime.UtcNow,
                    LID4 = accountDto.LID4
                };

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                // Reload the account with user information
                var createdAccount = await _context.Accounts
                    .Include(a => a.CreatedByUser)
                    .Include(a => a.ModifiedByUser)
                    .FirstOrDefaultAsync(a => a.accountID == account.accountID);

                var responseDto = MapToAccountResponseDto(createdAccount!);
                return CreatedAtAction(nameof(GetAccount), new { id = account.accountID }, 
                    AccountApiResponse<AccountResponseDto>.SuccessResult(responseDto, "Account created successfully"));
            }
            catch (DbUpdateException dbEx)
            {
                // Handle database-specific exceptions
                return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}"));
            }
            catch (Exception ex)
            {
                return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult($"Error creating account: {ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AccountApiResponse<AccountResponseDto>>> UpdateAccount(int id, [FromBody] AccountUpdateDto accountDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult("Invalid model state", errors));
                }

                var account = await _context.Accounts.FindAsync(id);
                if (account == null)
                    return NotFound(AccountApiResponse<AccountResponseDto>.ErrorResult("Account not found"));

                // Check for duplicate account title (excluding current account)
                var titleExists = await _context.Accounts
                    .AnyAsync(a => a.accountID != id && a.accountTitle.ToLower() == accountDto.accountTitle.ToLower());
                
                if (titleExists)
                {
                    return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult($"Account with title '{accountDto.accountTitle}' already exists"));
                }

                // Update account properties
                account.accountType = accountDto.accountType;
                account.accountTitle = accountDto.accountTitle.Trim();
                account.city = accountDto.city;
                account.address = accountDto.address;
                account.title = accountDto.title;
                account.contactPersonName = accountDto.contactPersonName;
                account.contactPersonMobile = accountDto.contactPersonMobile;
                account.contactPersonWhatsapp = accountDto.contactPersonWhatsapp;
                account.contactPersonEmail = accountDto.contactPersonEmail;
                account.creditLimit = accountDto.creditLimit;
                account.creditDays = accountDto.creditDays;
                account.cnic = accountDto.cnic;
                account.ntn = accountDto.ntn;
                account.stn = accountDto.stn;
                account.openingBalance = accountDto.openingBalance;
                account.notes = accountDto.notes;
                account.openingBalanceDate = accountDto.openingBalanceDate;
                account.modifyBy = accountDto.modifyBy;
                account.modifyDT = DateTime.UtcNow;
                account.LID4 = accountDto.LID4;

                await _context.SaveChangesAsync();

                var updatedAccount = await _context.Accounts
                    .Include(a => a.CreatedByUser)
                    .Include(a => a.ModifiedByUser)
                    .FirstOrDefaultAsync(a => a.accountID == id);

                var responseDto = MapToAccountResponseDto(updatedAccount!);
                return Ok(AccountApiResponse<AccountResponseDto>.SuccessResult(responseDto, "Account updated successfully"));
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}"));
            }
            catch (Exception ex)
            {
                return BadRequest(AccountApiResponse<AccountResponseDto>.ErrorResult($"Error updating account: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<AccountApiResponse<bool>>> DeleteAccount(int id)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(id);
                if (account == null)
                    return NotFound(AccountApiResponse<bool>.ErrorResult("Account not found"));

                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();

                return Ok(AccountApiResponse<bool>.SuccessResult(true, "Account deleted successfully"));
            }
            catch (DbUpdateException dbEx)
            {
                return BadRequest(AccountApiResponse<bool>.ErrorResult($"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}"));
            }
            catch (Exception ex)
            {
                return BadRequest(AccountApiResponse<bool>.ErrorResult($"Error deleting account: {ex.Message}"));
            }
        }

        private AccountResponseDto MapToAccountResponseDto(Account account)
        {
            return new AccountResponseDto
            {
                accountID = account.accountID,
                accountType = account.accountType,
                accountTitle = account.accountTitle,
                city = account.city,
                address = account.address,
                title = account.title,
                contactPersonName = account.contactPersonName,
                contactPersonMobile = account.contactPersonMobile,
                contactPersonWhatsapp = account.contactPersonWhatsapp,
                contactPersonEmail = account.contactPersonEmail,
                creditLimit = account.creditLimit,
                creditDays = account.creditDays,
                cnic = account.cnic,
                ntn = account.ntn,
                stn = account.stn,
                openingBalance = account.openingBalance,
                notes = account.notes,
                openingBalanceDate = account.openingBalanceDate,
                createdBy = account.createdBy,
                createdDT = account.createdDT,
                modifyBy = account.modifyBy,
                modifyDT = account.modifyDT,
                LID4 = account.LID4,
                // Use PascalCase property names to match User model
                CreatedByUserName = account.CreatedByUser?.UserName ?? string.Empty,
                CreatedByUserFullName = account.CreatedByUser?.UserFullName ?? string.Empty,
                ModifiedByUserName = account.ModifiedByUser?.UserName ?? string.Empty,
                ModifiedByUserFullName = account.ModifiedByUser?.UserFullName ?? string.Empty
            };
        }
    }

    // Response class specific to Account controller to avoid conflicts
    public class AccountApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static AccountApiResponse<T> SuccessResult(T data, string message = "Success")
        {
            return new AccountApiResponse<T> { Success = true, Message = message, Data = data };
        }

        public static AccountApiResponse<T> ErrorResult(string message, List<string>? errors = null)
        {
            return new AccountApiResponse<T> { Success = false, Message = message, Errors = errors };
        }
    }
}