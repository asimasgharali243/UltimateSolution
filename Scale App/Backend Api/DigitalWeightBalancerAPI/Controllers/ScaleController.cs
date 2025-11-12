using Microsoft.AspNetCore.Mvc;
using DigitalWeightBalancerAPI.Data;
using DigitalWeightBalancerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DigitalWeightBalancerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScanController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ScanController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ✅ Upload / Sync Scan Data
        [HttpPost("sync")]
        public async Task<IActionResult> SyncScanData([FromForm] ScanUploadRequest request)
        {
            string? imagePath = null;

            if (request.Image != null)
            {
                var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.Image.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Image.CopyToAsync(stream);
                }

                imagePath = $"/uploads/{fileName}";
            }

            var scan = new Scan
            {
                datetime = DateTime.Now,
                product_name = request.ProductName,
                type = request.Type,
                weight_value = request.WeightValue,
                quantity = request.Quantity,
                image_uri = imagePath,
                input_token = request.InputToken,
                output_token = request.OutputToken,
                total_token = request.TotalToken,
                sync_status = true
            };

            _context.tblScan.Add(scan);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Scan data synced successfully", scan });
        }

        // ✅ Get All Scans
        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var scans = await _context.tblScan
                .OrderByDescending(s => s.datetime)
                .ToListAsync();

            return Ok(scans);
        }

// ✅ Get Products for Sync





    }

    public class ScanUploadRequest
    {
        public string ProductName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? WeightValue { get; set; }
        public int? Quantity { get; set; }
        public string? InputToken { get; set; }
        public string? OutputToken { get; set; }
        public string? TotalToken { get; set; }
        public IFormFile? Image { get; set; }
    }
}
