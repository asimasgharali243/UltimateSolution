using Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IRateService
    {
        Task<RateHotel?> GetHotelRate(int cityID, int hotelID);
        Task<decimal?> GetRateByRoomType(int cityID, int hotelID, string roomType);
        Task<List<RateHotel>> GetRatesByCity(int cityID);
        Task<List<Hotel>> GetHotelsWithRates(int cityID);
    }
}