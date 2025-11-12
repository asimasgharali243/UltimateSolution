using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class RateService : IRateService
    {
        private readonly ApplicationDbContext _context;

        public RateService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RateHotel?> GetHotelRate(int cityID, int hotelID)
        {
            return await _context.RateHotels
                .Include(r => r.City)
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.cityID == cityID && r.hotelID == hotelID);
        }

        public async Task<decimal?> GetRateByRoomType(int cityID, int hotelID, string roomType)
        {
            var rateHotel = await GetHotelRate(cityID, hotelID);
            
            if (rateHotel == null)
                return null;

            return roomType.ToLower() switch
            {
                "sharing" => rateHotel.sharing,
                "quint" => rateHotel.quint,
                "quad" => rateHotel.quad,
                "triple" => rateHotel.triple,
                "doble" => rateHotel.doble,
                _ => rateHotel.sharing
            };
        }

        public async Task<List<RateHotel>> GetRatesByCity(int cityID)
        {
            return await _context.RateHotels
                .Include(r => r.Hotel)
                .Where(r => r.cityID == cityID)
                .ToListAsync();
        }

        public async Task<List<Hotel>> GetHotelsWithRates(int cityID)
        {
            return await _context.Hotels
                .Where(h => h.cityID == cityID)
                .ToListAsync();
        }
    }
}