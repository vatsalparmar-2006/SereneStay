
using HotelManagementSystem.Models;

public interface IAuthService
{
    string GenerateJwtToken(Staff staff);
    Task<object?> LoginAsync(string username, string password);
}