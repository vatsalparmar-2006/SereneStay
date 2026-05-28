using Microsoft.EntityFrameworkCore;
using HotelManagementSystem.Models;

namespace HotelManagementSystem.Helper
{
    public static class PaginationHelper
    {
        public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
        this IQueryable<T> query, int pageNumber, int pageSize)
        {
            var totalRecords = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResponse<T>(items, totalRecords, pageNumber, pageSize);
        }
    }
}
