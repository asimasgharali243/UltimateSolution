using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConsumerWebAPI.Data;
using ConsumerWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConsumerWebAPI.Controllers
{
    /// <summary>
    /// 📘 Controller responsible for generating and fetching report data.
    /// Contains endpoints for bill previews and other reporting-related operations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// ✅ Fetch Bill Preview Report for a specific Consumer ID and Date.
        /// </summary>
        /// <param name="id">The Consumer ID (e.g. 1, 2, 3...)</param>
        /// <param name="date">Billing date in MM-dd-yyyy or MM/dd/yyyy format (e.g. 10-19-2025)</param>
        /// <returns>Returns a list of bill preview records fetched from stored procedure `sp_rptBillPreview`.</returns>
        /// 
        /// <remarks>
        /// **Example Request:**
        /// 
        /// ```
        /// GET /api/report/bill-preview/1/10-19-2025
        /// ```
        /// 
        /// **Example Response:**
        /// ```json
        /// [
        ///   {
        ///     "id": 1,
        ///     "consumerName": "John Doe",
        ///     "contactPerson": "Ali Khan",
        ///     "currentReadingPeak": 123.45,
        ///     "unitConsumedPeak": 100,
        ///     "currentBill": 2500.00
        ///   }
        /// ]
        /// ```
        /// 
        /// - The endpoint automatically converts dates with either slashes `/` or dashes `-`.
        /// - Returns `400 Bad Request` if date format is invalid.
        /// - Returns `404 Not Found` if no records are found.
        /// - Returns `500 Internal Server Error` if a server issue occurs.
        /// </remarks>
        /// 
        /// <response code="200">Bill preview records successfully retrieved</response>
        /// <response code="400">Invalid date format</response>
        /// <response code="404">No records found</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("bill-preview/{id}/{date}")]
        public async Task<ActionResult<IEnumerable<BillPreview>>> GetBillPreview(int id, string date)
        {
            try
            {
                // 🔹 Normalize date format — allow both MM-dd-yyyy and MM/dd/yyyy
                date = date.Replace("-", "/");

                // 🔹 Validate date input
                if (!DateTime.TryParse(date, out DateTime parsedDate))
                    return BadRequest("Invalid date format. Use MM/dd/yyyy or MM-dd-yyyy.");

                // 🔹 Execute stored procedure (sp_rptBillPreview)
                var result = await _context.BillPreviews
                    .FromSqlInterpolated($"EXEC sp_rptBillPreview {id}, {parsedDate}")
                    .ToListAsync();

                // 🔹 Check if result is empty
                if (result == null || result.Count == 0)
                    return NotFound("No records found for the given parameters.");

                // 🔹 Return successful response
                return Ok(result);
            }
            catch (Exception ex)
            {
                // 🔹 Handle unexpected server errors
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }
        // Inside ReportController
// Example: GET /api/report/account-ledger/1/10-19-2025/10-19-2025
[HttpGet("account-ledger/{accountNo}/{dateFrom}/{dateTo}")]
public async Task<ActionResult<IEnumerable<AccountLedger>>> GetAccountLedger(string accountNo, string dateFrom, string dateTo)
{
    try
    {
        // Allow both MM-dd-yyyy and MM/dd/yyyy
        dateFrom = dateFrom.Replace("-", "/");
        dateTo = dateTo.Replace("-", "/");

        if (!DateTime.TryParse(dateFrom, out DateTime parsedFrom))
            return BadRequest("Invalid DateFrom format. Use MM/dd/yyyy or MM-dd-yyyy.");

        if (!DateTime.TryParse(dateTo, out DateTime parsedTo))
            return BadRequest("Invalid DateTo format. Use MM/dd/yyyy or MM-dd-yyyy.");

        var result = await _context.Set<AccountLedger>()
            .FromSqlInterpolated($"EXEC rptAccountLedger {accountNo}, {parsedFrom}, {parsedTo}")
            .ToListAsync();

        if (result == null || result.Count == 0)
            return NotFound("No records found for the given parameters.");

        return Ok(result);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Server error: {ex.Message}");
    }
}

    }
}
