using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Add authorization
    public class PurchaseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchaseController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper method to get current user ID
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            
            // Fallback: try to get from other claim types
            userIdClaim = User.FindFirst("userId")?.Value;
            if (int.TryParse(userIdClaim, out userId))
            {
                return userId;
            }
            
            // If still not found, return 1 as default (you might want to handle this differently)
            return 1;
        }

        // POST: api/purchase
        [HttpPost]
        public async Task<ActionResult<PurchaseMasterDTO>> CreatePurchase(CreatePurchaseRequest request)
        {
            try
            {
                // Get current user ID
                var currentUserId = GetCurrentUserId();

                // Validate items exist
                var itemIds = request.PurchaseDetails.Select(pd => pd.itemID).ToList();
                var existingItems = await _context.Items
                    .Where(i => itemIds.Contains(i.ItemID))
                    .Select(i => i.ItemID)
                    .ToListAsync();

                var missingItems = itemIds.Except(existingItems).ToList();
                if (missingItems.Any())
                {
                    return BadRequest(new { message = $"Items not found: {string.Join(", ", missingItems)}" });
                }

                // Get next voucher number
                var lastVNo = await _context.PurchaseMasters
                    .OrderByDescending(p => p.vNo)
                    .Select(p => p.vNo)
                    .FirstOrDefaultAsync();

                var vNo = lastVNo + 1;

                // Calculate totals - convert decimal to appropriate database types
                var totalAmount = (int)Math.Round(request.PurchaseDetails.Sum(pd => pd.qty * pd.price) * 100);
                var totalQty = (int)Math.Round(request.PurchaseDetails.Sum(pd => pd.qty) * 100);
                var netTotal = (int)Math.Round((request.PurchaseDetails.Sum(pd => pd.qty * pd.price) - request.lessDiscount + request.addFreight) * 100);

                var purchaseMaster = new PurchaseMaster
                {
                    vNo = vNo,
                    date = request.date,
                    accountID = request.accountID,
                    notes = request.notes,
                    totalAmount = totalAmount,
                    totalQty = totalQty,
                    lessDiscount = (int)Math.Round(request.lessDiscount * 100),
                    addFreight = (int)Math.Round(request.addFreight * 100),
                    netTotal = netTotal,
                    createdBy = currentUserId, // Use the actual user ID from authentication
                    createdDT = DateTime.Now
                };

                // Add purchase details - convert decimal to float
                foreach (var detail in request.PurchaseDetails)
                {
                    purchaseMaster.PurchaseDetails.Add(new PurchaseDetail
                    {
                        itemID = detail.itemID,
                        itemRemarks = detail.itemRemarks,
                        qty = (float)detail.qty,
                        price = (float)detail.price
                    });
                }

                _context.PurchaseMasters.Add(purchaseMaster);
                await _context.SaveChangesAsync();

                // Return created purchase - convert back to decimal for DTO
                var createdPurchase = new PurchaseMasterDTO
                {
                    masterID = purchaseMaster.masterID,
                    vNo = purchaseMaster.vNo,
                    date = purchaseMaster.date,
                    accountID = purchaseMaster.accountID,
                    notes = purchaseMaster.notes,
                    totalAmount = purchaseMaster.totalAmount / 100m,
                    totalQty = purchaseMaster.totalQty / 100m,
                    lessDiscount = purchaseMaster.lessDiscount / 100m,
                    addFreight = purchaseMaster.addFreight / 100m,
                    netTotal = purchaseMaster.netTotal / 100m,
                    PurchaseDetails = purchaseMaster.PurchaseDetails.Select(pd => new PurchaseDetailDTO
                    {
                        id = pd.id,
                        masterID = pd.masterID,
                        itemID = pd.itemID,
                        itemRemarks = pd.itemRemarks,
                        qty = (decimal)pd.qty,
                        price = (decimal)pd.price
                    }).ToList()
                };

                return CreatedAtAction(nameof(GetPurchase), new { id = purchaseMaster.masterID }, createdPurchase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating purchase", error = ex.Message });
            }
        }

        // Other methods remain the same...
        // GET: api/purchase/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseMasterDTO>> GetPurchase(int id)
        {
            try
            {
                var purchase = await _context.PurchaseMasters
                    .Include(p => p.Account)
                    .Include(p => p.PurchaseDetails)
                        .ThenInclude(pd => pd.Item)
                    .Where(p => p.masterID == id)
                    .Select(p => new PurchaseMasterDTO
                    {
                        masterID = p.masterID,
                        vNo = p.vNo,
                        date = p.date,
                        accountID = p.accountID,
                        AccountName = p.Account.accountTitle,
                        notes = p.notes,
                        totalAmount = p.totalAmount / 100m,
                        totalQty = p.totalQty / 100m,
                        lessDiscount = p.lessDiscount / 100m,
                        addFreight = p.addFreight / 100m,
                        netTotal = p.netTotal / 100m,
                        PurchaseDetails = p.PurchaseDetails.Select(pd => new PurchaseDetailDTO
                        {
                            id = pd.id,
                            masterID = pd.masterID,
                            itemID = pd.itemID,
                            itemRemarks = pd.itemRemarks,
                            qty = (decimal)pd.qty,
                            price = (decimal)pd.price,
                            ItemName = pd.Item.ItemName,
                            ItemCode = pd.Item.ItemCode
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (purchase == null)
                {
                    return NotFound(new { message = "Purchase not found" });
                }

                return Ok(purchase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving purchase", error = ex.Message });
            }
        }

        // GET: api/purchase
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseMasterDTO>>> GetPurchases()
        {
            try
            {
                var purchases = await _context.PurchaseMasters
                    .Include(p => p.Account)
                    .Include(p => p.PurchaseDetails)
                        .ThenInclude(pd => pd.Item)
                    .OrderByDescending(p => p.date)
                    .Select(p => new PurchaseMasterDTO
                    {
                        masterID = p.masterID,
                        vNo = p.vNo,
                        date = p.date,
                        accountID = p.accountID,
                        AccountName = p.Account.accountTitle,
                        notes = p.notes,
                        totalAmount = p.totalAmount / 100m,
                        totalQty = p.totalQty / 100m,
                        lessDiscount = p.lessDiscount / 100m,
                        addFreight = p.addFreight / 100m,
                        netTotal = p.netTotal / 100m,
                        PurchaseDetails = p.PurchaseDetails.Select(pd => new PurchaseDetailDTO
                        {
                            id = pd.id,
                            masterID = pd.masterID,
                            itemID = pd.itemID,
                            itemRemarks = pd.itemRemarks,
                            qty = (decimal)pd.qty,
                            price = (decimal)pd.price,
                            ItemName = pd.Item.ItemName,
                            ItemCode = pd.Item.ItemCode
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(purchases);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving purchases", error = ex.Message });
            }
        }

        // DELETE: api/purchase/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchase(int id)
        {
            try
            {
                var purchase = await _context.PurchaseMasters
                    .Include(p => p.PurchaseDetails)
                    .FirstOrDefaultAsync(p => p.masterID == id);

                if (purchase == null)
                {
                    return NotFound(new { message = "Purchase not found" });
                }

                _context.PurchaseDetails.RemoveRange(purchase.PurchaseDetails);
                _context.PurchaseMasters.Remove(purchase);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Purchase deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting purchase", error = ex.Message });
            }
        }

        // GET: api/purchase/voucher-numbers
        [HttpGet("voucher-numbers")]
        public async Task<ActionResult<IEnumerable<object>>> GetVoucherNumbers()
        {
            try
            {
                var voucherNumbers = await _context.PurchaseMasters
                    .OrderByDescending(p => p.vNo)
                    .Select(p => new { value = p.vNo, label = $"Voucher #{p.vNo}" })
                    .ToListAsync();

                return Ok(voucherNumbers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving voucher numbers", error = ex.Message });
            }
        }
    }
}